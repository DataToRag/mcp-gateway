import { db } from "@/lib/db";
import { mcpServers, tools } from "@datatorag-mcp/db";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getStats() {
  const [serverCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mcpServers)
    .where(eq(mcpServers.status, "active"));

  const [toolCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tools);

  return {
    servers: serverCount?.count ?? 0,
    tools: toolCount?.count ?? 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Overview of your DataToRAG usage.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius)] border border-border p-5">
          <p className="text-sm text-muted-foreground">Active Servers</p>
          <p className="mt-1 font-display text-3xl font-bold text-primary">
            {stats.servers}
          </p>
        </div>
        <div className="rounded-[var(--radius)] border border-border p-5">
          <p className="text-sm text-muted-foreground">Total Tools</p>
          <p className="mt-1 font-display text-3xl font-bold text-primary">
            {stats.tools}
          </p>
        </div>
        <div className="rounded-[var(--radius)] border border-border p-5">
          <p className="text-sm text-muted-foreground">Credits</p>
          <p className="mt-1 font-display text-3xl font-bold text-primary">
            100
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Free tier</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-foreground">
          Quick Start
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add this to your MCP client config to connect.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-[var(--radius)] border border-border bg-primary p-5 font-mono text-sm text-primary-foreground">
{`{
  "mcpServers": {
    "datatorag-mcp": {
      "url": "https://gateway.datatorag.com/mcp"
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}
