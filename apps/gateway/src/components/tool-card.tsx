import Link from "next/link";

interface ToolCardProps {
  slug: string;
  name: string;
  description: string | null;
  toolCount: number;
  creditsPerCall: number;
  licenseSpdx: string | null;
}

export function ToolCard({
  slug,
  name,
  description,
  toolCount,
  creditsPerCall,
  licenseSpdx,
}: ToolCardProps) {
  return (
    <Link
      href={`/tools/${slug}`}
      className="block group rounded-[var(--radius)] border border-border bg-background p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] bg-muted font-display text-sm font-bold text-secondary">
          {name.charAt(0).toUpperCase()}
        </div>
        {licenseSpdx && (
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {licenseSpdx}
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-[15px] font-semibold text-foreground transition-colors group-hover:text-secondary">
        {name}
      </h3>

      {description && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
        <span>
          {toolCount} {toolCount === 1 ? "tool" : "tools"}
        </span>
        <span className="h-3 w-px bg-border" />
        <span>{creditsPerCall} credit/call</span>
      </div>
    </Link>
  );
}
