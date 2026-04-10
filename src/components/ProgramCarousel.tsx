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
/* ------------------------------------------------------------------ */
/*  Temple card constants                                               */
/* ------------------------------------------------------------------ */
const TEMPLE_ID = "__iskcon_temple__";

interface ProgramCarouselProps {
  programs: Program[];
  selectedProgram: Program | null;
  onSelect: (program: Program) => void;
  onClose: () => void;
  visible: boolean;
  /** When true, the ISKCON temple card is the active (highlighted) card */
  templeActive?: boolean;
  /** Called when the temple card is clicked / scrolled-to */
  onTempleSelect?: () => void;
}

export default function ProgramCarousel({
  programs,
  selectedProgram,
  onSelect,
  onClose,
  visible,
  templeActive = false,
  onTempleSelect,
}: ProgramCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll the active card into view (temple card is index 0, programs start at 1)
  useEffect(() => {
    if (!scrollRef.current) return;

    let cardIdx: number;
    if (templeActive) {
      cardIdx = 0;
    } else if (selectedProgram) {
      const progIdx = programs.findIndex((p) => p.id === selectedProgram.id);
      if (progIdx < 0) return;
      cardIdx = progIdx + 1; // +1 because temple is at index 0
    } else {
      return;
    }

    const container = scrollRef.current;
    const cards = container.children;
    if (!cards[cardIdx]) return;

    const card = cards[cardIdx] as HTMLElement;
    const scrollLeft = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;

    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [selectedProgram, programs, templeActive]);

  // Handle snap-scroll end to detect which card is centered
  // Index 0 = temple card, 1..N = program cards
  const handleScrollEnd = useCallback(() => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const centerX = container.scrollLeft + container.offsetWidth / 2;

    let closestIdx = 0;
    let closestDist = Infinity;

    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement;
      // Skip the right spacer (last child has no data-card attribute)
      if (!el.dataset.card) return;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });

    if (closestIdx === 0) {
      // Temple card snapped — activate it
      if (!templeActive) onTempleSelect?.();
    } else {
      const snappedProgram = programs[closestIdx - 1]; // -1 for temple offset
      if (snappedProgram && snappedProgram.id !== selectedProgram?.id) {
        onSelect(snappedProgram);
      }
    }
  }, [programs, selectedProgram, onSelect, templeActive, onTempleSelect]);

  // Debounced scroll handler
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onScroll = useCallback(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(handleScrollEnd, 150);
  }, [handleScrollEnd]);

  // Nav arrow handlers — temple is position 0, programs start at 1
  // totalCount includes the temple card
  const totalCount = programs.length + 1;

  // Current position in the carousel: 0 = temple, 1..N = programs
  const currentPos = templeActive
    ? 0
    : selectedProgram
      ? programs.findIndex((p) => p.id === selectedProgram.id) + 1
      : -1;

  const goNext = useCallback(() => {
    if (templeActive) {
      // From temple → first program
      onSelect(programs[0]);
      return;
    }
    if (!selectedProgram) {
      onTempleSelect?.();
      return;
    }
    const idx = programs.findIndex((p) => p.id === selectedProgram.id);
    const next = programs[Math.min(idx + 1, programs.length - 1)];
    onSelect(next);
  }, [programs, selectedProgram, onSelect, templeActive, onTempleSelect]);

  const goPrev = useCallback(() => {
    if (!selectedProgram && !templeActive) {
      onTempleSelect?.();
      return;
    }
    if (templeActive) return; // already at the start
    const idx = programs.findIndex((p) => p.id === selectedProgram!.id);
    if (idx <= 0) {
      // Go back to temple card
      onTempleSelect?.();
    } else {
      onSelect(programs[idx - 1]);
    }
  }, [programs, selectedProgram, onSelect, templeActive, onTempleSelect]);

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
                disabled={currentPos <= 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                aria-label="Previous program"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Counter */}
              <span className="text-xs font-medium tracking-wider text-white/40">
                {currentPos >= 0 ? currentPos + 1 : "–"} / {totalCount}
              </span>

              {/* Next arrow */}
              <button
                onClick={goNext}
                disabled={currentPos >= totalCount - 1}
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
            {/* ---- ISKCON Temple card (always first) ---- */}
            <motion.div
              key={TEMPLE_ID}
              data-card="temple"
              variants={cardVariants}
              className={`relative flex shrink-0 snap-center cursor-pointer flex-col overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                templeActive
                  ? "border-[#D4A843]/30 bg-[#0c0c20]/80 shadow-2xl"
                  : "border-white/[0.06] bg-[#0c0c20]/50 shadow-lg hover:border-[#D4A843]/20 hover:bg-[#0c0c20]/65"
              }`}
              style={{
                width: templeActive ? "min(340px, 85vw)" : "min(280px, 72vw)",
                boxShadow: templeActive ? "0 8px 40px rgba(212, 168, 67, 0.3)" : undefined,
              }}
              onClick={() => onTempleSelect?.()}
              whileHover={!templeActive ? { scale: 1.02, y: -2 } : undefined}
              whileTap={{ scale: 0.98 }}
              layout
            >
              {/* Header with divine gradient */}
              <div className="relative h-28 w-full shrink-0 overflow-hidden md:h-32">
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(212, 168, 67, 0.3) 0%, rgba(232, 117, 26, 0.15) 40%, #0c0c20 100%)",
                  }}
                />
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "20px 20px",
                  }}
                />

                {/* Home base badge */}
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #D4A843, #E8751A)",
                      boxShadow: "0 0 10px rgba(212, 168, 67, 0.5)",
                    }}
                  >
                    🙏
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90"
                    style={{ background: "rgba(212, 168, 67, 0.35)" }}
                  >
                    Home Base
                  </span>
                </div>

                {/* Om decoration */}
                <span className="absolute right-3 top-2 text-xl text-white/[0.06]">ॐ</span>

                {/* Active indicator */}
                {templeActive && (
                  <motion.div
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{ background: "linear-gradient(90deg, #D4A843, #E8751A)" }}
                    layoutId="activeIndicator"
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  />
                )}
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-2 p-4">
                <h3 className={`font-bold leading-snug text-white ${templeActive ? "text-base" : "text-sm"}`}>
                  ISKCON New York
                </h3>

                {/* Address */}
                <div className="flex items-center gap-1.5 text-xs text-white/45">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path d="M8 1C5 1 2.5 3.5 2.5 6.5C2.5 10.5 8 15 8 15s5.5-4.5 5.5-8.5C13.5 3.5 11 1 8 1Z" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="8" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  305 Schermerhorn St, Brooklyn
                </div>

                {/* Description — only when active */}
                <AnimatePresence>
                  {templeActive && (
                    <motion.p
                      className="text-xs leading-relaxed text-white/60"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      The heart of Gita Life NYC. Founded in 1966 by His Divine Grace
                      A.C. Bhaktivedanta Swami Prabhupāda — where the Hare Krishna
                      movement began in the Western world.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {programs.map((program) => {
              const isActive = selectedProgram?.id === program.id;
              const { bg, glow } = getCategoryColor(program.category);

              return (
                <motion.div
                  key={program.id}
                  data-card="program"
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
                      Every {program.dayOfWeek}{program.time ? ` · ${program.time}` : ""}
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
