import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/keys", label: "API Keys" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-muted/30">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <Image
            src="/datatorag-logo-256.png"
            alt="DataToRAG"
            width={28}
            height={28}
          />
          <span className="font-display text-sm font-bold text-primary">
            DataToRAG
          </span>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-[var(--radius)] px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-border px-3 py-4">
          <Link
            href="/"
            className="block rounded-[var(--radius)] px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Back to Marketplace
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
