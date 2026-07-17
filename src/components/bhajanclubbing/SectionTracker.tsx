"use client";

/**
 * SectionTracker — fixed top-right scroll-spy rail for /bhajanclubbing.
 *
 * A warm pill pinned under the navbar: one dot per section, the
 * on-screen section lit gold with its label in cream, plus a thin gold
 * line along the bottom tracking overall page progress. Clicking an
 * entry jumps straight to that section — deliberately instant,
 * bypassing the site-wide smooth scroll. Below `md` the inactive labels
 * collapse so only dots + the current label render and the pill stays
 * compact. (Prasadam/crew/connect scroll normally but stay off the rail
 * so it fits on one line.)
 */

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "top", label: "Top" },
  { id: "vibe", label: "Kirtan" },
  { id: "story", label: "Story" },
  { id: "listen", label: "Listen" },
  { id: "lineup", label: "Artists" },
  { id: "details", label: "Details" },
  { id: "tickets", label: "Tickets" },
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
          background: "linear-gradient(165deg, rgba(201,162,72,0.12), rgba(36,24,17,0.82) 55%, rgba(25,16,9,0.88))",
          border: "1px solid var(--bc3-line)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "inset 0 1px 0 rgba(251,245,230,0.08), 0 14px 40px -16px rgba(0,0,0,0.75)",
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
                      isActive ? "" : "group-hover:bg-[rgba(251,245,230,0.6)]"
                    }`}
                    style={
                      isActive
                        ? {
                            background: "var(--bc3-gold)",
                            boxShadow: "0 0 8px rgba(201,162,72,0.9), 0 0 18px rgba(201,162,72,0.5)",
                          }
                        : { background: "rgba(251,245,230,0.28)" }
                    }
                    aria-hidden
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-200 ${
                      isActive
                        ? "text-[#EDD698]"
                        : "hidden text-[rgba(251,245,230,0.45)] group-hover:text-[rgba(251,245,230,0.85)] md:inline"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* overall page progress — gold underline */}
        <div className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] overflow-hidden rounded-full" aria-hidden>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, var(--divine-gold-light), var(--divine-gold), var(--saffron))",
              boxShadow: "0 0 8px rgba(201,162,72,0.6)",
            }}
          />
        </div>
      </div>
    </motion.nav>
  );
}
