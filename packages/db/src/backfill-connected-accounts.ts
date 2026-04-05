/**
 * One-time backfill script: creates connected_accounts rows
 * for existing service_connections that don't have one.
 *
 * For each orphaned service_connection, fetches the account email
 * via the provider's userinfo API and creates the connected_accounts row.
 *
 * Usage: pnpm --filter @datatorag-mcp/db tsx src/backfill-connected-accounts.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, isNull } from "drizzle-orm";
import { serviceConnections } from "./schema/service-connections";
import { connectedAccounts } from "./schema/connected-accounts";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://datatoragmcp:localdev@localhost:5432/datatoragmcp";

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function fetchGoogleEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { email: string };
    return data.email;
  } catch {
    return null;
  }
}

async function fetchAtlassianEmail(
  accessToken: string
): Promise<string | null> {
  try {
    const res = await fetch("https://api.atlassian.com/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { email: string };
    return data.email;
  } catch {
    return null;
  }
}

async function backfill() {
  console.log("Backfilling connected_accounts...");

  // Find service_connections without a connected_accounts row
  const allConnections = await db.select().from(serviceConnections);
  const allAccounts = await db.select().from(connectedAccounts);

  const connectedIds = new Set(
    allAccounts.map((a) => a.serviceConnectionId)
  );

  const orphaned = allConnections.filter((c) => !connectedIds.has(c.id));

  if (orphaned.length === 0) {
    console.log("No orphaned service_connections found. Nothing to do.");
    await client.end();
    return;
  }

  console.log(`Found ${orphaned.length} orphaned service_connections.`);

  // Track defaults per user+connector
  const defaultSet = new Set<string>();
  for (const a of allAccounts) {
    if (a.isDefault) {
      defaultSet.add(`${a.userId}:${a.connectorType}`);
    }
  }

  for (const conn of orphaned) {
    let email: string | null = null;

    if (conn.service === "google-workspace") {
      email = await fetchGoogleEmail(conn.accessToken);
    } else if (conn.service === "atlassian") {
      email = await fetchAtlassianEmail(conn.accessToken);
    }

    if (!email) {
      console.log(
        `  SKIP ${conn.service} (id: ${conn.id}) — could not fetch email (token may be expired)`
      );
      continue;
    }

    const key = `${conn.userId}:${conn.service}`;
    const isDefault = !defaultSet.has(key);
    if (isDefault) defaultSet.add(key);

    await db.insert(connectedAccounts).values({
      userId: conn.userId,
      connectorType: conn.service,
      accountEmail: email,
      serviceConnectionId: conn.id,
      isDefault,
    });

    console.log(
      `  OK ${conn.service} → ${email} (default: ${isDefault})`
    );
  }

  await client.end();
  console.log("Backfill complete!");
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
