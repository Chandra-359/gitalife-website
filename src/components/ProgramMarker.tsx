"use client";

import { useCallback } from "react";
import { Marker } from "react-map-gl/mapbox";
import type { Program } from "@/data/programs";
import { CATEGORY_COLORS } from "@/data/programs";

/* ------------------------------------------------------------------ */
/*  Category → icon glyph (simple Unicode — swap for SVGs later)      */
/* ------------------------------------------------------------------ */
const CATEGORY_ICON: Record<Program["category"], string> = {
  "Kirtan & Prasadam": "♫",
  Retreat: "☀",
  "Wisdom Session": "☸",
  "Youth Festival": "✦",
};

interface ProgramMarkerProps {
  program: Program;
  isSelected: boolean;
  onSelect: (program: Program) => void;
}

export default function ProgramMarker({ program, isSelected, onSelect }: ProgramMarkerProps) {
  const { bg, glow } = CATEGORY_COLORS[program.category];

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
      <button
        onClick={handleClick}
        aria-label={`View details for ${program.title}`}
        className="group relative flex items-center justify-center focus:outline-none"
        style={{ cursor: "pointer" }}
      >
        {/* Outer pulse ring */}
        <span
          className="marker-pulse absolute rounded-full"
          style={{
            width: isSelected ? 56 : 44,
            height: isSelected ? 56 : 44,
            background: glow,
          }}
        />

        {/* Secondary glow ring — always visible, breathes */}
        <span
          className="marker-breathe absolute rounded-full"
          style={{
            width: isSelected ? 40 : 32,
            height: isSelected ? 40 : 32,
            background: glow,
          }}
        />

        {/* Core dot */}
        <span
          className="relative z-10 flex items-center justify-center rounded-full shadow-lg transition-transform duration-300"
          style={{
            width: isSelected ? 34 : 26,
            height: isSelected ? 34 : 26,
            background: bg,
            boxShadow: `0 0 14px 4px ${glow}`,
            transform: isSelected ? "scale(1)" : undefined,
          }}
        >
          <span
            className="select-none text-white transition-all duration-300"
            style={{ fontSize: isSelected ? 15 : 11 }}
          >
            {CATEGORY_ICON[program.category]}
          </span>
        </span>

        {/* Label — appears on hover and when selected */}
        <span
          className={`pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide shadow-md transition-all duration-300 ${
            isSelected
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
          style={{
            background: bg,
            color: "#fff",
          }}
        >
          {program.title}
        </span>
      </button>
    </Marker>
  );
}
