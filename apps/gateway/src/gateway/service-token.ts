import { eq, and } from "drizzle-orm";
import type { Database } from "@datatorag-mcp/db";
import { serviceConnections } from "@datatorag-mcp/db";

/** Mapping from plugin slug to the service connection it needs. */
export const PLUGIN_SERVICE_MAP: Record<string, string> = {
  "gws-mcp": "google-workspace",
};

/** Reverse mapping: service name to plugin slug. */
export const SERVICE_PLUGIN_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PLUGIN_SERVICE_MAP).map(([slug, service]) => [service, slug])
);

/**
 * Refresh a Google access token using the stored refresh token.
 * Returns the new access token, or null if refresh fails.
 */
export async function refreshGoogleToken(
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
 * Get a valid access token for a user's service connection.
 * Refreshes if expired and refresh token is available.
 */
export async function getServiceToken(
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

  const isExpired =
    conn.tokenExpiresAt && conn.tokenExpiresAt.getTime() < Date.now();

  if (!isExpired) return conn.accessToken;

  if (conn.refreshToken) {
    const newToken = await refreshGoogleToken(db, conn.id, conn.refreshToken);
    if (newToken) return newToken;
  }

  return null;
}
