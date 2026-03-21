"use client";

/**
 * ProgramMarker — Realistic blazing diya (oil lamp) marker
 *
 * Design: Each program is a blazing diya flame with multiple fire layers,
 * rising sparks, and heat shimmer. All GPU-accelerated via Framer Motion.
 *
 * Flame layers (bottom to top):
 *  1. Wide ambient halo — warm radial glow breathing
 *  2. Pulse ring — expanding ring of light
 *  3. Outer fire — large turbulent base flame
 *  4. Mid fire — brighter inner flame body
 *  5. Inner fire — hot yellow-white core
 *  6. White-hot center — pulsing bright spot
 *  7. Sparks — rising ember particles
 *  8. Heat shimmer — wavy distortion above flame
 *  9. Diya base — ceramic oil lamp bowl
 */

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Marker } from "react-map-gl/mapbox";
import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";

/* ------------------------------------------------------------------ */
/*  Pre-computed spark particles for deterministic rendering            */
/* ------------------------------------------------------------------ */
const SPARKS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  startX: ((i * 7) % 5) - 2, // -2 to 2
  endX: ((i * 13) % 11) - 5,  // -5 to 5
  size: 1.5 + (i % 3) * 0.5,
  delay: (i * 0.35) % 2.5,
  duration: 1.2 + (i % 4) * 0.4,
}));

/* ------------------------------------------------------------------ */
/*  Framer Motion Variants                                             */
/* ------------------------------------------------------------------ */

const markerEntrance = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, damping: 12, stiffness: 200, delay: Math.random() * 0.4 },
  },
};

