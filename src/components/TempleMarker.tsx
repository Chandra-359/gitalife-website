"use client";

/**
 * TempleMarker — Unique animated marker for ISKCON New York temple
 *
 * Design: Krishna's flute adorned with a peacock feather, surrounded
 * by a divine golden aura. Much larger and more elaborate than the
 * regular diya markers — this is the "home base" of Gita Life NYC.
 *
 * Animation layers (Framer Motion):
 *  1. Divine aura — large slow-breathing radial gradient
 *  2. Lotus ring — rotating ring of lotus petals
 *  3. Peacock feather — gentle sway animation
 *  4. Krishna's flute — the central icon
 *  5. Label — "ISKCON New York"
 */

import { motion } from "framer-motion";
import { Marker } from "react-map-gl/mapbox";

/* ------------------------------------------------------------------ */
/*  ISKCON temple coordinates                                          */
/* ------------------------------------------------------------------ */
const TEMPLE_LNG = -73.9817;
const TEMPLE_LAT = 40.6867;

/* ------------------------------------------------------------------ */
/*  Framer Motion variants                                              */
/* ------------------------------------------------------------------ */

/** Divine aura — slow breathing golden light */
const auraBreathe = {
  animate: {
    scale: [1, 1.12, 1, 1.08, 1],
    opacity: [0.35, 0.2, 0.3, 0.22, 0.35],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Outer divine ring — slow rotation */
const ringRotate = {
  animate: {
    rotate: [0, 360],
    transition: {
      duration: 40,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

/** Peacock feather — gentle organic sway */
const featherSway = {
  animate: {
    rotate: [-3, 3, -2, 4, -3],
    scaleY: [1, 1.02, 0.99, 1.01, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Flute shimmer — subtle glow pulse */
const fluteShimmer = {
  animate: {
    filter: [
      "drop-shadow(0 0 4px rgba(212, 168, 67, 0.4))",
      "drop-shadow(0 0 10px rgba(212, 168, 67, 0.7))",
      "drop-shadow(0 0 4px rgba(212, 168, 67, 0.4))",
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Entrance — springs in from nothing */
const entrance = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100,
      delay: 0.5,
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface TempleMarkerProps {
  onClick: () => void;
  isActive: boolean;
}

export default function TempleMarker({ onClick, isActive }: TempleMarkerProps) {
  return (
    <Marker
      longitude={TEMPLE_LNG}
      latitude={TEMPLE_LAT}
      anchor="center"
    >
      <motion.button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        aria-label="ISKCON New York Temple"
        className="group relative flex items-center justify-center focus:outline-none"
        style={{ cursor: "pointer" }}
        variants={entrance}
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.08, transition: { type: "spring", damping: 10 } }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Layer 1 — Divine aura (large golden radial glow) */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: isActive ? 160 : 120,
            height: isActive ? 160 : 120,
            background: "radial-gradient(circle, rgba(212, 168, 67, 0.35) 0%, rgba(232, 117, 26, 0.15) 40%, transparent 70%)",
          }}
          variants={auraBreathe}
          animate="animate"
        />

        {/* Layer 2 — Rotating lotus petal ring */}
        <motion.span
          className="absolute flex items-center justify-center"
          style={{
            width: isActive ? 100 : 80,
            height: isActive ? 100 : 80,
          }}
          variants={ringRotate}
          animate="animate"
        >
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            {/* 12 lotus petals arranged in a circle */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = i * 30;
              return (
                <ellipse
                  key={i}
                  cx="50"
                  cy="15"
                  rx="4"
                  ry="10"
                  fill="#D4A843"
                  opacity="0.2"
                  transform={`rotate(${angle}, 50, 50)`}
                />
              );
            })}
            {/* Inner ring */}
            <circle cx="50" cy="50" r="22" stroke="#D4A843" strokeWidth="0.5" opacity="0.2" />
          </svg>
        </motion.span>

        {/* Layer 3 — Central icon: Peacock feather + Flute */}
        <motion.span
          className="relative z-10 flex items-center justify-center"
          animate={{
            scale: isActive ? 1.15 : 1,
            transition: { type: "spring", damping: 14, stiffness: 180 },
          }}
        >
          <svg
            width="56"
            height="64"
            viewBox="0 0 56 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Peacock feather — behind the flute */}
            <motion.g
              variants={featherSway}
              animate="animate"
              style={{ transformOrigin: "28px 50px" }}
            >
              {/* Feather shaft */}
              <path
                d="M28 8 C28 8, 27 30, 28 52"
                stroke="#2E7D32"
                strokeWidth="1"
                opacity="0.6"
              />
              {/* Feather eye — the iconic peacock eye */}
              <ellipse cx="28" cy="16" rx="9" ry="13" fill="#1B5E20" opacity="0.5" />
              <ellipse cx="28" cy="15" rx="7" ry="10" fill="#2E7D32" opacity="0.6" />
              <ellipse cx="28" cy="14" rx="5" ry="7" fill="#1565C0" opacity="0.5" />
              <ellipse cx="28" cy="13" rx="3" ry="4.5" fill="#0D47A1" opacity="0.7" />
              {/* Golden eye center */}
              <ellipse cx="28" cy="12" rx="1.8" ry="2.5" fill="#D4A843" opacity="0.9" />

              {/* Feather barbs — fine lines radiating from shaft */}
              {Array.from({ length: 7 }, (_, i) => {
                const y = 10 + i * 5;
                const spread = 6 + (7 - Math.abs(i - 3)) * 1.5;
                return (
                  <g key={i}>
                    <line
                      x1="28" y1={y}
                      x2={28 - spread} y2={y - 2}
                      stroke="#2E7D32" strokeWidth="0.4" opacity="0.3"
                    />
                    <line
                      x1="28" y1={y}
                      x2={28 + spread} y2={y - 2}
                      stroke="#2E7D32" strokeWidth="0.4" opacity="0.3"
                    />
                  </g>
                );
              })}
            </motion.g>

            {/* Krishna's Flute — diagonal across the feather */}
            <motion.g variants={fluteShimmer} animate="animate">
              {/* Flute body */}
              <rect
                x="12" y="38"
                width="32" height="5"
                rx="2.5"
                fill="#8B6914"
                transform="rotate(-20, 28, 40)"
              />
              {/* Flute holes */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle
                  key={i}
                  cx={16 + i * 5}
                  cy={39}
                  r="1"
                  fill="#5C4A0E"
                  opacity="0.7"
                  transform="rotate(-20, 28, 40)"
                />
              ))}
              {/* Flute golden highlight */}
              <rect
                x="12" y="38"
                width="32" height="1.5"
                rx="0.75"
                fill="#D4A843"
                opacity="0.4"
                transform="rotate(-20, 28, 40)"
              />
            </motion.g>

            {/* Base — lotus platform */}
            <ellipse cx="28" cy="55" rx="14" ry="4" fill="#D4A843" opacity="0.2" />
            <ellipse cx="28" cy="55" rx="10" ry="2.5" fill="#E8751A" opacity="0.15" />
          </svg>
        </motion.span>

        {/* Layer 4 — Label */}
        <motion.span
          className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white"
          style={{
            background: "linear-gradient(135deg, #D4A843dd, #E8751Add)",
            boxShadow: "0 2px 16px rgba(212, 168, 67, 0.4)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          ISKCON New York
        </motion.span>
      </motion.button>
    </Marker>
  );
}
