"use client";

/**
 * Navbar — Persistent floating navigation bar.
 *
 * Homepage mode: transparent over the hero, fades into a warm glass surface
 * as the user scrolls past ~60px. On any other page it uses the solid glass
 * surface immediately.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface NavbarProps {
  /** When true, uses anchor links (#about, #gallery etc). When false, uses page routes. */
  isHomepage?: boolean;
}

export default function Navbar({ isHomepage = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Non-homepage routes always render the solid glass state.
  const [scrolled, setScrolled] = useState(!isHomepage);

  useEffect(() => {
    if (!isHomepage) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomepage]);

  const navLinks = isHomepage
    ? [
        { label: "Classes", href: "/classes" },
        { label: "Festival", href: "/festival" },
        { label: "Daily", href: "/daily" },
        { label: "Impact", href: "/impact" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Classes", href: "/classes" },
        { label: "Festival", href: "/festival" },
        { label: "Daily", href: "/daily" },
      ];

  const ctaHref = isHomepage ? "#get-connected" : "/#get-connected";

  const linkColor = scrolled ? "text-gray-600" : "text-white/85";
  const linkHover = scrolled
    ? "hover:bg-[#E8751A]/5 hover:text-gray-900"
    : "hover:bg-white/10 hover:text-white";
  const logoTextColor = scrolled ? "text-gray-900" : "text-white";

  return (
    <nav
      className={`pointer-events-auto ${isHomepage ? "fixed" : "absolute"} inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-3 sm:px-8`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* ---- Glassmorphism backdrop (animates opacity with scroll) ---- */}
      <div
        className={`pointer-events-none absolute inset-0 transition-all duration-400 ${
          scrolled
            ? "border-b border-[#E8751A]/10 bg-[#FFF9F0]/85 backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)]"
            : "border-b border-transparent bg-transparent"
        }`}
      />

      {/* ---- Logo ---- */}
      <Link
        href="/"
        className="relative z-10 flex items-center gap-2.5 transition-opacity hover:opacity-90 group"
        aria-label="Gita Life NYC — Home"
      >
        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          transition={{ type: "spring", damping: 14 }}
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 shadow-[0_6px_16px_-6px_rgba(232,117,26,0.5)]"
          style={{ background: "linear-gradient(135deg, #E8751A, #d4680f)" }}
        >
          <span className="text-white font-bold text-sm font-serif">G</span>
        </motion.div>

        <span className={`text-base font-bold tracking-tight sm:text-lg transition-colors ${logoTextColor}`}>
          Gita Life <span className="text-gradient-saffron">NYC</span>
        </span>
      </Link>

      {/* ---- Desktop links ---- */}
      <ul className="relative z-10 hidden items-center gap-1 sm:flex">
        {navLinks.map((link) => (
          <li key={link.label}>
            {link.href.startsWith("/") ? (
              <Link
                href={link.href}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${linkColor} ${linkHover}`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${linkColor} ${linkHover}`}
              >
                {link.label}
              </a>
            )}
          </li>
        ))}

        <li className="ml-2">
          <motion.a
            href={ctaHref}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="relative inline-block overflow-hidden rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-all btn-primary-gradient"
          >
            <span className="absolute inset-0 pointer-events-none">
              <span
                className="absolute inset-0 animate-shimmer"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                }}
              />
            </span>
            <span className="relative">Get Connected</span>
          </motion.a>
        </li>
      </ul>

      {/* ---- Mobile hamburger ---- */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:hidden ${
          scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
        }`}
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

      {/* ---- Mobile dropdown ---- */}
      <div
        className={`absolute inset-x-0 top-full z-10 border-b border-gray-200/60 bg-white/95 backdrop-blur-xl transition-all duration-300 sm:hidden ${
          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-5 py-4">
          {navLinks.map((link) => (
            <li key={link.label}>
              {link.href.startsWith("/") ? (
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
          <li className="mt-2">
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
    </nav>
  );
}
