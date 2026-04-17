"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "#platform", label: "Platform" },
  { href: "#services", label: "Services" },
  { href: "#integrations", label: "Integrations" },
  { href: "/blog", label: "Blog", isRoute: true },
  { href: "/dashboard", label: "Dashboard", isRoute: true },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/datatorag-logo-256.png"
              alt="DataToRAG"
              width={26}
              height={26}
            />
            <span className="font-display text-[15px] font-bold tracking-tight text-white">
              DataToRAG
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              )
            )}
            <a
              href="https://github.com/datatorag/mcp-gateway"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:text-white"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18.92-.26 1.9-.38 2.88-.39.98.01 1.96.13 2.88.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.24 2.75.12 3.04.73.8 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.27 5.68.41.36.77 1.07.77 2.15 0 1.55-.01 2.8-.01 3.19 0 .31.21.67.8.56 4.57-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5z" />
              </svg>
            </a>
            <Link
              href="/auth/login"
              className="ml-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#1a3a8f] transition-all hover:bg-white/90"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:text-white md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
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
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="border-t border-white/10 px-5 pb-4 pt-2">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              )
            )}
            <a
              href="https://github.com/datatorag/mcp-gateway"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              GitHub
            </a>
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-xl bg-white px-4 py-2.5 text-center text-sm font-medium text-[#1a3a8f] transition-all hover:bg-white/90"
            >
              Get Started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
