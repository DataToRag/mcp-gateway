import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpServers, tools } from "@datatorag-mcp/db";
import { Navbar } from "@/components/navbar";
import { ToolCard } from "@/components/tool-card";

export const dynamic = "force-dynamic";

async function getServers() {
  const servers = await db
    .select({
      slug: mcpServers.slug,
      name: mcpServers.name,
      description: mcpServers.description,
      licenseSpdx: mcpServers.licenseSpdx,
      toolCount: sql<number>`count(${tools.id})::int`,
      creditsPerCall: sql<number>`coalesce(min(${tools.creditsPerCall}), 1)`,
    })
    .from(mcpServers)
    .leftJoin(tools, eq(tools.mcpServerId, mcpServers.id))
    .where(eq(mcpServers.status, "active"))
    .groupBy(mcpServers.id)
    .orderBy(mcpServers.name);

  return servers;
}

export default async function HomePage() {
  const servers = await getServers();

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
            <h1 className="animate-fade-in-up font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-6xl">
              One API key.
              <br />
              <span className="text-secondary">Every</span> MCP tool.
            </h1>
            <p
              className="animate-fade-in-up mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ animationDelay: "0.1s" }}
            >
              Connect Claude Desktop, Cursor, or any MCP client to an
              open-source marketplace of tools. Pay per call, inspect every
              line of code.
            </p>
            <div
              className="animate-fade-in-up mt-8 flex items-center gap-3"
              style={{ animationDelay: "0.2s" }}
            >
              <input
                type="text"
                placeholder="Search tools..."
                className="w-72 rounded-[var(--radius)] border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-ring sm:w-80"
              />
              <button className="rounded-[var(--radius)] bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90">
                Search
              </button>
            </div>
          </div>
        </section>

        {/* Tool grid */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            <h2 className="font-display text-xl font-bold text-foreground">
              Available Tools
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              All tools are open source. Inspect, fork, or self-host any of
              them.
            </p>
          </div>

          {servers.length === 0 ? (
            <div className="mt-16 text-center text-muted-foreground">
              <p className="text-base">No tools registered yet.</p>
              <p className="mt-1 text-sm">
                Be the first to submit an open-source MCP server.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {servers.map((server, i) => (
                <div
                  key={server.slug}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                >
                  <ToolCard
                    slug={server.slug}
                    name={server.name}
                    description={server.description}
                    toolCount={server.toolCount}
                    creditsPerCall={server.creditsPerCall}
                    licenseSpdx={server.licenseSpdx}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Connect snippet */}
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="max-w-md">
              <h2 className="font-display text-2xl font-bold">
                Get started in seconds
              </h2>
              <p className="mt-3 text-sm text-primary-foreground/60">
                Add this to your MCP client config. That&apos;s it.
              </p>
            </div>
            <pre className="mt-8 max-w-lg overflow-x-auto rounded-[var(--radius)] border border-white/10 bg-white/5 p-5 font-mono text-sm leading-relaxed text-primary-foreground/90">
{`{
  "mcpServers": {
    "datatorag": {
      "url": "https://gateway.datatorag.com/mcp"
    }
  }
}`}
            </pre>
            <p className="mt-6 text-sm text-primary-foreground/40">
              Your browser will open for sign-in automatically. No API key
              needed.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs tracking-wide text-muted-foreground">
        DataToRAG &middot; All tools are open source.
      </footer>
    </>
  );
}
