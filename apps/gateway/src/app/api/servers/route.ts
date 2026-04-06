import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { mcpServers, tools } from "@datatorag-mcp/db";

// GET /api/servers — list all servers with tool counts (authenticated)
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const servers = await db
    .select({
      slug: mcpServers.slug,
      name: mcpServers.name,
      description: mcpServers.description,
      status: mcpServers.status,
      toolCount: sql<number>`count(${tools.id})::int`,
    })
    .from(mcpServers)
    .leftJoin(tools, eq(tools.mcpServerId, mcpServers.id))
    .groupBy(mcpServers.id)
    .orderBy(mcpServers.createdAt);

  return NextResponse.json({ servers });
}
