import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpServers, users } from "@datatorag-mcp/db";
import type { McpGatewayManifest } from "@datatorag-mcp/types";

interface Props {
  params: Promise<{ slug: string }>;
}

// GET /api/servers/:slug/connect — initiate OAuth for a plugin
export async function GET(request: NextRequest, { params }: Props) {
  const { slug } = await params;

  // TODO: get userId from session
  const [user] = await db.select().from(users).limit(1);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [server] = await db
    .select({
      id: mcpServers.id,
      manifestJson: mcpServers.manifestJson,
    })
    .from(mcpServers)
    .where(eq(mcpServers.slug, slug))
    .limit(1);

  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const manifest = server.manifestJson as McpGatewayManifest | null;
  if (!manifest?.oauth) {
    return NextResponse.json(
      { error: "This plugin does not require OAuth" },
      { status: 400 }
    );
  }

  const { oauth } = manifest;

  // Resolve client ID from gateway env
  const clientId = process.env[oauth.clientIdEnv];
  if (!clientId) {
    return NextResponse.json(
      { error: `Missing env var: ${oauth.clientIdEnv}` },
      { status: 500 }
    );
  }

  const baseUrl = process.env.GATEWAY_BASE_URL ?? "http://localhost:8285";
  const redirectUri = `${baseUrl}/api/servers/${slug}/connect/callback`;

  // Encode state with userId + slug for the callback
  const state = Buffer.from(
    JSON.stringify({ userId: user.id, slug, serverId: server.id })
  ).toString("base64url");

  const authorizeUrl = new URL(oauth.authorizeUrl);
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", oauth.scopes.join(" "));
  authorizeUrl.searchParams.set("state", state);

  // Forward extra authorize params from the manifest (e.g. access_type, prompt)
  const knownKeys = new Set(["provider", "authorizeUrl", "tokenUrl", "clientIdEnv", "clientSecretEnv", "scopes"]);
  for (const [key, value] of Object.entries(oauth)) {
    if (!knownKeys.has(key) && typeof value === "string") {
      authorizeUrl.searchParams.set(key, value);
    }
  }

  return NextResponse.redirect(authorizeUrl.toString());
}
