import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpServers, tools } from "@datatorag-mcp/db";

// GET /api/servers — list all servers with tool counts
export async function GET() {
  const servers = await db
    .select({
      id: mcpServers.id,
      slug: mcpServers.slug,
      name: mcpServers.name,
      description: mcpServers.description,
      githubRepoUrl: mcpServers.githubRepoUrl,
      status: mcpServers.status,
      buildError: mcpServers.buildError,
      containerPort: mcpServers.containerPort,
      manifestJson: mcpServers.manifestJson,
      toolCount: sql<number>`count(${tools.id})::int`,
      createdAt: mcpServers.createdAt,
    })
    .from(mcpServers)
    .leftJoin(tools, eq(tools.mcpServerId, mcpServers.id))
    .groupBy(mcpServers.id)
    .orderBy(mcpServers.createdAt);

  return NextResponse.json({ servers });
}

