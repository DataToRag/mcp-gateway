"use client";

import { useState } from "react";
import Link from "next/link";
import type { DocPage } from "@/lib/docs";

export function DocsNavClient({
  general,
  connectors,
}: {
  general: Pick<DocPage, "slug" | "title">[];
  connectors: Pick<DocPage, "slug" | "title">[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
        aria-label="Toggle menu"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          {open ? (
            <>
              <path d="M5 5l10 10" />
              <path d="M15 5L5 15" />
            </>
          ) : (
            <>
              <path d="M3 6h14" />
              <path d="M3 10h14" />
              <path d="M3 14h14" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <nav className="absolute left-0 right-0 top-14 z-10 border-b border-border bg-background px-4 py-3">
          <div className="space-y-1">
            {general.map((doc) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {doc.title}
              </Link>
            ))}

            <div className="mb-1 mt-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Connectors
            </div>
            {connectors.map((doc) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {doc.title}
              </Link>
            ))}

            <div className="mt-3 border-t border-border pt-3">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
