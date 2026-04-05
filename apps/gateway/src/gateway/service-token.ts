import { eq, and } from "drizzle-orm";
import type { Database } from "@datatorag-mcp/db";
import { serviceConnections, connectedAccounts } from "@datatorag-mcp/db";

/** Mapping from plugin slug to the service connection it needs. */
export const PLUGIN_SERVICE_MAP: Record<string, string> = {
  "gws-mcp": "google-workspace",
  "atlassian-mcp": "atlassian",
};

/** Reverse mapping: service name to plugin slug. */
export const SERVICE_PLUGIN_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PLUGIN_SERVICE_MAP).map(([slug, service]) => [service, slug])
);

/**
 * Refresh a Google access token using the stored refresh token.
 */
async function refreshGoogleToken(
  db: Database,
  connectionId: string,
  refreshToken: string
): Promise<string | null> {
  const clientId = process.env.GOOGLE_GWS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_GWS_CLIENT_SECRET;
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
 * Refresh an Atlassian access token.
 * Atlassian uses rotating refresh tokens — the response includes a new
 * refresh_token that must replace the old one.
 */
async function refreshAtlassianToken(
  db: Database,
  connectionId: string,
  refreshToken: string
): Promise<string | null> {
  const clientId = process.env.ATLASSIAN_CLIENT_ID;
  const clientSecret = process.env.ATLASSIAN_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : null;

    // Atlassian rotates refresh tokens — store the new one
    await db
      .update(serviceConnections)
      .set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? refreshToken,
        tokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(serviceConnections.id, connectionId));

    return data.access_token;
  } catch {
    return null;
  }
}

/** Service-specific refresh function lookup. */
const REFRESH_FN: Record<
  string,
  (db: Database, connId: string, rt: string) => Promise<string | null>
> = {
  "google-workspace": refreshGoogleToken,
  atlassian: refreshAtlassianToken,
};

/**
 * Get a valid access token for a user's service connection.
 * Routes through connected_accounts when available, with fallback to direct lookup.
 * Refreshes if expired and refresh token is available.
 */
export async function getServiceToken(
  db: Database,
  userId: string,
  service: string,
  accountEmail?: string
): Promise<string | null> {
  // Route through connected_accounts
  const conditions = [
    eq(connectedAccounts.userId, userId),
    eq(connectedAccounts.connectorType, service),
  ];

  if (accountEmail) {
    conditions.push(eq(connectedAccounts.accountEmail, accountEmail));
  } else {
    conditions.push(eq(connectedAccounts.isDefault, true));
  }

  const [account] = await db
    .select({
      serviceConnectionId: connectedAccounts.serviceConnectionId,
    })
    .from(connectedAccounts)
    .where(and(...conditions))
    .limit(1);

  let conn;

  if (account) {
    [conn] = await db
      .select()
      .from(serviceConnections)
      .where(eq(serviceConnections.id, account.serviceConnectionId))
      .limit(1);
  } else if (!accountEmail) {
    // Fallback: direct service_connections lookup (backward compat for un-migrated rows)
    [conn] = await db
      .select()
      .from(serviceConnections)
      .where(
        and(
          eq(serviceConnections.userId, userId),
          eq(serviceConnections.service, service)
        )
      )
      .limit(1);
  }

  if (!conn) return null;

  const isExpired =
    conn.tokenExpiresAt && conn.tokenExpiresAt.getTime() < Date.now();

  if (!isExpired) return conn.accessToken;

  if (conn.refreshToken) {
    const refreshFn = REFRESH_FN[service];
    if (refreshFn) {
      const newToken = await refreshFn(db, conn.id, conn.refreshToken);
      if (newToken) return newToken;
    }
  }

  return null;
}
