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
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="max-w-2xl">
            <p
              className="animate-fade-in-up text-sm font-semibold uppercase tracking-widest text-primary"
            >
              MCP Gateway + Integration Services
            </p>
            <h1
              className="animate-fade-in-up mt-4 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]"
              style={{ animationDelay: "0.06s" }}
            >
              Get your data
              <br />
              <span className="text-primary">AI-ready.</span>
            </h1>
            <p
              className="animate-fade-in-up mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ animationDelay: "0.12s" }}
            >
              DataToRAG connects your internal data to AI assistants like Claude
              through the Model Context Protocol. Self-serve platform or
              white-glove integration. We bridge the gap.
            </p>
            <div
              className="animate-fade-in-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.18s" }}
            >
              <Link
                href="/auth/login"
                className="rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Start Free
              </Link>
              <a
                href="#services"
                className="rounded-[var(--radius)] border border-border px-6 py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary"
              >
                Talk to Us
              </a>
            </div>
          </div>
        </section>

        {/* Platform — three pillars */}
        <section id="platform" className="border-y border-border bg-secondary/50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="animate-fade-in-up text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                The platform
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Three ways to connect your data
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
                Whether you want to plug in yourself, use a pre-built connector,
                or need a custom integration, DataToRAG has you covered.
              </p>
            </div>

            <div
              className="animate-fade-in-up mt-12 grid gap-6 sm:grid-cols-3"
              style={{ animationDelay: "0.1s" }}
            >
              {[
                {
                  title: "Self-Serve Gateway",
                  desc: "Sign up, connect your data sources, and start querying through Claude or any MCP client. No engineering required.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  ),
                },
                {
                  title: "Pre-Built Connectors",
                  desc: "One-click integrations for Google Workspace, Salesforce, Databricks, Slack, and more. We handle the auth and schema mapping.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  ),
                },
                {
                  title: "Custom MCP Servers",
                  desc: "Our engineering team builds custom MCP servers for your proprietary databases, internal APIs, and legacy systems.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-background p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Custom Integration Services */}
        <section id="services" className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 sm:grid-cols-2 sm:items-center">
            <div className="animate-fade-in-up">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Integration Services
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                We build the bridge
                <br />
                to your data.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Not every data source has a pre-built connector. Our engineering
                team works directly with your infrastructure to build custom MCP
                servers that give your AI assistants access to proprietary
                systems: databases, internal APIs, ERP platforms, data
                warehouses, and more.
              </p>
              <a
                href="mailto:support@datatorag.com"
                className="mt-6 inline-block rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Contact Us
              </a>
            </div>

            <div
              className="animate-fade-in-up space-y-4"
              style={{ animationDelay: "0.1s" }}
            >
              {[
                {
                  label: "Discovery",
                  desc: "We audit your data landscape and identify which systems to connect.",
                },
                {
                  label: "Build",
                  desc: "Custom MCP server development, tested against your schemas and APIs.",
                },
                {
                  label: "Deploy",
                  desc: "Managed infrastructure or on-prem, hosted alongside your data.",
                },
                {
                  label: "Support",
                  desc: "Ongoing maintenance, monitoring, and schema evolution as your systems change.",
                },
              ].map((step, i) => (
                <div
                  key={step.label}
                  className="flex gap-4 rounded-2xl border border-border p-5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Available integrations */}
        <section
          id="integrations"
          className="border-y border-border bg-secondary/50"
        >
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="animate-fade-in-up">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Integrations
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Pre-built MCP connectors
              </h2>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                Connect through the Model Context Protocol with ready-to-use
                integrations. More added every week.
              </p>
            </div>

            {servers.length === 0 ? (
              <div className="mt-16 text-center">
                <p className="text-base text-muted-foreground">
                  Connectors launching soon.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contact us for early access or custom integration needs.
                </p>
              </div>
            ) : (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {servers.map((server, i) => (
                  <div
                    key={server.slug}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${0.1 + i * 0.05}s` }}
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

            {/* Coming soon connectors */}
            <div className="animate-fade-in-up mt-10" style={{ animationDelay: "0.2s" }}>
              <p className="text-sm font-medium text-muted-foreground">
                Coming soon
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Salesforce",
                  "Databricks",
                  "Slack",
                  "HubSpot",
                  "PostgreSQL",
                  "Snowflake",
                  "Jira",
                  "Confluence",
                  "Notion",
                  "GitHub",
                ].map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Developer quick-start */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 sm:grid-cols-2 sm:items-center">
            <div className="animate-fade-in-up">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                For developers
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                One line to connect.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Add the DataToRAG gateway to any MCP-compatible client: Claude
                Desktop, Cursor, Windsurf, or your own application. OAuth
                sign-in handles the rest.
              </p>
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <pre className="overflow-x-auto rounded-2xl border border-border bg-[#1C1917] p-6 font-mono text-sm leading-relaxed text-[#E7E5E4]">
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
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-[#1C1917]">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <h2 className="animate-fade-in-up font-display text-2xl font-bold text-white sm:text-3xl">
              Ready to make your data AI-ready?
            </h2>
            <p
              className="animate-fade-in-up mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#A8A29E]"
              style={{ animationDelay: "0.08s" }}
            >
              Start with the self-serve gateway or talk to our team about a
              custom integration for your company.
            </p>
            <div
              className="animate-fade-in-up mt-8 flex flex-wrap justify-center gap-3"
              style={{ animationDelay: "0.16s" }}
            >
              <Link
                href="/auth/login"
                className="rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Start Free
              </Link>
              <a
                href="mailto:support@datatorag.com"
                className="rounded-[var(--radius)] border border-white/20 px-6 py-3 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/5"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        DataToRAG &middot; MCP Gateway &amp; Integration Services
      </footer>
    </>
  );
}
