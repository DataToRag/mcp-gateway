import { NextRequest, NextResponse } from "next/server";
import { eq, and, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { serviceConnections, connectedAccounts } from "@datatorag-mcp/db";
import {
  disconnectAccount,
  setDefaultAccount,
} from "@/gateway/connected-accounts";

// GET /api/connections — list connected accounts for the logged-in user
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await db
    .select({
      id: connectedAccounts.id,
      connectorType: connectedAccounts.connectorType,
      label: connectedAccounts.label,
      accountEmail: connectedAccounts.accountEmail,
      isDefault: connectedAccounts.isDefault,
      createdAt: connectedAccounts.createdAt,
      scopes: serviceConnections.scopes,
      connectedAt: serviceConnections.connectedAt,
      serviceConnectionId: connectedAccounts.serviceConnectionId,
    })
    .from(connectedAccounts)
    .innerJoin(
      serviceConnections,
      eq(connectedAccounts.serviceConnectionId, serviceConnections.id)
    )
    .where(eq(connectedAccounts.userId, userId));

  // Legacy: un-migrated service_connections (no connected_accounts row yet)
  const migratedSet = accounts.map((a) => a.serviceConnectionId);

  const legacyConnections =
    migratedSet.length > 0
      ? await db
          .select({
            id: serviceConnections.id,
            service: serviceConnections.service,
            scopes: serviceConnections.scopes,
            connectedAt: serviceConnections.connectedAt,
          })
          .from(serviceConnections)
          .where(
            and(
              eq(serviceConnections.userId, userId),
              notInArray(serviceConnections.id, migratedSet)
            )
          )
      : await db
          .select({
            id: serviceConnections.id,
            service: serviceConnections.service,
            scopes: serviceConnections.scopes,
            connectedAt: serviceConnections.connectedAt,
          })
          .from(serviceConnections)
          .where(eq(serviceConnections.userId, userId));

  return NextResponse.json({ accounts, connections: legacyConnections });
}

// DELETE /api/connections?accountId=xxx or ?service=xxx (legacy)
export async function DELETE(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accountId = request.nextUrl.searchParams.get("accountId");
  const service = request.nextUrl.searchParams.get("service");

  if (accountId) {
    await disconnectAccount(db, userId, accountId);
    return NextResponse.json({ ok: true });
  }

  if (service) {
    // Delete all connected_accounts for this service first
    await db
      .delete(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.userId, userId),
          eq(connectedAccounts.connectorType, service)
        )
      );
    // Then delete all service_connections
    await db
      .delete(serviceConnections)
      .where(
        and(
          eq(serviceConnections.userId, userId),
          eq(serviceConnections.service, service)
        )
      );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Missing accountId or service parameter" },
    { status: 400 }
  );
}

// PATCH /api/connections — set default or update label
export async function PATCH(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    accountId: string;
    setDefault?: boolean;
    label?: string;
  };

  if (!body.accountId) {
    return NextResponse.json(
      { error: "Missing accountId" },
      { status: 400 }
    );
  }

  // Verify ownership
  const [account] = await db
    .select({
      id: connectedAccounts.id,
      connectorType: connectedAccounts.connectorType,
    })
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.id, body.accountId),
        eq(connectedAccounts.userId, userId)
      )
    )
    .limit(1);

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (body.setDefault) {
    await setDefaultAccount(db, userId, account.connectorType, account.id);
  }

  if (body.label !== undefined) {
    await db
      .update(connectedAccounts)
      .set({ label: body.label || null })
      .where(eq(connectedAccounts.id, account.id));
  }

  return NextResponse.json({ ok: true });
}
