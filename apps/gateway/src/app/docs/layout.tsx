import Link from "next/link";
import Image from "next/image";
import { getAllDocs } from "@/lib/docs";
import { DocsNavClient } from "./nav-client";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = getAllDocs();
  const general = docs.filter((d) => d.section === "general");
  const connectors = docs.filter((d) => d.section === "connectors");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
        <Link href="/docs" className="flex items-center gap-3">
          <Image
            src="/datatorag-logo-256.png"
            alt="DataToRAG"
            width={24}
            height={24}
          />
          <span className="font-display text-sm font-bold text-foreground">
            Docs
          </span>
        </Link>
        <DocsNavClient general={general} connectors={connectors} />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <Image
            src="/datatorag-logo-256.png"
            alt="DataToRAG"
            width={26}
            height={26}
          />
          <Link
            href="/docs"
            className="font-display text-sm font-bold text-foreground"
          >
            Docs
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {general.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {doc.title}
            </Link>
          ))}

          <div className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Connectors
          </div>
          {connectors.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {doc.title}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-3">
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
