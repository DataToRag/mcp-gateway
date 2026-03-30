import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { eq, and } from "drizzle-orm";
import type { Database } from "@datatorag-mcp/db";
import {
  tools,
  mcpServers,
  pluginConnections,
  serviceConnections,
} from "@datatorag-mcp/db";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { ConnectionPool } from "./pool.js";
import { NAMESPACE_SEPARATOR } from "./plugin-manager.js";

/** Mapping from plugin slug to the service connection it needs. */
const PLUGIN_SERVICE_MAP: Record<string, string> = {
  "gws-mcp": "google-workspace",
};

/**
 * Refresh a Google access token using the stored refresh token.
 * Returns the new access token, or null if refresh fails.
 */
async function refreshGoogleToken(
  db: Database,
  connectionId: string,
  refreshToken: string
): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      access_token: string;
      expires_in?: number;
    };

    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : null;

    await db
      .update(serviceConnections)
      .set({
        accessToken: data.access_token,
        tokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(serviceConnections.id, connectionId));

    return data.access_token;
  } catch {
    return null;
  }
}

/**
 * Get a valid access token for a user's service connection.
 * Refreshes if expired and refresh token is available.
 */
async function getServiceToken(
  db: Database,
  userId: string,
  service: string
): Promise<string | null> {
  const [conn] = await db
    .select()
    .from(serviceConnections)
    .where(
      and(
        eq(serviceConnections.userId, userId),
        eq(serviceConnections.service, service)
      )
    )
    .limit(1);

  if (!conn) return null;

  // Check if token is expired
  const isExpired =
    conn.tokenExpiresAt && conn.tokenExpiresAt.getTime() < Date.now();

  if (!isExpired) return conn.accessToken;

  // Try to refresh
  if (conn.refreshToken) {
    const newToken = await refreshGoogleToken(
      db,
      conn.id,
      conn.refreshToken
    );
    if (newToken) return newToken;
  }

  return null;
}

/**
 * Creates a new MCP Server instance for a client session.
 * Dynamically serves tools from the registry and routes calls to backend
 * processes (local plugins) or Docker containers.
 */
export function createMcpServer(
  userId: string,
  db: Database,
  pool: ConnectionPool
): Server {
  const server = new Server(
    { name: "datatorag-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const registeredTools = await db
      .select({
        namespacedName: tools.namespacedName,
        description: tools.description,
        inputSchemaJson: tools.inputSchemaJson,
      })
      .from(tools)
      .innerJoin(mcpServers, eq(tools.mcpServerId, mcpServers.id))
      .where(eq(mcpServers.status, "active"));

    const toolList = registeredTools.map((t) => ({
      name: t.namespacedName,
      description: t.description ?? "",
      inputSchema: (t.inputSchemaJson as Record<string, unknown>) ?? {
        type: "object" as const,
        properties: {},
      },
    }));

    toolList.push({
      name: "echo",
      description:
        "Echo back the input message. A built-in test tool to verify the gateway is working.",
      inputSchema: {
        type: "object" as const,
        properties: {
          message: {
            type: "string",
            description: "The message to echo back",
          },
        },
        required: ["message"],
      },
    });

    return { tools: toolList };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "echo") {
      const message = (args as Record<string, unknown>)?.message;
      return {
        content: [
          {
            type: "text" as const,
            text: `[datatorag-mcp echo] ${message ?? "(no message)"}`,
          },
        ],
      };
    }

    const separatorIndex = name.indexOf(NAMESPACE_SEPARATOR);
    if (separatorIndex === -1) {
      return {
        content: [
          { type: "text" as const, text: `Unknown tool: ${name}` },
        ],
        isError: true,
      };
    }

    const serverSlug = name.slice(0, separatorIndex);
    const toolName = name.slice(separatorIndex + NAMESPACE_SEPARATOR.length);

    const [mcpServer] = await db
      .select({
        id: mcpServers.id,
        slug: mcpServers.slug,
        containerPort: mcpServers.containerPort,
        githubRepoUrl: mcpServers.githubRepoUrl,
      })
      .from(mcpServers)
      .where(eq(mcpServers.slug, serverSlug))
      .limit(1);

    if (!mcpServer) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Unknown server: ${serverSlug}`,
          },
        ],
        isError: true,
      };
    }

    // Build URL
    let serverUrl: string;
    const dockerHostOverride = process.env.DOCKER_HOST_OVERRIDE;
    if (mcpServer.githubRepoUrl) {
      serverUrl = `http://localhost:${mcpServer.containerPort}/mcp`;
    } else if (dockerHostOverride) {
      serverUrl = `http://${dockerHostOverride}/mcp`;
    } else {
      serverUrl = `http://dtrmcp-server-${mcpServer.slug}:${mcpServer.containerPort}/mcp`;
    }

    // Look up per-user token: first check service connections, then legacy plugin connections
    let userToken: string | null = null;

    const requiredService = PLUGIN_SERVICE_MAP[mcpServer.slug];
    if (requiredService) {
      userToken = await getServiceToken(db, userId, requiredService);
      if (!userToken) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Google Workspace is not connected. Please connect it from the dashboard at /dashboard/connections before using ${serverSlug} tools.`,
            },
          ],
          isError: true,
        };
      }
    } else if (mcpServer.githubRepoUrl) {
      // Legacy: check pluginConnections table
      const [conn] = await db
        .select({ accessToken: pluginConnections.accessToken })
        .from(pluginConnections)
        .where(
          and(
            eq(pluginConnections.userId, userId),
            eq(pluginConnections.mcpServerId, mcpServer.id)
          )
        )
        .limit(1);
      if (conn) {
        userToken = conn.accessToken;
      }
    }

    console.log(
      `[route] ${name} → ${serverUrl} (tool: ${toolName}, token: ${userToken ? "yes" : "no"})`
    );

    try {
      let result;
      if (userToken) {
        // One-shot client with user token header
        const transport = new StreamableHTTPClientTransport(
          new URL(serverUrl),
          { requestInit: { headers: { "X-User-Token": userToken } } }
        );
        const oneShotClient = new Client(
          { name: "datatorag-mcp", version: "0.1.0" },
          { capabilities: {} }
        );
        try {
          await oneShotClient.connect(transport);
          result = await oneShotClient.callTool({
            name: toolName,
            arguments: args as Record<string, unknown>,
          });
        } finally {
          await oneShotClient.close();
        }
      } else {
        // No user token — use the shared connection pool
        const pooledClient = await pool.acquire(mcpServer.id, serverUrl);
        try {
          result = await pooledClient.callTool({
            name: toolName,
            arguments: args as Record<string, unknown>,
          });
        } finally {
          pool.release(mcpServer.id, pooledClient);
        }
      }
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[route-error] ${serverSlug}/${toolName} @ ${serverUrl}:`,
        message
      );
      return {
        content: [
          {
            type: "text" as const,
            text: `Error calling ${serverSlug}/${toolName}: ${message}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
