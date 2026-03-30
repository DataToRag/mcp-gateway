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
