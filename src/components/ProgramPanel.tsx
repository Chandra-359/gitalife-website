"use client";

import { motion } from "framer-motion";
import type { Program } from "@/data/programs";
import { CATEGORY_COLORS } from "@/data/programs";

/* ------------------------------------------------------------------ */
/*  Category icons (matches ProgramMarker)                             */
/* ------------------------------------------------------------------ */
const CATEGORY_ICON: Record<Program["category"], string> = {
  "Kirtan & Prasadam": "♫",
  Retreat: "☀",
  "Wisdom Session": "☸",
  "Youth Festival": "✦",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const panelVariants = {
  hidden: {
    x: 80,
    opacity: 0,
    scale: 0.96,
    filter: "blur(8px)",
  },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      damping: 28,
      stiffness: 260,
      mass: 0.9,
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
  exit: {
    x: 60,
    opacity: 0,
    scale: 0.97,
    filter: "blur(6px)",
    transition: {
      type: "spring" as const,
      damping: 32,
      stiffness: 300,
      mass: 0.8,
    },
  },
};

const childVariants = {
  hidden: { y: 14, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, damping: 24, stiffness: 200 },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface ProgramPanelProps {
  program: Program;
  onClose: () => void;
}

export default function ProgramPanel({ program, onClose }: ProgramPanelProps) {
  const { bg, glow } = CATEGORY_COLORS[program.category];

  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute right-5 top-5 z-30 flex w-[370px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c20]/70 shadow-2xl backdrop-blur-xl max-sm:inset-x-4 max-sm:right-4 max-sm:top-auto max-sm:bottom-6 max-sm:w-auto"
    >
      {/* ---- Photo placeholder ---- */}
      <motion.div
        variants={childVariants}
        className="relative h-44 w-full overflow-hidden max-sm:h-36"
      >
        {/* Gradient placeholder — swap for <Image> later */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${bg}33 0%, #0c0c20 70%)`,
          }}
        />

        {/* Faint pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />

        {/* Category badge floated inside photo area */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-white shadow-lg"
            style={{ background: bg, boxShadow: `0 0 12px ${glow}` }}
          >
            {CATEGORY_ICON[program.category]}
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/90"
            style={{ background: `${bg}66` }}
          >
            {program.category}
          </span>
        </div>

        {/* Placeholder label */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-widest text-white/20">
          Photo
        </span>
      </motion.div>

      {/* ---- Content ---- */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <motion.h2
          variants={childVariants}
          className="text-xl font-bold leading-tight text-white"
        >
          {program.title}
        </motion.h2>

        {/* Date row */}
        <motion.div
          variants={childVariants}
          className="flex items-center gap-2 text-sm text-white/50"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2 7h12" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {formatDate(program.date)}
        </motion.div>

        <motion.p
          variants={childVariants}
          className="text-sm leading-relaxed text-white/70"
        >
          {program.description}
        </motion.p>

        {/* CTA */}
        <motion.button
          variants={childVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-1 w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-shadow hover:shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
            boxShadow: `0 4px 24px ${glow}`,
          }}
        >
          RSVP — Join This Program
        </motion.button>
      </div>

      {/* ---- Close button ---- */}
      <button
        onClick={onClose}
        aria-label="Close panel"
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 2l10 10M12 2L2 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </motion.div>
  );
}
