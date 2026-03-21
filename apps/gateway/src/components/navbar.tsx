import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/datatorag-logo-256.png"
            alt="DataToRAG"
            width={26}
            height={26}
          />
          <span className="font-display text-[15px] font-bold tracking-tight text-primary">
            DataToRAG
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse Tools
          </Link>
          <Link
            href="/dashboard"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/auth/login"
            className="rounded-[var(--radius)] border border-primary bg-primary px-3.5 py-1.5 text-[13px] font-medium text-primary-foreground transition-all hover:bg-transparent hover:text-primary"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
