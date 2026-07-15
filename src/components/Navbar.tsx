"use client";

/**
 * Navbar — simple, mobile-first navigation bar.
 *
 * Solid surface on all pages. Hamburger on mobile, inline links on >= sm.
 */

import { useState } from "react";
import Link from "next/link";

interface NavbarProps {
  /** When true, uses anchor links (#about, #gallery etc). When false, uses page routes. */
  isHomepage?: boolean;
}

export default function Navbar({ isHomepage = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = isHomepage
    ? [
        { label: "Programs", href: "/programs" },
        { label: "Festival", href: "/festival" },
        { label: "Bhajan Club", href: "/bhajanclubbing" },
        { label: "Volunteer", href: "/volunteer" },
        { label: "Daily", href: "/daily" },
        { label: "Impact", href: "/impact" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Programs", href: "/programs" },
        { label: "Festival", href: "/festival" },
        { label: "Bhajan Club", href: "/bhajanclubbing" },
        { label: "Volunteer", href: "/volunteer" },
        { label: "Daily", href: "/daily" },
      ];

  const ctaHref = isHomepage ? "#get-connected" : "/#get-connected";

  return (
    <nav
      className="fixed inset-x-0 top-0 z-40"
      style={{
        /* Solid paper colour — no backdrop-filter. Cheaper on every
           device, especially during scroll. */
        background: "var(--paper)",
        borderBottom: "1px solid var(--paper-edge)",
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="Gita Life NYC — Home"
        >
          <span
            aria-hidden="true"
            className="block h-9 w-9 shrink-0"
            style={{
              backgroundColor: "var(--krishna-blue-deep)",
              WebkitMaskImage: "url(/logo.svg)",
              maskImage: "url(/logo.svg)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
          <span
            className="text-base sm:text-lg"
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: 600,
              letterSpacing: "-0.012em",
              color: "var(--ink-primary)",
            }}
          >
            Gita Life NYC
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[rgba(21,34,79,0.06)]"
                style={{ color: "var(--ink-primary)" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="ml-2">
            <a
              href={ctaHref}
              className="btn-primary-gradient inline-block rounded-full px-4 py-2 text-sm font-semibold text-white"
            >
              Get Connected
            </a>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-[rgba(21,34,79,0.06)] sm:hidden"
          style={{ color: "var(--ink-primary)" }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {mobileOpen ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M3 10h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="surface-paper sm:hidden"
          style={{ borderTop: "1px solid var(--paper-edge)" }}
        >
          <ul className="flex flex-col gap-1 px-5 py-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-[rgba(21,34,79,0.06)]"
                  style={{ color: "var(--ink-primary)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-1">
              <a
                href={ctaHref}
                onClick={() => setMobileOpen(false)}
                className="btn-primary-gradient block rounded-full px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Get Connected
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
