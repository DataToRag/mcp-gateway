import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpServers, tools } from "@datatorag-mcp/db";
import { Navbar } from "@/components/navbar";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getServer(slug: string) {
  const [server] = await db
    .select()
    .from(mcpServers)
    .where(eq(mcpServers.slug, slug))
    .limit(1);

  if (!server || server.status !== "active") return null;

  const serverTools = await db
    .select()
    .from(tools)
    .where(eq(tools.mcpServerId, server.id));

  return { server, tools: serverTools };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getServer(slug);
  if (!data) return { title: "Tool Not Found" };

  return {
    title: `${data.server.name} — DataToRAG`,
    description: data.server.description ?? `MCP server with ${data.tools.length} tools`,
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getServer(slug);

  if (!data) notFound();

  const { server, tools: serverTools } = data;

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12">
          {/* Header */}
          <div className="animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius)] bg-accent font-display text-2xl font-bold text-secondary">
                {server.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-primary">
                  {server.name}
                </h1>
                {server.description && (
                  <p className="mt-1 text-muted-foreground">
                    {server.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {server.licenseSpdx && (
                <span className="rounded-full bg-muted px-3 py-1">
                  {server.licenseSpdx}
                </span>
              )}
              <span className="rounded-full bg-muted px-3 py-1">
                {serverTools.length} {serverTools.length === 1 ? "tool" : "tools"}
              </span>
              {server.githubRepoUrl && (
                <a
                  href={server.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-muted px-3 py-1 transition-colors hover:bg-border"
                >
                  View Source
                </a>
              )}
            </div>
          </div>

          {/* Tools */}
          <div className="animate-fade-in-up mt-10" style={{ animationDelay: "0.1s" }}>
            <h2 className="font-display text-lg font-bold text-foreground">
              Tools
            </h2>

            <div className="mt-4 space-y-4">
              {serverTools.map((tool) => {
                const schema = tool.inputSchemaJson as Record<string, unknown> | null;
                const properties = (schema?.properties ?? {}) as Record<
                  string,
                  { type?: string; description?: string }
                >;

                return (
                  <div
                    key={tool.id}
                    className="rounded-[var(--radius)] border border-border p-5"
                  >
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-sm font-medium text-secondary">
                        {tool.namespacedName}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {tool.creditsPerCall} credit/call
                      </span>
                    </div>
                    {tool.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    )}
                    {Object.keys(properties).length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-foreground">
                          Parameters
                        </p>
                        <div className="mt-1.5 space-y-1">
                          {Object.entries(properties).map(([name, prop]) => (
                            <div key={name} className="flex items-baseline gap-2 text-sm">
                              <code className="font-mono text-xs text-secondary">
                                {name}
                              </code>
                              {prop.type && (
                                <span className="text-xs text-muted-foreground">
                                  {prop.type}
                                </span>
                              )}
                              {prop.description && (
                                <span className="text-xs text-muted-foreground">
                                  — {prop.description}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connect snippet */}
          <div className="animate-fade-in-up mt-10" style={{ animationDelay: "0.2s" }}>
            <h2 className="font-display text-lg font-bold text-foreground">
              Connect
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add this to your MCP client config to access all tools through the gateway.
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
      </main>
    </>
  );
}
