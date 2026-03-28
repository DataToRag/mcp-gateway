import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/datatorag-logo-256.png"
            alt="DataToRAG"
            width={28}
            height={28}
          />
          <span className="font-display text-[15px] font-bold tracking-tight text-foreground">
            DataToRAG
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <a
            href="#platform"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Platform
          </a>
          <a
            href="#services"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Services
          </a>
          <a
            href="#integrations"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Integrations
          </a>
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/auth/login"
            className="ml-2 rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
