"use client";

/**
 * ProgramCarousel — Horizontally scrollable card strip at the bottom
 *
 * Shows all programs as compact cards. The active card is centered and
 * expanded. Swiping/scrolling between cards triggers a fly-to on the map.
 *
 * RESPONSIVE:
 *  Desktop: centered strip with ~320px cards, visible left/right neighbors
 *  Mobile: full-width snap-scrolling, one card at a time
 */

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";

/* ------------------------------------------------------------------ */
/*  Category icons                                                      */
/* ------------------------------------------------------------------ */
const CATEGORY_ICON: Record<string, string> = {
  "Kirtan & Prasadam": "♫",
  Retreat: "☀",
  "Wisdom Session": "☸",
  "Youth Festival": "✦",
};

/* ------------------------------------------------------------------ */
/*  Date formatting                                                     */
/* ------------------------------------------------------------------ */
function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Framer Motion variants                                              */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 26,
      stiffness: 200,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    y: 80,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" as const },
  },
};

const cardVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.92 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, damping: 22, stiffness: 220 },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface ProgramCarouselProps {
  programs: Program[];
  selectedProgram: Program | null;
  onSelect: (program: Program) => void;
  onClose: () => void;
  visible: boolean;
}

export default function ProgramCarousel({
  programs,
  selectedProgram,
  onSelect,
  onClose,
  visible,
}: ProgramCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll the selected card into view
  useEffect(() => {
    if (!selectedProgram || !scrollRef.current) return;

    const idx = programs.findIndex((p) => p.id === selectedProgram.id);
    const container = scrollRef.current;
    const cards = container.children;
    if (idx < 0 || !cards[idx]) return;

    const card = cards[idx] as HTMLElement;
    const scrollLeft = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;

    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [selectedProgram, programs]);

  // Handle snap-scroll end to detect which card is centered
  const handleScrollEnd = useCallback(() => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const centerX = container.scrollLeft + container.offsetWidth / 2;

    let closestIdx = 0;
    let closestDist = Infinity;

    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });

    const snappedProgram = programs[closestIdx];
    if (snappedProgram && snappedProgram.id !== selectedProgram?.id) {
      onSelect(snappedProgram);
    }
  }, [programs, selectedProgram, onSelect]);

  // Debounced scroll handler
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onScroll = useCallback(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(handleScrollEnd, 150);
  }, [handleScrollEnd]);

  // Nav arrow handlers
  const goNext = useCallback(() => {
    if (!selectedProgram) {
      onSelect(programs[0]);
      return;
    }
    const idx = programs.findIndex((p) => p.id === selectedProgram.id);
    const next = programs[Math.min(idx + 1, programs.length - 1)];
    onSelect(next);
  }, [programs, selectedProgram, onSelect]);

  const goPrev = useCallback(() => {
    if (!selectedProgram) {
      onSelect(programs[0]);
      return;
    }
    const idx = programs.findIndex((p) => p.id === selectedProgram.id);
    const prev = programs[Math.max(idx - 1, 0)];
    onSelect(prev);
  }, [programs, selectedProgram, onSelect]);

  const currentIdx = selectedProgram
    ? programs.findIndex((p) => p.id === selectedProgram.id)
    : -1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-x-0 bottom-0 z-30 flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* ---- Top bar: counter + close ---- */}
          <div className="flex items-center justify-between px-4 pb-2 md:px-6">
            <div className="flex items-center gap-2">
              {/* Prev arrow */}
              <button
                onClick={goPrev}
                disabled={currentIdx <= 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                aria-label="Previous program"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Counter */}
              <span className="text-xs font-medium tracking-wider text-white/40">
                {currentIdx >= 0 ? currentIdx + 1 : "–"} / {programs.length}
              </span>

              {/* Next arrow */}
              <button
                onClick={goNext}
                disabled={currentIdx >= programs.length - 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                aria-label="Next program"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close carousel"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ---- Scrollable card strip ---- */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-5 pt-1 md:gap-4 md:px-6"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {programs.map((program) => {
              const isActive = selectedProgram?.id === program.id;
              const { bg, glow } = getCategoryColor(program.category);

              return (
                <motion.div
                  key={program.id}
                  variants={cardVariants}
                  className={`relative flex shrink-0 snap-center cursor-pointer flex-col overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                    isActive
                      ? "border-white/15 bg-[#0c0c20]/80 shadow-2xl"
                      : "border-white/[0.06] bg-[#0c0c20]/50 shadow-lg hover:border-white/10 hover:bg-[#0c0c20]/65"
                  }`}
                  style={{
                    width: isActive ? "min(340px, 85vw)" : "min(280px, 72vw)",
                    boxShadow: isActive ? `0 8px 40px ${glow}` : undefined,
                  }}
                  onClick={() => onSelect(program)}
                  whileHover={!isActive ? { scale: 1.02, y: -2 } : undefined}
                  whileTap={{ scale: 0.98 }}
                  layout
                >
                  {/* ---- Photo / gradient header ---- */}
                  <div className="relative h-28 w-full shrink-0 overflow-hidden md:h-32">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${bg}40 0%, #0c0c20 80%)`,
                      }}
                    />
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Category badge */}
                    <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white shadow-md"
                        style={{ background: bg, boxShadow: `0 0 10px ${glow}` }}
                      >
                        {CATEGORY_ICON[program.category] ?? "●"}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90"
                        style={{ background: `${bg}55` }}
                      >
                        {program.category}
                      </span>
                    </div>

                    {/* Active indicator glow line at top */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-x-0 top-0 h-[2px]"
                        style={{ background: bg }}
                        layoutId="activeIndicator"
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                      />
                    )}
                  </div>

                  {/* ---- Card body ---- */}
                  <div className="flex flex-col gap-2 p-4">
                    <h3 className={`font-bold leading-snug text-white ${isActive ? "text-base" : "text-sm"}`}>
                      {program.title}
                    </h3>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-white/45">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                        <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M2 7h12" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      {formatDate(program.date)}
                    </div>

                    {/* Description — only show on active card */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.p
                          className="text-xs leading-relaxed text-white/60"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {program.description}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* RSVP button — only on active */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.button
                          className="mt-1 w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
                            boxShadow: `0 4px 20px ${glow}`,
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ type: "spring", damping: 20, stiffness: 250 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          RSVP — Join This Program
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}

            {/* Right spacer so last card can center */}
            <div className="shrink-0" style={{ width: "30vw" }} />
          </div>

          {/* ---- Bottom gradient behind cards ---- */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-full"
            style={{
              background: "linear-gradient(to top, rgba(10, 10, 26, 0.85) 0%, rgba(10, 10, 26, 0.4) 60%, transparent 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
