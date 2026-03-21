"use client";

/**
 * ProgramMarker — Vedic Agni Kunda (sacred fire altar) marker
 *
 * Design: Each program is a sacred fire altar (agni kunda) with divine
 * flames rising from a stepped altar base. The fire is the eternal
 * yajna flame that represents the offering of knowledge.
 *
 * Layers (bottom to top):
 *  1. Sacred mandala halo — geometric radial pattern that breathes
 *  2. Expanding tilak ring — vermillion expanding pulse
 *  3. Agni kunda SVG — stepped altar with rising sacred fire
 *  4. Label — program title with ornamental bracket styling
 */

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Marker } from "react-map-gl/mapbox";
import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";

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

/** Sacred fire flicker — more dramatic yajna-style dancing */
const sacredFlameFlicker = {
  animate: {
    scaleY: [1, 1.12, 0.9, 1.08, 0.93, 1.05, 1],
    scaleX: [1, 0.94, 1.05, 0.96, 1.04, 0.97, 1],
    rotate: [0, -2, 1.5, -1, 2, -0.8, 0],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Inner sacred flame — offering fire (ahuti) */
const innerFireShimmer = {
  animate: {
    scaleY: [1, 1.15, 0.88, 1.1, 0.93, 1],
    scaleX: [1, 0.9, 1.08, 0.93, 1.04, 1],
    opacity: [0.75, 0.9, 0.6, 0.85, 0.7, 0.75],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Core — divine bindu (center point of yajna) */
const coreGlow = {
  animate: {
    scale: [1, 1.2, 0.85, 1.15, 1],
    opacity: [0.85, 1, 0.65, 0.95, 0.85],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Mandala halo — sacred geometry breathing pattern */
const mandalaBreathe = {
  animate: {
    scale: [1, 1.15, 1, 1.1, 1],
    opacity: [0.4, 0.2, 0.35, 0.25, 0.4],
    rotate: [0, 15, 0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Tilak pulse ring — vermillion expanding wave */
const tilakPulse = {
  animate: {
    scale: [0.8, 2.2],
    opacity: [0.5, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

/** Label reveal with ornamental feel */
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
        whileHover={{ scale: 1.12, transition: { type: "spring", damping: 10 } }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Layer 1 — Sacred mandala halo */}
        <motion.span
          className="absolute"
          style={{
            width: isSelected ? 100 : 72,
            height: isSelected ? 100 : 72,
          }}
          variants={mandalaBreathe}
          animate="animate"
        >
          <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
            {/* Outer sacred circle */}
            <circle cx="36" cy="36" r="34" stroke={bg} strokeWidth="0.5" opacity="0.3" />
            {/* Inner geometric pattern — 8 spokes */}
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={36 + Math.cos(a) * 12}
                  y1={36 + Math.sin(a) * 12}
                  x2={36 + Math.cos(a) * 32}
                  y2={36 + Math.sin(a) * 32}
                  stroke={bg}
                  strokeWidth="0.3"
                  opacity="0.2"
                />
              );
            })}
            {/* Small triangle petals — yantra-inspired */}
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              const nextA = ((i + 1) * 45 * Math.PI) / 180;
              const r = 28;
              return (
                <polygon
                  key={`tri-${i}`}
                  points={`36,36 ${36 + Math.cos(a) * r},${36 + Math.sin(a) * r} ${36 + Math.cos(nextA) * r},${36 + Math.sin(nextA) * r}`}
                  fill={bg}
                  opacity="0.04"
                />
              );
            })}
            <circle cx="36" cy="36" r="14" stroke={bg} strokeWidth="0.4" opacity="0.2" />
          </svg>
        </motion.span>

        {/* Layer 2 — Tilak pulse ring (vermillion sacred mark) */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: isSelected ? 56 : 42,
            height: isSelected ? 56 : 42,
            background: glow,
          }}
          variants={tilakPulse}
          animate="animate"
        />

        {/* Layer 3 — Agni Kunda SVG with sacred fire */}
        <motion.span
          className="relative z-10 flex items-center justify-center"
          style={{
            transformOrigin: "center bottom",
            filter: `drop-shadow(0 0 12px ${glow}) drop-shadow(0 0 24px ${glow})`,
          }}
          animate={{
            scale: isSelected ? 1.35 : 1,
            transition: { type: "spring", damping: 14, stiffness: 180 },
          }}
        >
          <motion.svg
            width="38"
            height="52"
            viewBox="0 0 38 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            variants={sacredFlameFlicker}
            animate="animate"
            style={{ transformOrigin: "center bottom" }}
          >
            {/* Outer sacred flame — main yajna fire */}
            <motion.path
              d="M19 1C19 1 4 19 4 29C4 36 10 42 19 42C28 42 34 36 34 29C34 19 19 1 19 1Z"
              fill={bg}
              style={{ filter: `drop-shadow(0 0 8px ${bg})` }}
            />

            {/* Inner offering flame — ahuti */}
            <motion.path
              d="M19 9C19 9 10 22 10 29C10 33.5 13.5 37 19 37C24.5 37 28 33.5 28 29C28 22 19 9 19 9Z"
              fill="#FFD700"
              variants={innerFireShimmer}
              animate="animate"
              style={{ transformOrigin: "center bottom" }}
            />

            {/* Sacred sparks — small flame tongues */}
            <motion.path
              d="M13 18C13 18 11 22 12 24C12.5 25 13.5 24 13 22C12.5 20 13 18 13 18Z"
              fill="#FFD700"
              opacity="0.5"
              animate={{
                opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
                y: [0, -2, 0, -1, 0],
                transition: { duration: 2, repeat: Infinity },
              }}
            />
            <motion.path
              d="M25 16C25 16 27 20 26 22C25.5 23 24.5 22 25 20C25.5 18 25 16 25 16Z"
              fill="#FFD700"
              opacity="0.4"
              animate={{
                opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
                y: [0, -1.5, 0, -2, 0],
                transition: { duration: 2.3, repeat: Infinity, delay: 0.5 },
              }}
            />

            {/* Divine bindu core — white-hot center of yajna */}
            <motion.ellipse
              cx="19"
              cy="31"
              rx="4"
              ry="5"
              fill="#FFF8E1"
              variants={coreGlow}
              animate="animate"
            />

            {/* Kunda base — stepped altar */}
            <rect x="7" y="42" width="24" height="3" rx="0.5" fill={bg} opacity="0.6" />
            <rect x="9" y="44.5" width="20" height="2.5" rx="0.5" fill={bg} opacity="0.4" />
            <rect x="11" y="46.5" width="16" height="2" rx="0.5" fill={bg} opacity="0.25" />

            {/* Altar decorative marks — tiny tilaks */}
            <circle cx="13" cy="43.5" r="0.8" fill="#FFD700" opacity="0.3" />
            <circle cx="19" cy="43.5" r="0.8" fill="#FFD700" opacity="0.3" />
            <circle cx="25" cy="43.5" r="0.8" fill="#FFD700" opacity="0.3" />
          </motion.svg>
        </motion.span>

        {/* Layer 4 — Program title label (ornamental style) */}
        <AnimatePresence>
          {isSelected && (
            <motion.span
              className="pointer-events-none absolute -bottom-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-3 py-1 text-[11px] font-semibold tracking-wider"
              style={{
                background: `linear-gradient(135deg, ${bg}dd, ${bg}aa)`,
                color: "#FFF8E1",
                boxShadow: `0 2px 16px ${glow}`,
                borderLeft: `2px solid #D4A843`,
                borderRight: `2px solid #D4A843`,
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

        {/* Hover label */}
        {!isSelected && (
          <span
            className="pointer-events-none absolute -bottom-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-3 py-1 text-[11px] font-semibold tracking-wider opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1"
            style={{
              background: `linear-gradient(135deg, ${bg}dd, ${bg}aa)`,
              color: "#FFF8E1",
              boxShadow: `0 2px 12px ${glow}`,
              borderLeft: `2px solid #D4A843`,
              borderRight: `2px solid #D4A843`,
            }}
          >
            {program.title}
          </span>
        )}
      </motion.button>
    </Marker>
  );
}
