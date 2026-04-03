"use client";

/**
 * Navbar — Persistent floating navigation bar
 *
 * Now supports both the homepage (scrollable, with section anchors)
 * and the programs page (fixed viewport).
 */

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface NavbarProps {
  /** When true, uses anchor links (#about, #gallery etc). When false, uses page routes. */
  isHomepage?: boolean;
}

export default function Navbar({ isHomepage = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = isHomepage
    ? [
        { label: "About", href: "#about" },
        { label: "Programs", href: "/programs" },
        { label: "Gallery", href: "#gallery" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "About", href: "/#about" },
        { label: "Gallery", href: "/#gallery" },
      ];

  const ctaHref = isHomepage ? "#get-connected" : "/#get-connected";

  return (
    <nav
      className={`pointer-events-auto ${isHomepage ? "fixed" : "absolute"} inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-3 sm:px-8`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* ---- Glassmorphism backdrop ---- */}
      <div className="pointer-events-none absolute inset-0 border-b border-[#E8751A]/10 bg-[#FFF9F0]/85 backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)]" />

      {/* ---- Logo ---- */}
      <Link
        href="/"
        className="relative z-10 flex items-center gap-2.5 transition-opacity hover:opacity-80 group"
        aria-label="Gita Life NYC — Home"
      >
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 28 28"
            fill="none"
            className="shrink-0"
          >
            <circle cx="14" cy="14" r="13" stroke="#E8751A" strokeWidth="1" opacity="0.3" />
            <circle cx="14" cy="14" r="13" stroke="#E8751A" strokeWidth="1" opacity="0.15" strokeDasharray="4 4">
              <animateTransform attributeName="transform" type="rotate" from="0 14 14" to="360 14 14" dur="20s" repeatCount="indefinite" />
            </circle>
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
        </motion.div>

        <span className="text-base font-bold tracking-tight text-gray-900 sm:text-lg">
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
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-[#E8751A]/5 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-[#E8751A]/5 hover:text-gray-900"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}

        <li className="ml-2">
          <motion.a
            href={ctaHref}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(232,117,26,0.35)" }}
            whileTap={{ scale: 0.97 }}
            className="inline-block rounded-full bg-[#E8751A] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(232,117,26,0.25)] transition-all hover:bg-[#d4680f] relative overflow-hidden"
          >
            <span className="absolute inset-0 pointer-events-none">
              <span
                className="absolute inset-0 animate-shimmer"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
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
        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 sm:hidden"
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
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
