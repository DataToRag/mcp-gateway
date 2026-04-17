"use client";

import { useState } from "react";
import Link from "next/link";
import { DocsSidebar } from "./sidebar";
import type { DocPage, ConnectorGroup } from "@/lib/docs";

interface Props {
  topLevel: Pick<DocPage, "slug" | "title">[];
  groups: {
    connector: ConnectorGroup["connector"];
    overview: Pick<DocPage, "slug" | "title"> | null;
    pages: Pick<DocPage, "slug" | "title">[];
  }[];
}

export function DocsNavClient({ topLevel, groups }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

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
        <nav className="absolute left-0 right-0 top-14 z-10 space-y-0.5 border-b border-border bg-background px-4 py-3">
          <DocsSidebar
            topLevel={topLevel}
            groups={groups}
            onNavigate={close}
          />
          <div className="mt-3 border-t border-border pt-3">
            <Link
              href="/dashboard"
              onClick={close}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
