import { createDb } from "@datatorag-mcp/db";

const DATABASE_URL = process.env.DATABASE_URL ?? "";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDb> | undefined;
};

export function getDb() {
  if (!globalForDb.db) {
    globalForDb.db = createDb(DATABASE_URL);
  }
  return globalForDb.db;
}

// For convenience — pages that use `db` directly
export const db = (() => {
  // During build with placeholder URL, return a dummy that won't be called
  // because all pages using db are force-dynamic
  if (!DATABASE_URL || DATABASE_URL.includes("placeholder")) {
    return null as unknown as ReturnType<typeof createDb>;
  }
  return getDb();
})();
