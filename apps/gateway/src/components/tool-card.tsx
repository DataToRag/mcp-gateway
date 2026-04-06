import Link from "next/link";
import { SERVER_LOGOS } from "./server-logos";

interface ToolCardProps {
  slug: string;
  name: string;
  description: string | null;
  toolCount: number;
}

export function ToolCard({
  slug,
  name,
  description,
  toolCount,
}: ToolCardProps) {
  const logo = SERVER_LOGOS[slug];

  return (
    <Link
      href={`/tools/${slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-background p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent p-2 font-display text-base font-bold text-accent-foreground">
          {logo ?? name.charAt(0).toUpperCase()}
        </div>
        <h3 className="font-display text-base font-semibold text-foreground transition-colors group-hover:text-primary">
          {name}
        </h3>
      </div>

      {description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-auto pt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="opacity-70">
            <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" fill="currentColor" />
            <path d="M8 4a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5A.75.75 0 018 4z" fill="currentColor" />
          </svg>
          {toolCount} {toolCount === 1 ? "capability" : "capabilities"}
        </span>
      </div>
    </Link>
  );
}
