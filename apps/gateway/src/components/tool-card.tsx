import Link from "next/link";

const SERVER_LOGOS: Record<string, React.ReactNode> = {
  "gws-mcp": (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ),
  "atlassian-mcp": (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path d="M7.12 11.08c-.15-.2-.37-.2-.49.02L2.05 20.86c-.12.22-.01.4.24.4h5.96c.12 0 .28-.1.34-.24.82-1.82.46-4.58-1.47-9.94z" fill="#2684FF" />
      <path d="M11.35 2.31c-2.45 4.36-2.57 8.14-.72 12.27l2.56 5.28c.12.24.32.24.44.24h5.96c.24 0 .36-.18.24-.4L12.04 2.33c-.12-.2-.37-.24-.49-.08l-.2.06z" fill="#2684FF" />
    </svg>
  ),
};

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
}: ToolCardProps) {
  const logo = SERVER_LOGOS[slug];

  return (
    <Link
      href={`/tools/${slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-background p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-base font-bold text-accent-foreground">
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
