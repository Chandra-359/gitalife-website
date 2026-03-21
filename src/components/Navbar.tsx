"use client";

/**
 * Navbar — Persistent floating navigation bar
 *
 * Z-INDEX: z-40 (highest UI layer — always visible above panels & map)
 *
 * Features:
 *  - Glassmorphism backdrop with noise texture
 *  - Animated underline hover effects on links
 *  - Smooth CTA button with glow pulse
 *  - Premium display font for logo
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      {/* ---- Glassmorphism backdrop ---- */}
      <div className="noise-overlay pointer-events-none absolute inset-0 border-b border-white/[0.06] bg-[#0a0a1a]/60 backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)]" />

      {/* ---- Logo ---- */}
      <a
        href="/"
        className="group relative z-10 flex items-center gap-2.5 transition-opacity hover:opacity-90"
        aria-label="Gita Life NYC — Home"
      >
        {/* Minimal lotus icon */}
        <motion.svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          className="shrink-0"
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
        >
          <circle
            cx="14"
            cy="14"
            r="13"
            stroke="url(#navLogoGrad)"
            strokeWidth="1.2"
            opacity="0.5"
          />
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
          <defs>
            <linearGradient id="navLogoGrad" x1="0" y1="0" x2="28" y2="28">
              <stop offset="0%" stopColor="#E8751A" />
              <stop offset="100%" stopColor="#D4A843" />
            </linearGradient>
          </defs>
        </motion.svg>

        <span
          className="text-base font-bold tracking-tight text-white sm:text-lg"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Gita Life{" "}
          <span className="text-gradient-saffron">NYC</span>
        </span>
      </a>

      {/* ---- Desktop links ---- */}
      <ul className="relative z-10 hidden items-center gap-1 sm:flex">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="nav-link-underline rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}

        {/* Primary CTA */}
        <li className="ml-3">
          <motion.a
            href="#get-connected"
            className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#E8751A] to-[#D4A843] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_16px_rgba(232,117,26,0.25)] transition-shadow hover:shadow-[0_0_30px_rgba(232,117,26,0.4)]"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Shimmer on hover */}
            <motion.span
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1,
                ease: "easeInOut",
              }}
            />
            Get Connected
          </motion.a>
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
            <path
              d="M4 4l12 12M16 4L4 16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path
                d="M3 5h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M3 10h10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M3 15h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </button>

      {/* ---- Mobile dropdown ---- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="absolute inset-x-0 top-full z-10 border-b border-white/[0.06] bg-[#0a0a1a]/95 backdrop-blur-xl sm:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                className="mt-2"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <a
                  href="#get-connected"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl bg-gradient-to-r from-[#E8751A] to-[#D4A843] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_0_16px_rgba(232,117,26,0.25)]"
                >
                  Get Connected
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
