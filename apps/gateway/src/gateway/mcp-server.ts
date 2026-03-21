import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { eq } from "drizzle-orm";
import type { Database } from "@datatorag-mcp/db";
import { tools, mcpServers } from "@datatorag-mcp/db";
import type { ConnectionPool } from "./pool.js";

const NAMESPACE_SEPARATOR = "__";

/**
 * Creates a new MCP Server instance for a client session.
 * Dynamically serves tools from the registry and routes calls to backend containers.
 * Falls back to a built-in echo tool when no backend servers are registered.
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
    // Fetch all enabled tools from active servers
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

    // Always include the built-in echo tool
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

    // Built-in echo tool
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

    // Parse namespace: serverSlug__toolName
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

    // Look up the backend server
    const [mcpServer] = await db
      .select({
        id: mcpServers.id,
        slug: mcpServers.slug,
        containerPort: mcpServers.containerPort,
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

    // Build the URL for the backend container
    // In production (gateway in Docker): use container hostname on shared network
    // In local dev (gateway on host): use DOCKER_HOST_OVERRIDE (host:port)
    const dockerHostOverride = process.env.DOCKER_HOST_OVERRIDE;
    let serverUrl: string;
    if (dockerHostOverride) {
      serverUrl = `http://${dockerHostOverride}/mcp`;
    } else {
      serverUrl = `http://dtrmcp-server-${mcpServer.slug}:${mcpServer.containerPort}/mcp`;
    }
    console.log(`[route] ${name} → ${serverUrl} (override=${dockerHostOverride ?? "none"})`);

    try {
      console.log(`[route] ${name} → ${serverUrl} (tool: ${toolName})`);
      // Acquire a pooled connection and forward the call
      const client = await pool.acquire(mcpServer.id, serverUrl);
      try {
        const result = await client.callTool({
          name: toolName,
          arguments: args as Record<string, unknown>,
        });
        return result;
      } finally {
        pool.release(mcpServer.id, client);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      const stack =
        error instanceof Error ? error.stack : "";
      console.error(`[route-error] ${serverSlug}/${toolName} @ ${serverUrl}:`, message);
      if (stack) console.error(stack);
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