/** Outer flame — large turbulent sway */
const outerFlameAnim = {
  animate: {
    scaleY: [1, 1.08, 0.93, 1.06, 0.95, 1.03, 0.97, 1],
    scaleX: [1, 0.94, 1.05, 0.96, 1.04, 0.97, 1.02, 1],
    rotate: [0, -2.5, 1.8, -1.2, 2, -1.5, 0.8, 0],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Mid flame — faster, more energetic */
const midFlameAnim = {
  animate: {
    scaleY: [1, 1.12, 0.88, 1.1, 0.92, 1.05, 0.95, 1],
    scaleX: [1, 0.92, 1.07, 0.94, 1.05, 0.96, 1.03, 1],
    rotate: [0, 1.5, -2, 1, -1.5, 0.8, -0.5, 0],
    y: [0, -1, 0.5, -0.8, 0, -0.5, 0.3, 0],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Inner flame — fast flicker */
const innerFlameAnim = {
  animate: {
    scaleY: [1, 1.15, 0.85, 1.12, 0.9, 1.08, 0.93, 1],
    scaleX: [1, 0.9, 1.08, 0.93, 1.06, 0.95, 1.02, 1],
    opacity: [0.85, 0.95, 0.75, 0.9, 0.8, 0.88, 0.82, 0.85],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** White-hot core — rapid throb */
const coreGlow = {
  animate: {
    scale: [1, 1.2, 0.85, 1.15, 0.9, 1.1, 0.95, 1],
    opacity: [0.85, 1, 0.65, 0.95, 0.7, 0.9, 0.75, 0.85],
    transition: {
      duration: 1.0,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Halo breathing */
const haloBreathe = {
  animate: {
    scale: [1, 1.2, 1, 1.15, 1],
    opacity: [0.5, 0.25, 0.45, 0.3, 0.5],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Pulse ring */
const pulseRing = {
  animate: {
    scale: [0.8, 2.2],
    opacity: [0.6, 0],
    transition: {
      duration: 2.5,
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
  onSelect: (program: Program) => void;
}

export default function ProgramMarker({ program, isSelected, onSelect }: ProgramMarkerProps) {
  const { bg, glow } = getCategoryColor(program.category);

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
        whileHover={{ scale: 1.15, transition: { type: "spring", damping: 10 } }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Layer 1 — Ambient halo (soft radial glow) */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: isSelected ? 100 : 70,
            height: isSelected ? 100 : 70,
            background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`,
          }}
          variants={haloBreathe}
          animate="animate"
        />

        {/* Layer 2 — Expanding pulse ring */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: isSelected ? 56 : 42,
            height: isSelected ? 56 : 42,
            background: glow,
          }}
          variants={pulseRing}
          animate="animate"
        />

        {/* Layer 3 — Blazing flame SVG with multi-layer fire */}
        <motion.span
          className="relative z-10 flex items-center justify-center"
          style={{
            transformOrigin: "center bottom",
            filter: `drop-shadow(0 0 12px ${glow}) drop-shadow(0 0 24px ${glow}) drop-shadow(0 -4px 8px ${bg}88)`,
          }}
          animate={{
            scale: isSelected ? 1.4 : 1,
            transition: { type: "spring", damping: 14, stiffness: 180 },
          }}
        >
          <svg
            width="38"
            height="52"
            viewBox="0 0 38 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
          >
            <defs>
              {/* Flame gradients */}
              <radialGradient id={`flameOuter-${program.id}`} cx="50%" cy="70%" r="60%">
                <stop offset="0%" stopColor={bg} />
                <stop offset="60%" stopColor={bg} stopOpacity="0.7" />
                <stop offset="100%" stopColor="#8B2500" stopOpacity="0.3" />
              </radialGradient>
              <radialGradient id={`flameMid-${program.id}`} cx="50%" cy="65%" r="55%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor={bg} stopOpacity="0.9" />
                <stop offset="100%" stopColor={bg} stopOpacity="0.5" />
              </radialGradient>
              <radialGradient id={`flameInner-${program.id}`} cx="50%" cy="60%" r="50%">
                <stop offset="0%" stopColor="#FFF8DC" />
                <stop offset="40%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" stopOpacity="0.7" />
              </radialGradient>
              {/* Heat shimmer filter */}
              <filter id={`heat-${program.id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" seed={parseInt(program.id, 36) % 100}>
                  <animate attributeName="baseFrequency" values="0.04;0.06;0.04" dur="3s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" scale="2" />
              </filter>
            </defs>

            {/* Heat shimmer zone above flame */}
            <motion.ellipse
              cx="19"
              cy="4"
              rx="6"
              ry="8"
              fill={bg}
              opacity="0.04"
              filter={`url(#heat-${program.id})`}
              animate={{
                opacity: [0.03, 0.06, 0.03],
                scaleY: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "19px 4px" }}
            />

            {/* Outer fire — large turbulent base */}
            <motion.path
              d="M19 2C19 2 4 20 4 31C4 38.5 10.5 44 19 44C27.5 44 34 38.5 34 31C34 20 19 2 19 2Z"
              fill={`url(#flameOuter-${program.id})`}
              style={{ transformOrigin: "19px 35px" }}
              variants={outerFlameAnim}
              animate="animate"
            />

            {/* Wispy flame tendrils — left */}
            <motion.path
              d="M12 18C10 22 7 26 8 30C9 33 12 33 13 31"
              stroke={bg}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
              animate={{
                d: [
                  "M12 18C10 22 7 26 8 30C9 33 12 33 13 31",
                  "M11 16C8 21 6 25 7 29C8 32 11 33 12 30",
                  "M12 18C10 22 7 26 8 30C9 33 12 33 13 31",
                ],
                opacity: [0.3, 0.15, 0.3],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Wispy flame tendrils — right */}
            <motion.path
              d="M26 18C28 22 31 26 30 30C29 33 26 33 25 31"
              stroke={bg}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
              animate={{
                d: [
                  "M26 18C28 22 31 26 30 30C29 33 26 33 25 31",
                  "M27 16C30 21 32 25 31 29C30 32 27 33 26 30",
                  "M26 18C28 22 31 26 30 30C29 33 26 33 25 31",
                ],
                opacity: [0.25, 0.1, 0.25],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Mid fire — brighter body */}
            <motion.path
              d="M19 8C19 8 9 22 9 31C9 36 13.5 39 19 39C24.5 39 29 36 29 31C29 22 19 8 19 8Z"
              fill={`url(#flameMid-${program.id})`}
              style={{ transformOrigin: "19px 33px" }}
              variants={midFlameAnim}
              animate="animate"
            />

            {/* Inner fire — hot yellow-white core */}
            <motion.path
              d="M19 14C19 14 12 24 12 31C12 34.5 15 37 19 37C23 37 26 34.5 26 31C26 24 19 14 19 14Z"
              fill={`url(#flameInner-${program.id})`}
              style={{ transformOrigin: "19px 32px" }}
              variants={innerFlameAnim}
              animate="animate"
            />

            {/* White-hot center — pulsing */}
            <motion.ellipse
              cx="19"
              cy="33"
              rx="4"
              ry="5.5"
              fill="#FFF8E1"
              variants={coreGlow}
              animate="animate"
              style={{ transformOrigin: "19px 33px" }}
            />

            {/* Tiny bright flickering tip */}
            <motion.circle
              cx="19"
              cy="10"
              r="1.5"
              fill="#FFF"
              opacity="0.6"
              animate={{
                cy: [10, 8, 11, 9, 10],
                opacity: [0.6, 0.3, 0.5, 0.2, 0.6],
                r: [1.5, 2, 1, 1.8, 1.5],
              }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Rising sparks / embers */}
            {SPARKS.map((spark) => (
              <motion.circle
                key={spark.id}
                cx={19 + spark.startX}
                cy={12}
                r={spark.size}
                fill={spark.id % 2 === 0 ? "#FFD700" : bg}
                animate={{
                  cy: [12, -8 - spark.id * 2],
                  cx: [19 + spark.startX, 19 + spark.endX],
                  opacity: [0.9, 0],
                  r: [spark.size, spark.size * 0.3],
                }}
                transition={{
                  duration: spark.duration,
                  repeat: Infinity,
                  delay: spark.delay,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Diya base — ceramic lamp bowl */}
            <ellipse cx="19" cy="44" rx="9" ry="3.5" fill={bg} opacity="0.5" />
            <ellipse cx="19" cy="44" rx="6.5" ry="2.2" fill="#FFD700" opacity="0.2" />
            {/* Oil surface shimmer */}
            <motion.ellipse
              cx="19"
              cy="43.5"
              rx="5"
              ry="1.5"
              fill="#FFD700"
              opacity="0.1"
              animate={{
                opacity: [0.08, 0.15, 0.08],
                rx: [5, 5.3, 5],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.span>

        {/* Layer 4 — Program title label */}
        <AnimatePresence>
          {isSelected && (
            <motion.span
              className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wide glass-panel-light"
              style={{
                color: "#fff",
                boxShadow: `0 2px 16px ${glow}`,
                borderColor: `${bg}44`,
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

        {/* Hover label — only when not selected */}
        {!isSelected && (
          <span
            className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wide opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 glass-panel-light"
            style={{
              color: "#fff",
              boxShadow: `0 2px 12px ${glow}`,
              borderColor: `${bg}44`,
            }}
          >
            {program.title}
          </span>
        )}
      </motion.button>
    </Marker>
  );
}
