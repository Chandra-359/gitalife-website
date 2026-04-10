"use client";

/**
 * MobileBottomNav — Persistent bottom tab bar for mobile screens
 *
 * Inspired by Paramount+ / Peacock streaming app bottom navigation.
 * Uses glassmorphism backdrop matching the Gita Life warm aesthetic.
 * Only visible on screens < 640px (sm breakpoint).
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        {!active && <polyline points="9 22 9 12 15 12 15 22" />}
      </svg>
    ),
  },
  {
    label: "Programs",
    href: "/programs",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "About",
    href: "/#about",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  {
    label: "Connect",
    href: "/#get-connected",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 sm:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Glassmorphism backdrop */}
      <div
        className="absolute inset-0 border-t"
        style={{
          background: "rgba(255, 249, 240, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(232, 117, 26, 0.08)",
        }}
      />

      {/* Safe area padding for notched devices */}
      <div className="relative flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Wrapper = item.href.startsWith("/#") ? "a" : Link;

          return (
            <Wrapper
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors"
              aria-label={item.label}
            >
              {/* Active indicator dot */}
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-1 w-5 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #E8751A, #D4A843)" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}

              <span
                style={{ color: active ? "#E8751A" : "#9CA3AF" }}
                className="transition-colors"
              >
                {item.icon(active)}
              </span>
              <span
                className="text-[10px] font-semibold transition-colors"
                style={{ color: active ? "#E8751A" : "#9CA3AF" }}
              >
                {item.label}
              </span>
            </Wrapper>
          );
        })}
      </div>
    </nav>
  );
}
