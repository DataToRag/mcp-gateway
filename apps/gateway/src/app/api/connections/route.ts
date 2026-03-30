import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { serviceConnections } from "@datatorag-mcp/db";

// GET /api/connections — list service connections for the logged-in user
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await db
    .select({
      id: serviceConnections.id,
      service: serviceConnections.service,
      scopes: serviceConnections.scopes,
      connectedAt: serviceConnections.connectedAt,
    })
    .from(serviceConnections)
    .where(eq(serviceConnections.userId, userId));

  return NextResponse.json({ connections });
}

// DELETE /api/connections?service=google-workspace — disconnect a service
export async function DELETE(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = request.nextUrl.searchParams.get("service");
  if (!service) {
    return NextResponse.json(
      { error: "Missing service parameter" },
      { status: 400 }
    );
  }

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
