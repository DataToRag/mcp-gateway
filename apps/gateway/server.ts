import next from "next";
import express from "express";
import { randomUUID } from "node:crypto";
import { eq, and, gt, isNull, or } from "drizzle-orm";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./src/gateway/mcp-server.js";
import { ConnectionPool } from "./src/gateway/pool.js";
import { createDb, oauthAccessTokens } from "@datatorag-mcp/db";
import { ApiKeyValidator } from "@datatorag-mcp/auth";
import { getEnv } from "@datatorag-mcp/config";
import { createMetadataRouter } from "./src/gateway/oauth/metadata.js";
import { createRegisterRouter } from "./src/gateway/oauth/register.js";
import { createAuthorizeRouter } from "./src/gateway/oauth/authorize.js";
import { createTokenRouter } from "./src/gateway/oauth/token.js";
import { getPluginManager } from "./src/lib/plugin-manager.js";

const dev = process.env.NODE_ENV !== "production";

async function main() {
  const nextApp = next({ dev });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  const env = getEnv();
  const db = createDb(env.DATABASE_URL);
  const pool = new ConnectionPool();
  const apiKeyValidator = new ApiKeyValidator(db);
  const baseUrl = env.GATEWAY_BASE_URL;

  // Initialize plugin manager and start all active plugins
  const pluginManager = getPluginManager(db, pool);
  await pluginManager.startAll();

  const shutdown = async () => {
    console.log("Shutting down...");
    await pluginManager.stopAll();
    await pool.drain();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  const app = express();

  // Body parsing scoped to gateway API routes only.
  // Next.js API routes (e.g. /api/keys) need the raw stream, so we must NOT
  // apply express.json() globally.
  app.use("/oauth", express.json(), express.urlencoded({ extended: true }));
  app.use("/mcp", express.json());

  // OAuth2 authorization server routes
  app.use(createMetadataRouter(baseUrl));
  app.use(createRegisterRouter(db));
  app.use(
    createAuthorizeRouter(db, {
      googleClientId: env.GOOGLE_CLIENT_ID,
      googleClientSecret: env.GOOGLE_CLIENT_SECRET,
      baseUrl,
    })
  );
  app.use(createTokenRouter(db));

  // Session store
  const sessions = new Map<
    string,
    {
      server: ReturnType<typeof createMcpServer>;
      transport: StreamableHTTPServerTransport;
    }
  >();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  /**
   * Validate a Bearer token — checks API keys first, then OAuth tokens.
   * Returns userId if valid, null if not.
   */
  async function validateBearer(
    rawToken: string
  ): Promise<{ userId: string } | null> {
    // Try API key first (sk-dtrmcp_ prefix)
    if (rawToken.startsWith("sk-dtrmcp_")) {
      const result = await apiKeyValidator.validate(rawToken);
      if (result.valid && result.userId) {
        return { userId: result.userId };
      }
      return null;
    }

    // Try OAuth access token
    const [token] = await db
      .select({ userId: oauthAccessTokens.userId })
      .from(oauthAccessTokens)
      .where(
        and(
          eq(oauthAccessTokens.token, rawToken),
          isNull(oauthAccessTokens.revokedAt),
          or(
            isNull(oauthAccessTokens.expiresAt),
            gt(oauthAccessTokens.expiresAt, new Date())
          )
        )
      )
      .limit(1);

    if (!token) return null;

    return { userId: token.userId };
  }

  // MCP endpoint
  app.all("/mcp", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      // Per MCP spec: return 401 with resource metadata URL
      res.status(401).json({
        error: "unauthorized",
        resource_metadata: `${baseUrl}/.well-known/oauth-authorization-server`,
      });
      return;
    }

    const rawToken = authHeader.slice(7);
    const auth = await validateBearer(rawToken);
    if (!auth) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    // Existing session — route GET/DELETE/POST to the stored transport
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId)!;
      await session.transport.handleRequest(req, res, req.body);
      return;
    }

    // New session — only POST can initialize
    if (req.method === "POST") {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          sessions.set(id, { server, transport });
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          sessions.delete(transport.sessionId);
        }
      };

      const server = createMcpServer(auth.userId, db, pool);
      await server.connect(transport);

      await transport.handleRequest(req, res, req.body);
      return;
    }

    res.status(400).json({ error: "Invalid or missing session" });
  });

  // Next.js handles all other routes (pages, API routes, static assets)
  app.all("/{*path}", (req, res) => {
    return handle(req, res);
  });

  const port = env.GATEWAY_PORT;
  app.listen(port, () => {
    console.log(`DataToRAG MCP listening on port ${port}`);
    console.log(
      `OAuth metadata: ${baseUrl}/.well-known/oauth-authorization-server`
    );
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
