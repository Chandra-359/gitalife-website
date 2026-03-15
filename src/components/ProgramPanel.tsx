"use client";

/**
 * ProgramPanel — Floating detail card for the selected program
 *
 * Z-INDEX: z-30 (above map, below navbar)
 *
 * RESPONSIVE BEHAVIOR:
 * ├── Desktop (md+) ............ 370px card, right-5, top-20 (below navbar)
 * └── Mobile (<md) ............. Full-width bottom sheet, max 40vh, scrollable
 *
 * CUSTOMIZATION GUIDE:
 * ├── Photo ..................... Replace the gradient placeholder <div> with
 * │                              <Image src={program.image} /> once you add
 * │                              an `image` field to the Program interface.
 * ├── CTA button text .......... Search "RSVP" below to change the label
 * ├── CTA action ............... Wire onClick to your RSVP/booking flow
 * └── Category icons ........... Swap Unicode glyphs for SVG icons in CATEGORY_ICON
 */

import { motion } from "framer-motion";
import type { Program } from "@/data/programs";
import { CATEGORY_COLORS } from "@/data/programs";

/* ------------------------------------------------------------------ */
/*  Category → icon glyph                                              */
/*  TODO: Replace with custom SVG icons or an icon library for          */
/*        a more polished look. These are simple Unicode placeholders.  */
/* ------------------------------------------------------------------ */
const CATEGORY_ICON: Record<Program["category"], string> = {
  "Kirtan & Prasadam": "♫",
  Retreat: "☀",
  "Wisdom Session": "☸",
  "Youth Festival": "✦",
};

/* ------------------------------------------------------------------ */
/*  Date formatting helper                                             */
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
/*  Framer Motion variants                                             */
/*                                                                     */
/*  Desktop: slides in from the right (x: 80 → 0)                     */
/*  Mobile: the same variants work because the panel is repositioned   */
/*          via CSS — Framer handles the spring animation identically.  */
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
      className={
        /* ---------------------------------------------------------- */
        /*  DESKTOP (md+): fixed-width card floating top-right        */
        /*  MOBILE  (<md): full-width bottom sheet, max 40% height    */
        /* ---------------------------------------------------------- */
        "absolute z-30 flex flex-col overflow-hidden rounded-2xl " +
        "border border-white/[0.08] bg-[#0c0c20]/70 shadow-2xl backdrop-blur-xl " +
        /* Desktop positioning */
        "md:right-5 md:top-20 md:w-[370px] " +
        /* Mobile: anchor to bottom, full width with gutters, max 40vh */
        "max-md:inset-x-3 max-md:bottom-4 max-md:top-auto max-md:max-h-[40vh]"
      }
    >
      {/* ---- Scrollable inner wrapper (needed for mobile 40vh cap) ---- */}
      <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain">

        {/* ============================================================ */}
        {/*  PHOTO PLACEHOLDER                                           */}
        {/*                                                              */}
        {/*  TODO: Replace this entire <motion.div> block with a real    */}
        {/*  image once you add an `image` field to Program:             */}
        {/*                                                              */}
        {/*  import Image from "next/image";                             */}
        {/*  <Image                                                      */}
        {/*    src={program.image}                                       */}
        {/*    alt={program.title}                                       */}
        {/*    fill                                                      */}
        {/*    className="object-cover"                                  */}
        {/*  />                                                          */}
        {/* ============================================================ */}
        <motion.div
          variants={childVariants}
          className="relative h-40 w-full shrink-0 overflow-hidden md:h-44"
        >
          {/* Gradient fill using category accent color */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${bg}33 0%, #0c0c20 70%)`,
            }}
          />

          {/* Faint dot-grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Category badge — bottom-left of photo */}
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

          {/* Placeholder label — remove once real images are added */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-widest text-white/20">
            Photo
          </span>
        </motion.div>

        {/* ---- Text content ---- */}
        <div className="flex flex-1 flex-col gap-3 p-5 md:gap-4">
          {/* Title */}
          <motion.h2
            variants={childVariants}
            className="text-lg font-bold leading-tight text-white md:text-xl"
          >
            {program.title}
          </motion.h2>

          {/* Date row with calendar icon */}
          <motion.div
            variants={childVariants}
            className="flex items-center gap-2 text-sm text-white/50"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M2 7h12" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {formatDate(program.date)}
          </motion.div>

          {/* Description */}
          <motion.p
            variants={childVariants}
            className="text-sm leading-relaxed text-white/70"
          >
            {program.description}
          </motion.p>

          {/* ============================================================ */}
          {/*  CTA BUTTON                                                  */}
          {/*                                                              */}
          {/*  TODO: Wire this to your RSVP / booking flow.                */}
          {/*  Options:                                                    */}
          {/*    • Link to WhatsApp with pre-filled text                   */}
          {/*    • Open a modal registration form                          */}
          {/*    • Navigate to /get-connected?program={program.id}         */}
          {/* ============================================================ */}
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
      </div>

      {/* ---- Close (X) button ---- */}
      {/*
       * Clicking this clears selectedProgram AND flies the camera
       * back to the overview shot (wired via onClose → handleResetView).
       */}
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
