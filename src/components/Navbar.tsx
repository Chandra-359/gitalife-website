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
        { label: "Volunteer", href: "/volunteer" },
        { label: "Daily", href: "/daily" },
        { label: "Impact", href: "/impact" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Programs", href: "/programs" },
        { label: "Festival", href: "/festival" },
        { label: "Volunteer", href: "/volunteer" },
        { label: "Daily", href: "/daily" },
      ];

  const ctaHref = isHomepage ? "#get-connected" : "/#get-connected";

  return (
    <nav
      className="fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white"
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0"
          />
          <span className="text-base font-semibold text-gray-900 sm:text-lg">
            Gita Life NYC
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
          className="flex h-10 w-10 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 sm:hidden"
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
        <div className="border-t border-gray-200 bg-white sm:hidden">
          <ul className="flex flex-col gap-1 px-5 py-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
