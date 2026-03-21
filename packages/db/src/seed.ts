import crypto from "node:crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema/users";
import { apiKeys } from "./schema/api-keys";
import { creditBalances } from "./schema/credits";
import { mcpServers } from "./schema/mcp-servers";
import { tools } from "./schema/tools";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://datatoragmcp:localdev@localhost:5432/datatoragmcp";

const client = postgres(DATABASE_URL);
const db = drizzle(client);

const API_KEY_PREFIX = "sk-dtrmcp_";

function generateApiKey(): string {
  const bytes = crypto.randomBytes(32);
  return `${API_KEY_PREFIX}${bytes.toString("base64url")}`;
}

function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // --- User + API Key ---
  let [user] = await db
    .insert(users)
    .values({
      email: "test@datatorag.com",
      name: "Test User",
      emailVerified: true,
    })
    .onConflictDoNothing()
    .returning();

  if (!user) {
    const existing = await db.select().from(users).limit(1);
    if (existing.length === 0) {
      console.error("No user found");
      process.exit(1);
    }
    user = existing[0];
    console.log(`Using existing user: ${user.email}`);
  } else {
    console.log(`Created user: ${user.email} (${user.id})`);

    await db
      .insert(creditBalances)
      .values({ userId: user.id, balance: 100 })
      .onConflictDoNothing();
    console.log("Added 100 free credits");
  }

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = rawKey.slice(0, API_KEY_PREFIX.length + 4);

  await db.insert(apiKeys).values({
    userId: user.id,
    name: "Test Key",
    keyHash,
    keyPrefix,
  });

  console.log(`\n=== Test API Key ===`);
  console.log(`Key: ${rawKey}`);
  console.log("Save this key — it won't be shown again.\n");

  // --- Register math-tools MCP server ---
  const [server] = await db
    .insert(mcpServers)
    .values({
      slug: "math-tools",
      name: "Math Tools",
      description: "Basic math operations — add and multiply",
      dockerImageTag: "dtrmcp-server-math-tools:latest",
      containerPort: 3000,
      status: "active",
      submittedByUserId: user.id,
    })
    .onConflictDoNothing()
    .returning();

  if (server) {
    console.log(`Registered MCP server: ${server.name} (${server.slug})`);

    // Register tools
    await db.insert(tools).values([
      {
        mcpServerId: server.id,
        name: "add",
        namespacedName: "math-tools__add",
        description: "Add two numbers together",
        inputSchemaJson: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" },
          },
          required: ["a", "b"],
        },
        creditsPerCall: 1,
      },
      {
        mcpServerId: server.id,
        name: "multiply",
        namespacedName: "math-tools__multiply",
        description: "Multiply two numbers",
        inputSchemaJson: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" },
          },
          required: ["a", "b"],
        },
        creditsPerCall: 1,
      },
    ]);
    console.log("Registered tools: math-tools__add, math-tools__multiply");
  } else {
    console.log("math-tools server already registered");
  }

  await client.end();
  console.log("\nSeed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
