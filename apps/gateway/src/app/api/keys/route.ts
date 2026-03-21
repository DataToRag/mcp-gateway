import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys, users } from "@datatorag-mcp/db";

const API_KEY_PREFIX = "sk-dtrmcp_";

// GET /api/keys — list API keys for a user
export async function GET(request: NextRequest) {
  // TODO: get userId from session. For now, use first user.
  const [user] = await db.select().from(users).limit(1);
  if (!user) return NextResponse.json({ keys: [] });

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id))
    .orderBy(apiKeys.createdAt);

  return NextResponse.json({ keys });
}

// POST /api/keys — create a new API key
export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = body.name || "Untitled Key";

  // TODO: get userId from session
  const [user] = await db.select().from(users).limit(1);
  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 401 });
  }

  const rawKey = `${API_KEY_PREFIX}${crypto.randomBytes(32).toString("base64url")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, API_KEY_PREFIX.length + 4);

  const [created] = await db
    .insert(apiKeys)
    .values({
      userId: user.id,
      name,
      keyHash,
      keyPrefix,
    })
    .returning({ id: apiKeys.id });

  return NextResponse.json({
    id: created.id,
    name,
    keyPrefix,
    rawKey, // shown only once
  });
}

// DELETE /api/keys?id=... — revoke an API key
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, id));

  return NextResponse.json({ success: true });
}
