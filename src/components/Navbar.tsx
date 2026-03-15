"use client";

/**
 * Navbar — Persistent floating navigation bar
 *
 * Z-INDEX: z-40 (highest UI layer — always visible above panels & map)
 *
 * CUSTOMIZATION GUIDE:
 * ├── Logo text .................. search "Gita Life NYC" below
 * ├── Logo icon .................. replace the inline SVG lotus with your logo <Image>
 * ├── Nav links .................. edit the NAV_LINKS array
 * └── Link destinations .......... update href values (currently # placeholders)
 */

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Navigation links — add, remove, or rename as needed                */
/* ------------------------------------------------------------------ */
const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Locations", href: "#locations" },
  { label: "Contact", href: "#contact" },
] as const;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="pointer-events-auto absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-3 sm:px-8"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* ---- Glassmorphism backdrop (spans full width) ---- */}
      <div className="pointer-events-none absolute inset-0 border-b border-white/[0.06] bg-[#0a0a1a]/60 backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)]" />

      {/* ---- Logo ---- */}
      {/*
       * TODO: Replace the inline SVG + text with your actual logo.
       * Example:
       *   import Image from "next/image";
       *   <Image src="/logo.svg" alt="Gita Life NYC" width={140} height={32} />
       */}
      <a
        href="/"
        className="relative z-10 flex items-center gap-2.5 transition-opacity hover:opacity-80"
        aria-label="Gita Life NYC — Home"
      >
        {/* Minimal lotus icon — swap for real logo */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          className="shrink-0"
        >
          <circle cx="14" cy="14" r="13" stroke="#E8751A" strokeWidth="1.2" opacity="0.5" />
          <path
            d="M14 6c-2 3-5 6-5 9a5 5 0 0 0 10 0c0-3-3-6-5-9Z"
            fill="#E8751A"
            opacity="0.85"
          />
          <path
            d="M14 10c-1.2 2-3 4-3 5.8a3 3 0 0 0 6 0c0-1.8-1.8-3.8-3-5.8Z"
            fill="#D4A843"
            opacity="0.7"
          />
        </svg>

        <span className="text-base font-bold tracking-tight text-white sm:text-lg">
          Gita Life <span className="text-[#E8751A]">NYC</span>
        </span>
      </a>

      {/* ---- Desktop links ---- */}
      <ul className="relative z-10 hidden items-center gap-1 sm:flex">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}

        {/* Primary CTA — matches spec "Get Connected" */}
        <li className="ml-2">
          <a
            href="#get-connected"
            className="rounded-full bg-[#E8751A] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_16px_rgba(232,117,26,0.25)] transition-all hover:bg-[#d4680f] hover:shadow-[0_0_24px_rgba(232,117,26,0.35)]"
          >
            Get Connected
          </a>
        </li>
      </ul>

      {/* ---- Mobile hamburger ---- */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/[0.08] sm:hidden"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {mobileOpen ? (
            /* X icon */
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            /* Hamburger icon */
            <>
              <path d="M3 5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M3 10h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {/* ---- Mobile dropdown ---- */}
      <div
        className={`absolute inset-x-0 top-full z-10 border-b border-white/[0.06] bg-[#0a0a1a]/90 backdrop-blur-xl transition-all duration-300 sm:hidden ${
          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-5 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-2">
            <a
              href="#get-connected"
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl bg-[#E8751A] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_0_16px_rgba(232,117,26,0.25)]"
            >
              Get Connected
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
