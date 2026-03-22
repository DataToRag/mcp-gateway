import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

interface PoolEntry {
  client: Client;
  transport: StreamableHTTPClientTransport;
  serverId: string;
  serverUrl: string;
  lastUsed: number;
  inUse: boolean;
}

interface PoolConfig {
  maxPerServer: number;
  idleTimeoutMs: number;
  healthCheckIntervalMs: number;
  acquireTimeoutMs: number;
}

const DEFAULT_CONFIG: PoolConfig = {
  maxPerServer: 5,
  idleTimeoutMs: 5 * 60 * 1000, // 5 minutes
  healthCheckIntervalMs: 30 * 1000, // 30 seconds
  acquireTimeoutMs: 5_000, // 5 seconds
};

export class ConnectionPool {
  private pools = new Map<string, PoolEntry[]>();
  private waitQueues = new Map<string, Array<(client: Client) => void>>();
  private config: PoolConfig;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config?: Partial<PoolConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cleanupTimer = setInterval(
      () => this.evictIdle(),
      this.config.idleTimeoutMs
    );
  }

  /** Acquire a connected MCP client for a backend server. */
  async acquire(serverId: string, serverUrl: string): Promise<Client> {
    const pool = this.pools.get(serverId) ?? [];

    // Find an idle connection
    const idle = pool.find((e) => !e.inUse);
    if (idle) {
      idle.inUse = true;
      idle.lastUsed = Date.now();
      return idle.client;
    }

    // Create new connection if under limit
    if (pool.length < this.config.maxPerServer) {
      const entry = await this.createConnection(serverId, serverUrl);
      pool.push(entry);
      this.pools.set(serverId, pool);
      return entry.client;
    }

    // Pool exhausted — wait for a release
    return new Promise<Client>((resolve, reject) => {
      const queue = this.waitQueues.get(serverId) ?? [];
      this.waitQueues.set(serverId, queue);

      const timer = setTimeout(() => {
        const idx = queue.indexOf(resolve);
        if (idx !== -1) queue.splice(idx, 1);
        reject(
          new Error(
            `Connection pool timeout after ${this.config.acquireTimeoutMs}ms for server ${serverId}`
          )
        );
      }, this.config.acquireTimeoutMs);

      queue.push((client: Client) => {
        clearTimeout(timer);
        resolve(client);
      });
    });
  }

  /** Release a client back to the pool. */
  release(serverId: string, client: Client): void {
    const pool = this.pools.get(serverId);
    if (!pool) return;

    const entry = pool.find((e) => e.client === client);
    if (!entry) return;

    // If someone is waiting, hand the connection directly to them
    const queue = this.waitQueues.get(serverId);
    if (queue && queue.length > 0) {
      const waiter = queue.shift()!;
      entry.lastUsed = Date.now();
      waiter(entry.client);
      return;
    }

    entry.inUse = false;
    entry.lastUsed = Date.now();
  }

  /** Remove all connections for a server. */
  async removeServer(serverId: string): Promise<void> {
    const pool = this.pools.get(serverId);
    if (!pool) return;

    for (const entry of pool) {
      try {
        await entry.client.close();
      } catch {
        // Ignore close errors
      }
    }
    this.pools.delete(serverId);

    // Reject any waiters
    const queue = this.waitQueues.get(serverId);
    if (queue) {
      this.waitQueues.delete(serverId);
    }
  }

  /** Shut down all connections. */
  async drain(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    for (const [serverId] of this.pools) {
      await this.removeServer(serverId);
    }
  }

  private async createConnection(
    serverId: string,
    serverUrl: string
  ): Promise<PoolEntry> {
    const transport = new StreamableHTTPClientTransport(new URL(serverUrl));
    const client = new Client(
      { name: "datatorag-mcp", version: "0.1.0" },
      { capabilities: {} }
    );

    await client.connect(transport);

    return {
      client,
      transport,
      serverId,
      serverUrl,
      lastUsed: Date.now(),
      inUse: true,
    };
  }

  private evictIdle(): void {
    const now = Date.now();
    for (const [serverId, pool] of this.pools) {
      const kept: PoolEntry[] = [];
      for (const entry of pool) {
        if (
          !entry.inUse &&
          now - entry.lastUsed > this.config.idleTimeoutMs &&
          pool.length > 1
        ) {
          entry.client.close().catch(() => {});
        } else {
          kept.push(entry);
        }
      }
      if (kept.length === 0) {
        this.pools.delete(serverId);
      } else {
        this.pools.set(serverId, kept);
      }
    }
  }
}
