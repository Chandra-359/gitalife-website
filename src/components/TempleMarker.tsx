"use client";

/**
 * TempleMarker — Vedic Vimana (temple tower) marker for ISKCON New York
 *
 * Design: A majestic temple vimana (tower/gopuram) silhouette with:
 *  - Divine aura with sacred geometry pattern
 *  - Rotating yantra ring (replaces lotus ring)
 *  - Temple gopuram silhouette with kalasha (golden pot) finial
 *  - Krishna's flute integrated at the base
 *  - Animated sacred flames on the tower
 *
 * This is the "Mount Meru" — the cosmic center of the Vedic map.
 */

import { motion } from "framer-motion";
import { Marker } from "react-map-gl/mapbox";

const TEMPLE_LNG = -73.9817;
const TEMPLE_LAT = 40.6867;

/* ------------------------------------------------------------------ */
/*  Framer Motion variants                                              */
/* ------------------------------------------------------------------ */

/** Divine aura — cosmic breathing light */
const auraBreathe = {
  animate: {
    scale: [1, 1.15, 1, 1.1, 1],
    opacity: [0.3, 0.18, 0.25, 0.2, 0.3],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Yantra ring — sacred geometric rotation */
const yantraRotate = {
  animate: {
    rotate: [0, 360],
    transition: {
      duration: 50,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

/** Counter-rotating inner ring */
const innerYantraRotate = {
  animate: {
    rotate: [360, 0],
    transition: {
      duration: 35,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

/** Kalasha shimmer — sacred golden pot glow */
const kalashaShimmer = {
  animate: {
    filter: [
      "drop-shadow(0 0 4px rgba(212, 168, 67, 0.5))",
      "drop-shadow(0 0 12px rgba(212, 168, 67, 0.9))",
      "drop-shadow(0 0 4px rgba(212, 168, 67, 0.5))",
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Sacred flame on temple top */
const templeFlame = {
  animate: {
    scaleY: [1, 1.15, 0.9, 1.1, 1],
    scaleX: [1, 0.92, 1.06, 0.95, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

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
        {/* Layer 1 — Divine aura with sacred geometry */}
        <motion.span
          className="absolute"
          style={{
            width: isActive ? 180 : 140,
            height: isActive ? 180 : 140,
          }}
          variants={auraBreathe}
          animate="animate"
        >
          <svg viewBox="0 0 140 140" fill="none" className="h-full w-full">
            {/* Radial divine glow */}
            <defs>
              <radialGradient id="temple-aura">
                <stop offset="0%" stopColor="#D4A843" stopOpacity="0.4" />
                <stop offset="40%" stopColor="#E8751A" stopOpacity="0.2" />
                <stop offset="70%" stopColor="#D4A843" stopOpacity="0.05" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="70" cy="70" r="68" fill="url(#temple-aura)" />
            {/* Sacred outer ring */}
            <circle cx="70" cy="70" r="65" stroke="#D4A843" strokeWidth="0.5" opacity="0.2" />
          </svg>
        </motion.span>

        {/* Layer 2 — Rotating yantra ring (outer) */}
        <motion.span
          className="absolute flex items-center justify-center"
          style={{
            width: isActive ? 120 : 95,
            height: isActive ? 120 : 95,
          }}
          variants={yantraRotate}
          animate="animate"
        >
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
            {/* Outer yantra ring with triangle points */}
            <circle cx="50" cy="50" r="46" stroke="#D4A843" strokeWidth="0.6" opacity="0.2" />
            {/* 12 sacred points (dvadashi) */}
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              const innerR = 38;
              const outerR = 46;
              return (
                <g key={i}>
                  <line
                    x1={50 + Math.cos(a) * innerR}
                    y1={50 + Math.sin(a) * innerR}
                    x2={50 + Math.cos(a) * outerR}
                    y2={50 + Math.sin(a) * outerR}
                    stroke="#D4A843"
                    strokeWidth="0.6"
                    opacity="0.25"
                  />
                  {/* Small diamond at each point */}
                  <circle
                    cx={50 + Math.cos(a) * outerR}
                    cy={50 + Math.sin(a) * outerR}
                    r={i % 3 === 0 ? 2 : 1}
                    fill="#D4A843"
                    opacity={i % 3 === 0 ? 0.3 : 0.15}
                  />
                </g>
              );
            })}
            {/* Inner sacred circle */}
            <circle cx="50" cy="50" r="28" stroke="#E8751A" strokeWidth="0.4" opacity="0.15" />
          </svg>
        </motion.span>

        {/* Layer 2b — Counter-rotating inner yantra */}
        <motion.span
          className="absolute flex items-center justify-center"
          style={{
            width: isActive ? 80 : 65,
            height: isActive ? 80 : 65,
          }}
          variants={innerYantraRotate}
          animate="animate"
        >
          <svg viewBox="0 0 60 60" fill="none" className="h-full w-full">
            {/* Interlocking triangles — Star of Vishnu */}
            <polygon
              points="30,8 50,46 10,46"
              stroke="#D4A843"
              strokeWidth="0.5"
              fill="none"
              opacity="0.15"
            />
            <polygon
              points="30,52 10,14 50,14"
              stroke="#E8751A"
              strokeWidth="0.5"
              fill="none"
              opacity="0.15"
            />
            {/* Center bindu */}
            <circle cx="30" cy="30" r="6" stroke="#D4A843" strokeWidth="0.4" opacity="0.2" />
          </svg>
        </motion.span>

        {/* Layer 3 — Temple Vimana (gopuram tower) icon */}
        <motion.span
          className="relative z-10 flex items-center justify-center"
          animate={{
            scale: isActive ? 1.15 : 1,
            transition: { type: "spring", damping: 14, stiffness: 180 },
          }}
        >
          <svg
            width="60"
            height="74"
            viewBox="0 0 60 74"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sacred flame at the very top */}
            <motion.g
              variants={templeFlame}
              animate="animate"
              style={{ transformOrigin: "30px 8px" }}
            >
              <path
                d="M30 0C30 0 27 4 27 7C27 9 28.3 10 30 10C31.7 10 33 9 33 7C33 4 30 0 30 0Z"
                fill="#E8751A"
                opacity="0.8"
              />
              <path
                d="M30 2C30 2 28.5 5 28.5 6.5C28.5 7.5 29.2 8 30 8C30.8 8 31.5 7.5 31.5 6.5C31.5 5 30 2 30 2Z"
                fill="#FFD700"
                opacity="0.7"
              />
            </motion.g>

            {/* Kalasha (golden sacred pot) — temple finial */}
            <motion.g variants={kalashaShimmer} animate="animate">
              {/* Kalasha pot */}
              <path
                d="M27.5 10 L27 13 Q28.5 15, 30 15 Q31.5 15, 33 13 L32.5 10 Z"
                fill="#D4A843"
                opacity="0.9"
              />
              {/* Kalasha neck ring */}
              <ellipse cx="30" cy="13" rx="3.5" ry="1" fill="#8B6914" opacity="0.6" />
              {/* Coconut/fruit on top */}
              <circle cx="30" cy="11" r="1.5" fill="#D4A843" opacity="0.7" />
            </motion.g>

            {/* Gopuram tower — stepped pyramid silhouette */}
            <g opacity="0.85">
              {/* Shikhara (spire) top section */}
              <path
                d="M26 15 L24 24 L36 24 L34 15 Z"
                fill="#8B6914"
                opacity="0.7"
              />
              {/* Horizontal bands on the tower */}
              <line x1="24.5" y1="18" x2="35.5" y2="18" stroke="#D4A843" strokeWidth="0.5" opacity="0.5" />
              <line x1="24.2" y1="21" x2="35.8" y2="21" stroke="#D4A843" strokeWidth="0.5" opacity="0.5" />

              {/* Middle section — wider */}
              <path
                d="M22 24 L20 36 L40 36 L38 24 Z"
                fill="#5c4022"
                opacity="0.8"
              />
              {/* Niches / windows */}
              <rect x="25" y="27" width="3" height="4" rx="1.5" fill="#D4A843" opacity="0.15" />
              <rect x="32" y="27" width="3" height="4" rx="1.5" fill="#D4A843" opacity="0.15" />
              <rect x="28.5" y="26" width="3" height="5" rx="1.5" fill="#D4A843" opacity="0.2" />
              {/* Band */}
              <line x1="21" y1="33" x2="39" y2="33" stroke="#D4A843" strokeWidth="0.5" opacity="0.4" />

              {/* Base section — widest */}
              <path
                d="M18 36 L16 50 L44 50 L42 36 Z"
                fill="#3d2b1a"
                opacity="0.9"
              />
              {/* Entrance arch — gopuram gateway */}
              <path
                d="M26 50 L26 42 Q30 38, 34 42 L34 50 Z"
                fill="#1a150e"
                opacity="0.6"
              />
              {/* Pillar details */}
              <line x1="20" y1="38" x2="20" y2="50" stroke="#D4A843" strokeWidth="0.5" opacity="0.3" />
              <line x1="40" y1="38" x2="40" y2="50" stroke="#D4A843" strokeWidth="0.5" opacity="0.3" />
              {/* Band */}
              <line x1="17" y1="43" x2="43" y2="43" stroke="#D4A843" strokeWidth="0.5" opacity="0.3" />
            </g>

            {/* Steps — temple platform base */}
            <rect x="14" y="50" width="32" height="2.5" rx="0.5" fill="#5c4022" opacity="0.6" />
            <rect x="12" y="52" width="36" height="2" rx="0.5" fill="#3d2b1a" opacity="0.5" />
            <rect x="10" y="53.5" width="40" height="1.5" rx="0.5" fill="#2a1f14" opacity="0.4" />

            {/* Krishna's flute — nestled at the base */}
            <g opacity="0.6">
              <rect
                x="16" y="48"
                width="28" height="3"
                rx="1.5"
                fill="#8B6914"
                transform="rotate(-8, 30, 49)"
              />
              {/* Flute holes */}
              {[0, 1, 2, 3, 4].map((i) => (
                <circle
                  key={i}
                  cx={20 + i * 5}
                  cy={48.5}
                  r="0.7"
                  fill="#5C4A0E"
                  opacity="0.5"
                  transform="rotate(-8, 30, 49)"
                />
              ))}
            </g>

            {/* Sacred glow inside entrance */}
            <ellipse cx="30" cy="46" rx="3" ry="4" fill="#D4A843" opacity="0.15" />
            <ellipse cx="30" cy="46" rx="1.5" ry="2" fill="#FFD700" opacity="0.1" />

            {/* Lotus base platform */}
            <ellipse cx="30" cy="56" rx="18" ry="4" fill="#D4A843" opacity="0.12" />
            <ellipse cx="30" cy="56" rx="12" ry="2.5" fill="#E8751A" opacity="0.08" />
          </svg>
        </motion.span>

        {/* Layer 4 — Label with ornamental styling */}
        <motion.span
          className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#FFF8E1]"
          style={{
            background: "linear-gradient(135deg, #8B6914dd, #D4A843dd)",
            boxShadow: "0 2px 16px rgba(212, 168, 67, 0.4)",
            borderLeft: "3px solid #D4A843",
            borderRight: "3px solid #D4A843",
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
