import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpServers, pluginConnections } from "@datatorag-mcp/db";
import type { McpGatewayManifest } from "@datatorag-mcp/types";

interface Props {
  params: Promise<{ slug: string }>;
}

// GET /api/servers/:slug/connect/callback — OAuth callback
export async function GET(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const code = request.nextUrl.searchParams.get("code");
  const stateParam = request.nextUrl.searchParams.get("state");

  if (!code || !stateParam) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 }
    );
  }

  // Decode state
  let state: { userId: string; slug: string; serverId: string };
  try {
    state = JSON.parse(Buffer.from(stateParam, "base64url").toString());
  } catch {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  // Look up server and manifest
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
    return NextResponse.json({ error: "No OAuth config" }, { status: 400 });
  }

  const { oauth } = manifest;
  const clientId = process.env[oauth.clientIdEnv] ?? "";
  const clientSecret = process.env[oauth.clientSecretEnv] ?? "";
  const baseUrl = process.env.GATEWAY_BASE_URL ?? "http://localhost:8285";
  const redirectUri = `${baseUrl}/api/servers/${slug}/connect/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch(oauth.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json(
      { error: "Token exchange failed", details: text },
      { status: 502 }
    );
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };

  const tokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : null;

  // Upsert plugin connection
  const existing = await db
    .select({ id: pluginConnections.id })
    .from(pluginConnections)
    .where(
      and(
        eq(pluginConnections.userId, state.userId),
        eq(pluginConnections.mcpServerId, server.id)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(pluginConnections)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        tokenExpiresAt,
        scopes: tokens.scope ?? oauth.scopes.join(" "),
        updatedAt: new Date(),
      })
      .where(eq(pluginConnections.id, existing[0].id));
  } else {
    await db.insert(pluginConnections).values({
      userId: state.userId,
      mcpServerId: server.id,
      provider: oauth.provider,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      tokenExpiresAt,
      scopes: tokens.scope ?? oauth.scopes.join(" "),
    });
  }

  // Redirect to dashboard
  return NextResponse.redirect(`${baseUrl}/dashboard`);
}
