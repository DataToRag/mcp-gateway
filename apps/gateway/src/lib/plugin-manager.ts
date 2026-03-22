import { createDb } from "@datatorag-mcp/db";
import { ConnectionPool } from "@/gateway/pool";
import { PluginManager } from "@/gateway/plugin-manager";

const globalForPm = globalThis as unknown as {
  pluginManager: PluginManager | undefined;
};

export function getPluginManager(
  db?: ReturnType<typeof createDb>,
  pool?: ConnectionPool
): PluginManager {
  if (!globalForPm.pluginManager) {
    if (!db || !pool) {
      throw new Error(
        "PluginManager not initialized — must provide db and pool on first call"
      );
    }
    globalForPm.pluginManager = new PluginManager(db, pool);
  }
  return globalForPm.pluginManager;
}
