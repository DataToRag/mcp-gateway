import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpServers, tools } from "@datatorag-mcp/db";
import { Navbar } from "@/components/navbar";
import { ToolCard } from "@/components/tool-card";
import Link from "next/link";

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
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <h1 className="animate-fade-in-up font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Connect your data
            <br />
            <span className="text-primary">to AI.</span>
          </h1>
          <p
            className="animate-fade-in-up mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: "0.08s" }}
          >
            Link Google Workspace, databases, and more through MCP — then
            ask your AI assistant anything about your data.
          </p>
          <div
            className="animate-fade-in-up mt-8 flex items-center gap-3"
            style={{ animationDelay: "0.16s" }}
          >
            <Link
              href="/auth/login"
              className="rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Get Started
            </Link>
            <a
              href="#sources"
              className="rounded-[var(--radius)] border border-border px-6 py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary"
            >
              See Data Sources
            </a>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border bg-secondary/50">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div
              className="animate-fade-in-up grid gap-8 sm:grid-cols-3"
              style={{ animationDelay: "0.2s" }}
            >
              {[
                {
                  step: "1",
                  title: "Sign in",
                  desc: "Create your account in seconds with Google.",
                },
                {
                  step: "2",
                  title: "Connect your data",
                  desc: "Link the sources you want your AI to access.",
                },
                {
                  step: "3",
                  title: "Ask anything",
                  desc: "Your AI assistant now knows your data.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data sources */}
        <section id="sources" className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <h2 className="font-display text-xl font-bold text-foreground">
              MCP Integrations
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Connect your data through the Model Context Protocol. All integrations are open source.
            </p>
          </div>

          {servers.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-base text-muted-foreground">
                No MCP integrations available yet.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;re adding integrations — check back soon.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Config snippet — secondary, for advanced users */}
        <section className="border-t border-border bg-secondary/50">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="max-w-md">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                For developers
              </p>
              <h2 className="mt-2 font-display text-lg font-bold text-foreground">
                Or connect directly
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add this to your MCP client config and you&apos;re set.
              </p>
            </div>
            <pre className="mt-6 max-w-lg overflow-x-auto rounded-2xl border border-border bg-[#1C1917] p-5 font-mono text-sm leading-relaxed text-[#E7E5E4]">
{`{
  "mcpServers": {
    "datatorag": {
      "url": "https://datatorag.com/mcp"
    }
  }
}`}
            </pre>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        DataToRAG &middot; All MCP integrations are open source.
      </footer>
    </>
  );
}
