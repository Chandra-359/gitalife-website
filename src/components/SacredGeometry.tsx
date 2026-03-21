"use client";

/**
 * SacredGeometry — Animated Sri Yantra / mandala overlay centered on the map
 *
 * This component renders a subtle sacred geometry pattern that:
 *  - Centers concentric rings radiating from ISKCON temple (Mount Meru concept)
 *  - Draws interlocking triangles (Sri Yantra inspired)
 *  - Pulses gently with a breathing animation
 *  - Fades based on zoom level (more visible zoomed out, fades when zoomed in)
 *
 * Rendered as an SVG overlay above the map but below markers.
 * All pointer-events are disabled.
 */

import { motion } from "framer-motion";

interface SacredGeometryProps {
  visible: boolean;
}

/** Breathing pulse for the entire yantra */
const yantraBreathe = {
  animate: {
    opacity: [0.12, 0.18, 0.12, 0.15, 0.12],
    scale: [1, 1.01, 1, 1.005, 1],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Slow rotation for outer rings */
const outerRotate = {
  animate: {
    rotate: [0, 360],
    transition: {
      duration: 120,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

/** Counter-rotation for inner elements */
const innerRotate = {
  animate: {
    rotate: [360, 0],
    transition: {
      duration: 90,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

export default function SacredGeometry({ visible }: SacredGeometryProps) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 3, delay: 1 }}
    >
      <motion.div
        variants={yantraBreathe}
        animate="animate"
        className="relative"
        style={{ width: "min(90vw, 90vh)", height: "min(90vw, 90vh)" }}
      >
        <svg
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            <radialGradient id="yantra-fade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D4A843" stopOpacity="0.3" />
              <stop offset="40%" stopColor="#D4A843" stopOpacity="0.15" />
              <stop offset="70%" stopColor="#E8751A" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#E8751A" stopOpacity="0" />
            </radialGradient>

            <filter id="yantra-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ============================================================ */}
          {/*  CONCENTRIC RINGS — Mount Meru cosmic rings                  */}
          {/* ============================================================ */}
          <motion.g variants={outerRotate} animate="animate" style={{ transformOrigin: "300px 300px" }}>
            {/* Outermost ring — Bhuloka (Earth realm) */}
            <circle cx="300" cy="300" r="280" stroke="#D4A843" strokeWidth="0.5" opacity="0.15" />
            <circle cx="300" cy="300" r="275" stroke="#D4A843" strokeWidth="0.3" opacity="0.08" strokeDasharray="4 8" />

            {/* Second ring — Bhuvarloka */}
            <circle cx="300" cy="300" r="230" stroke="#D4A843" strokeWidth="0.5" opacity="0.18" />

            {/* Third ring — Svargaloka */}
            <circle cx="300" cy="300" r="180" stroke="#E8751A" strokeWidth="0.5" opacity="0.15" />

            {/* Decorative dots on outermost ring */}
            {Array.from({ length: 32 }, (_, i) => {
              const a = (i * 11.25 * Math.PI) / 180;
              return (
                <circle
                  key={`dot-outer-${i}`}
                  cx={300 + Math.cos(a) * 280}
                  cy={300 + Math.sin(a) * 280}
                  r={i % 4 === 0 ? 2 : 1}
                  fill="#D4A843"
                  opacity={i % 4 === 0 ? 0.2 : 0.1}
                />
              );
            })}

            {/* Lotus petals on second ring — 16 petals */}
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i * 22.5 * Math.PI) / 180;
              const cx = 300 + Math.cos(a) * 230;
              const cy = 300 + Math.sin(a) * 230;
              return (
                <ellipse
                  key={`petal-outer-${i}`}
                  cx={cx}
                  cy={cy}
                  rx="8"
                  ry="16"
                  fill="#D4A843"
                  opacity="0.06"
                  transform={`rotate(${i * 22.5}, ${cx}, ${cy})`}
                />
              );
            })}
          </motion.g>

          {/* ============================================================ */}
          {/*  SRI YANTRA — Interlocking triangles                         */}
          {/* ============================================================ */}
          <motion.g variants={innerRotate} animate="animate" style={{ transformOrigin: "300px 300px" }}>
            {/* Upward triangles — Shiva (masculine/consciousness) */}
            <polygon
              points="300,140 410,380 190,380"
              stroke="#D4A843"
              strokeWidth="0.8"
              fill="none"
              opacity="0.12"
            />
            <polygon
              points="300,170 390,360 210,360"
              stroke="#D4A843"
              strokeWidth="0.5"
              fill="none"
              opacity="0.08"
            />
            <polygon
              points="300,200 370,340 230,340"
              stroke="#D4A843"
              strokeWidth="0.4"
              fill="none"
              opacity="0.06"
            />

            {/* Downward triangles — Shakti (feminine/energy) */}
            <polygon
              points="300,460 190,220 410,220"
              stroke="#E8751A"
              strokeWidth="0.8"
              fill="none"
              opacity="0.12"
            />
            <polygon
              points="300,440 210,240 390,240"
              stroke="#E8751A"
              strokeWidth="0.5"
              fill="none"
              opacity="0.08"
            />
            <polygon
              points="300,420 230,260 370,260"
              stroke="#E8751A"
              strokeWidth="0.4"
              fill="none"
              opacity="0.06"
            />
          </motion.g>

          {/* ============================================================ */}
          {/*  INNER LOTUS — 8-petal lotus at the center (Bindu)           */}
          {/* ============================================================ */}
          <g filter="url(#yantra-glow)">
            {/* Inner protective circle */}
            <circle cx="300" cy="300" r="60" stroke="#D4A843" strokeWidth="0.6" opacity="0.15" />

            {/* 8 lotus petals */}
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              const cx = 300 + Math.cos(a) * 35;
              const cy = 300 + Math.sin(a) * 35;
              return (
                <ellipse
                  key={`inner-petal-${i}`}
                  cx={cx}
                  cy={cy}
                  rx="12"
                  ry="22"
                  fill="#D4A843"
                  opacity="0.05"
                  transform={`rotate(${i * 45}, ${cx}, ${cy})`}
                />
              );
            })}

            {/* Bindu — the sacred center point */}
            <circle cx="300" cy="300" r="8" fill="url(#yantra-fade)" opacity="0.4" />
            <circle cx="300" cy="300" r="3" fill="#D4A843" opacity="0.25" />
          </g>

          {/* ============================================================ */}
          {/*  NADI LINES — Energy channels radiating from center           */}
          {/* ============================================================ */}
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            const x2 = 300 + Math.cos(a) * 280;
            const y2 = 300 + Math.sin(a) * 280;
            return (
              <line
                key={`nadi-${i}`}
                x1="300"
                y1="300"
                x2={x2}
                y2={y2}
                stroke="#D4A843"
                strokeWidth="0.3"
                opacity="0.06"
                strokeDasharray="8 16"
              />
            );
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}
