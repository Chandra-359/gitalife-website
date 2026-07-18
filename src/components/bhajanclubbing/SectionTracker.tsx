"use client";

/**
 * SectionTracker — fixed top-right scroll-spy rail for /bhajanclubbing.
 *
 * A frosted neon pill pinned under the navbar: one dot per section, the
 * on-screen section lit saffron with its label in amber, plus a thin
 * headline-gradient line along the bottom tracking overall page
 * progress. Clicking an entry jumps straight to that section —
 * deliberately instant, bypassing the site-wide smooth scroll. Below
 * `md` the inactive labels collapse so only dots + the current label
 * render and the pill stays compact.
 */

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "top", label: "Top" },
  { id: "vibe", label: "Vibe" },
  { id: "lineup", label: "Lineup" },
  { id: "details", label: "Details" },
  { id: "prasadam", label: "Prasadam" },
  { id: "tickets", label: "Tickets" },
  { id: "crew", label: "Crew" },
  { id: "faq", label: "FAQ" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/** Matches the sections' scroll-mt-20 so jumps clear the fixed nav. */
const NAV_OFFSET = 80;

export default function SectionTracker() {
  const [active, setActive] = useState<SectionId>("top");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);

      // Pinned to the bottom → the last section wins even if it's too
      // short to ever cross the activation line.
      if (max > 0 && window.scrollY >= max - 2) {
        setActive(SECTIONS[SECTIONS.length - 1].id);
        return;
      }

      // A section is "where you are" once its top passes a line in the
      // upper third of the viewport.
      const line = window.scrollY + window.innerHeight * 0.38;
      let current: SectionId = "top";
      for (const { id } of SECTIONS) {
        if (id === "top") continue;
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= line) current = id;
      }
      setActive(current);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const jump = useCallback((id: SectionId) => {
    setActive(id);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed right-4 top-[76px] z-30 sm:right-6"
      aria-label="Page sections"
    >
      <div
        className="relative overflow-hidden rounded-full"
        style={{
          background: "linear-gradient(165deg, rgba(122,92,158,0.14), rgba(42,27,56,0.72) 55%, rgba(26,26,29,0.8))",
          border: "1px solid rgba(244,240,235,0.14)",
          backdropFilter: "blur(14px) saturate(1.35)",
          WebkitBackdropFilter: "blur(14px) saturate(1.35)",
          boxShadow: "inset 0 1px 0 rgba(244,240,235,0.09), 0 14px 40px -16px rgba(16,12,20,0.75)",
        }}
      >
        <ul className="flex items-center gap-0.5 px-2 py-1">
          {SECTIONS.map(({ id, label }) => {
            const isActive = id === active;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => jump(id)}
                  aria-current={isActive ? "location" : undefined}
                  className="group flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1.5 sm:px-2.5"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200 ${
                      isActive ? "" : "group-hover:bg-[rgba(244,240,235,0.6)]"
                    }`}
                    style={
                      isActive
                        ? {
                            background: "var(--bc2-saffron)",
                            boxShadow: "0 0 8px rgba(217,138,74,0.9), 0 0 18px rgba(217,138,74,0.5)",
                          }
                        : { background: "rgba(244,240,235,0.28)" }
                    }
                    aria-hidden
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-200 ${
                      isActive
                        ? "text-[#F0DEC0]"
                        : "hidden text-[rgba(244,240,235,0.45)] group-hover:text-[rgba(244,240,235,0.85)] md:inline"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* overall page progress — headline gradient underline */}
        <div className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] overflow-hidden rounded-full" aria-hidden>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, var(--bc2-amber), var(--bc2-saffron), var(--bc2-pink), var(--bc2-blue))",
              boxShadow: "0 0 8px rgba(217,138,74,0.6)",
            }}
          />
        </div>
      </div>
    </motion.nav>
  );
}
