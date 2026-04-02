import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { mcpServers } from "@datatorag-mcp/db";
import {
  PLUGIN_SERVICE_MAP,
  getServiceToken,
} from "@/gateway/service-token";

const NAMESPACE_SEPARATOR = "__";

// POST /api/playground/call
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    tool: string;
    arguments?: Record<string, unknown>;
  };

  const { tool: namespacedName, arguments: args = {} } = body;
  if (!namespacedName) {
    return NextResponse.json(
      { error: "Missing tool parameter" },
      { status: 400 }
    );
  }

  const sepIdx = namespacedName.indexOf(NAMESPACE_SEPARATOR);
  if (sepIdx === -1) {
    return NextResponse.json(
      { error: `Invalid tool name: ${namespacedName}` },
      { status: 400 }
    );
  }

  const serverSlug = namespacedName.slice(0, sepIdx);
  const toolName = namespacedName.slice(sepIdx + NAMESPACE_SEPARATOR.length);

  const [mcpServer] = await db
    .select({
      id: mcpServers.id,
      containerPort: mcpServers.containerPort,
      githubRepoUrl: mcpServers.githubRepoUrl,
    })
    .from(mcpServers)
    .where(eq(mcpServers.slug, serverSlug))
    .limit(1);

  if (!mcpServer) {
    return NextResponse.json(
      { error: `Unknown server: ${serverSlug}` },
      { status: 400 }
    );
  }

  // Resolve user token
  const requiredService = PLUGIN_SERVICE_MAP[serverSlug];
  if (!requiredService) {
    return NextResponse.json(
      { error: `No service mapping for ${serverSlug}` },
      { status: 400 }
    );
  }

  const userToken = await getServiceToken(db, userId, requiredService);
  if (!userToken) {
    return NextResponse.json(
      {
        error:
          "Service not connected. Please connect from the dashboard first.",
      },
      { status: 403 }
    );
  }

  // Build plugin URL
  const serverUrl = mcpServer.githubRepoUrl
    ? `http://localhost:${mcpServer.containerPort}/mcp`
    : `http://dtrmcp-server-${serverSlug}:${mcpServer.containerPort}/mcp`;

  try {
    const transport = new StreamableHTTPClientTransport(
      new URL(serverUrl),
      { requestInit: { headers: { "X-User-Token": userToken } } }
    );
    const client = new Client(
      { name: "datatorag-playground", version: "0.1.0" },
      { capabilities: {} }
    );

    await client.connect(transport);
    const result = await client.callTool({
      name: toolName,
      arguments: args,
    });
    await client.close();

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
