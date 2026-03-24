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
      <h1 className="font-display text-2xl font-bold text-foreground">
        Dashboard
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Overview of your connected data sources.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Connected Sources</p>
          <p className="mt-1 font-display text-3xl font-bold text-foreground">
            {stats.servers}
          </p>
        </div>
        <div className="rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Capabilities</p>
          <p className="mt-1 font-display text-3xl font-bold text-foreground">
            {stats.tools}
          </p>
        </div>
        <div className="rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Credits</p>
          <p className="mt-1 font-display text-3xl font-bold text-foreground">
            100
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Free tier</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-lg font-bold text-foreground">
          Quick Start
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Add this to your MCP client config to connect.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-[#1C1917] p-5 font-mono text-sm leading-relaxed text-[#E7E5E4]">
{`{
  "mcpServers": {
    "datatorag": {
      "url": "https://datatorag.com/mcp"
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}
