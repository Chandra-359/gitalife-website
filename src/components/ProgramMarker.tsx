"use client";

/**
 * ProgramMarker — Animated Diya (oil lamp) marker with Framer Motion
 *
 * Design: Each program is a flickering diya that casts warm light on the
 * dark city map. All animations use Framer Motion for physics-based,
 * GPU-accelerated motion instead of CSS keyframes.
 *
 * Layers (bottom to top):
 *  1. Ambient halo — soft radial gradient that breathes
 *  2. Pulse ring — expanding/fading ring of light
 *  3. Flame SVG — animated teardrop with inner glow
 *  4. Label — program title on hover/select
 */

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Marker } from "react-map-gl/mapbox";
import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";

/* ------------------------------------------------------------------ */
/*  Framer Motion Variants                                             */
/* ------------------------------------------------------------------ */

/** Marker entrance — springs in from nothing */
const markerEntrance = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, damping: 12, stiffness: 200, delay: Math.random() * 0.4 },
  },
};

/** Flame flicker — continuous organic sway using keyframes */
const flameFlicker = {
  animate: {
    scaleY: [1, 1.06, 0.95, 1.04, 0.97, 1.02, 1],
    scaleX: [1, 0.96, 1.03, 0.97, 1.02, 0.98, 1],
    rotate: [0, -1.5, 1, -0.8, 1.2, -0.5, 0],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Inner flame shimmer — slightly offset timing for depth */
const innerFlameShimmer = {
  animate: {
    scaleY: [1, 1.1, 0.92, 1.05, 0.97, 1],
    scaleX: [1, 0.93, 1.05, 0.96, 1.02, 1],
    opacity: [0.7, 0.85, 0.65, 0.8, 0.7, 0.7],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Core white-hot center — gentle throb */
const coreGlow = {
  animate: {
    scale: [1, 1.15, 0.9, 1.1, 1],
    opacity: [0.8, 0.95, 0.7, 0.9, 0.8],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Halo breathing — slow ambient glow expansion */
const haloBreathe = {
  animate: {
    scale: [1, 1.18, 1, 1.12, 1],
    opacity: [0.45, 0.25, 0.4, 0.3, 0.45],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Pulse ring — expands outward and fades */
const pulseRing = {
  animate: {
    scale: [0.8, 2],
    opacity: [0.55, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

/** Label reveal */
const labelVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, damping: 20, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ProgramMarkerProps {
  program: Program;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (program: Program) => void;
}

export default function ProgramMarker({ program, isSelected, isHovered = false, onSelect }: ProgramMarkerProps) {
  const { bg, glow } = getCategoryColor(program.category);
  const highlighted = isSelected || isHovered;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(program);
    },
    [program, onSelect],
  );

  return (
    <Marker
      longitude={program.longitude}
      latitude={program.latitude}
      anchor="center"
    >
      <motion.button
        onClick={handleClick}
        aria-label={`View details for ${program.title}`}
        className="group relative flex items-center justify-center focus:outline-none"
        style={{ cursor: "pointer" }}
        variants={markerEntrance}
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.12, transition: { type: "spring", damping: 10 } }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Layer 1 — Ambient halo (soft radial glow) */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: highlighted ? 90 : 65,
            height: highlighted ? 90 : 65,
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          }}
          variants={haloBreathe}
          animate="animate"
        />

        {/* Layer 2 — Expanding pulse ring */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: highlighted ? 54 : 40,
            height: highlighted ? 54 : 40,
            background: glow,
          }}
          variants={pulseRing}
          animate="animate"
        />

        {/* Layer 3 — Diya flame SVG with physics-based flicker */}
        <motion.span
          className="relative z-10 flex items-center justify-center"
          style={{
            transformOrigin: "center bottom",
            filter: highlighted
              ? `drop-shadow(0 0 14px ${glow}) drop-shadow(0 0 28px ${glow})`
              : `drop-shadow(0 0 10px ${glow}) drop-shadow(0 0 20px ${glow})`,
          }}
          animate={{
            scale: highlighted ? 1.35 : 1,
            transition: { type: "spring", damping: 14, stiffness: 180 },
          }}
        >
          <motion.svg
            width="34"
            height="44"
            viewBox="0 0 34 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            variants={flameFlicker}
            animate="animate"
            style={{ transformOrigin: "center bottom" }}
          >
            {/* Outer flame body — teardrop */}
            <motion.path
              d="M17 2C17 2 5 18 5 27C5 33.5 10.2 38 17 38C23.8 38 29 33.5 29 27C29 18 17 2 17 2Z"
              fill={bg}
              style={{ filter: `drop-shadow(0 0 6px ${bg})` }}
            />

            {/* Inner flame — brighter, offset timing */}
            <motion.path
              d="M17 10C17 10 10 21 10 27C10 31 12.8 34 17 34C21.2 34 24 31 24 27C24 21 17 10 17 10Z"
              fill="#FFD700"
              variants={innerFlameShimmer}
              animate="animate"
              style={{ transformOrigin: "center bottom" }}
            />

            {/* White-hot core — pulsing center */}
            <motion.ellipse
              cx="17"
              cy="29"
              rx="3.5"
              ry="4.5"
              fill="#FFF8E1"
              variants={coreGlow}
              animate="animate"
            />

            {/* Diya base — ceramic lamp bowl */}
            <ellipse cx="17" cy="38.5" rx="8" ry="3" fill={bg} opacity="0.5" />
            <ellipse cx="17" cy="38.5" rx="5.5" ry="1.8" fill="#FFD700" opacity="0.25" />
          </motion.svg>
        </motion.span>

        {/* Layer 4 — Program title label (shown on select or list hover) */}
        <AnimatePresence>
          {highlighted && (
            <motion.span
              className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1 text-[11px] font-semibold tracking-wide"
              style={{
                background: `${bg}dd`,
                color: "#fff",
                boxShadow: `0 2px 16px ${glow}`,
              }}
              variants={labelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {program.title}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Hover label — only when not highlighted */}
        {!highlighted && (
          <span
            className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1 text-[11px] font-semibold tracking-wide opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1"
            style={{
              background: `${bg}dd`,
              color: "#fff",
              boxShadow: `0 2px 12px ${glow}`,
            }}
          >
            {program.title}
          </span>
        )}
      </motion.button>
    </Marker>
  );
}
