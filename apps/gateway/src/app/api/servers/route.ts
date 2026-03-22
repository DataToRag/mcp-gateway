import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getPluginManager } from "@/lib/plugin-manager";
import { mcpServers, tools, users } from "@datatorag-mcp/db";

// POST /api/servers — install a plugin from GitHub
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { githubRepoUrl, slug, envVars } = body as {
    githubRepoUrl?: string;
    slug?: string;
    envVars?: Record<string, string>;
  };

  if (!githubRepoUrl) {
    return NextResponse.json(
      { error: "githubRepoUrl is required" },
      { status: 400 }
    );
  }

  // TODO: get userId from session
  const [user] = await db.select().from(users).limit(1);

  try {
    const pm = getPluginManager();
    const result = await pm.install({
      githubRepoUrl,
      slug,
      envVars,
      submittedByUserId: user?.id,
    });
    return NextResponse.json(
      { id: result.id, slug: result.slug, status: "pending" },
      { status: 202 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

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

// DELETE /api/servers?slug=xxx — uninstall a plugin
export async function DELETE(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    const pm = getPluginManager();
    await pm.uninstall(slug);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
