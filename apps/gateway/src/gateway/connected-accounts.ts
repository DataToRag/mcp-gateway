import { eq, and } from "drizzle-orm";
import type { Database } from "@datatorag-mcp/db";
import { connectedAccounts, serviceConnections } from "@datatorag-mcp/db";

/**
 * When a default account is deleted, promote the next oldest account
 * for the same (user_id, connector_type) to default.
 */
export async function promoteNextDefault(
  db: Database,
  userId: string,
  connectorType: string
): Promise<void> {
  const [next] = await db
    .select({ id: connectedAccounts.id })
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.userId, userId),
        eq(connectedAccounts.connectorType, connectorType)
      )
    )
    .orderBy(connectedAccounts.createdAt)
    .limit(1);

  if (next) {
    await db
      .update(connectedAccounts)
      .set({ isDefault: true })
      .where(eq(connectedAccounts.id, next.id));
  }
}

/**
 * Set a specific account as the default for its connector type.
 * Unsets the previous default first. Runs in a transaction.
 */
export async function setDefaultAccount(
  db: Database,
  userId: string,
  connectorType: string,
  accountId: string
): Promise<void> {
  await db.transaction(async (tx) => {
    // Unset current default
    await tx
      .update(connectedAccounts)
      .set({ isDefault: false })
      .where(
        and(
          eq(connectedAccounts.userId, userId),
          eq(connectedAccounts.connectorType, connectorType),
          eq(connectedAccounts.isDefault, true)
        )
      );

    // Set new default
    await tx
      .update(connectedAccounts)
      .set({ isDefault: true })
      .where(
        and(
          eq(connectedAccounts.id, accountId),
          eq(connectedAccounts.userId, userId)
        )
      );
  });
}

/**
 * Disconnect a specific account: delete connected_accounts row
 * and its associated service_connections row.
 * If the deleted account was the default, promotes the next one.
 * Runs in a transaction.
 */
export async function disconnectAccount(
  db: Database,
  userId: string,
  accountId: string
): Promise<void> {
  const [account] = await db
    .select({
      id: connectedAccounts.id,
      serviceConnectionId: connectedAccounts.serviceConnectionId,
      connectorType: connectedAccounts.connectorType,
      isDefault: connectedAccounts.isDefault,
    })
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.id, accountId),
        eq(connectedAccounts.userId, userId)
      )
    )
    .limit(1);

  if (!account) return;

  await db.transaction(async (tx) => {
    // Delete connected_accounts row
    await tx
      .delete(connectedAccounts)
      .where(eq(connectedAccounts.id, account.id));

    // Delete the orphaned service_connections row
    await tx
      .delete(serviceConnections)
      .where(eq(serviceConnections.id, account.serviceConnectionId));
  });

  // Promote next default if needed (outside transaction is fine — idempotent)
  if (account.isDefault) {
    await promoteNextDefault(db, userId, account.connectorType);
  }
}
