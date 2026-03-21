"use client";

/**
 * ProgramMarker — Diya (oil lamp) marker for each program location
 *
 * Design concept: "Lamp Glow" — Each program is a diya (traditional oil lamp)
 * that flickers on the dark city map. The flame is animated SVG with a warm
 * radial glow halo. Visually represents "spreading the light of Bhagavad Gita."
 *
 * CUSTOMIZATION GUIDE:
 * ├── Flame size ............... adjust FLAME_SIZE / SELECTED_FLAME_SIZE
 * ├── Glow halo ................ adjust the outer .diya-halo dimensions
 * ├── Flicker speed ............ edit diya-flicker in globals.css
 * └── Colors per category ...... edit CATEGORY_COLORS in src/data/programs.ts
 */

import { useCallback } from "react";
import { Marker } from "react-map-gl/mapbox";
import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";

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

  const flameScale = isSelected ? 1.4 : 1;

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
        {/* Layer 1 — Wide ambient light halo (matches Mapbox glow layer) */}
        <span
          className="diya-halo absolute rounded-full"
          style={{
            width: isSelected ? 80 : 60,
            height: isSelected ? 80 : 60,
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
            opacity: isSelected ? 0.7 : 0.5,
            transition: "all 0.4s ease",
          }}
        />

        {/* Layer 2 — Pulsing light ring */}
        <span
          className="diya-pulse absolute rounded-full"
          style={{
            width: isSelected ? 50 : 38,
            height: isSelected ? 50 : 38,
            background: glow,
          }}
        />

        {/* Layer 3 — Diya flame SVG */}
        <span
          className="diya-flicker relative z-10 flex items-center justify-center"
          style={{
            transform: `scale(${flameScale})`,
            transition: "transform 0.4s ease",
            filter: `drop-shadow(0 0 8px ${glow}) drop-shadow(0 0 16px ${glow})`,
          }}
        >
          <svg
            width="32"
            height="40"
            viewBox="0 0 32 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Flame body — teardrop shape */}
            <path
              d="M16 2C16 2 6 16 6 24C6 30 10.5 34 16 34C21.5 34 26 30 26 24C26 16 16 2 16 2Z"
              fill={bg}
              opacity="0.9"
            />
            {/* Inner flame — brighter center */}
            <path
              d="M16 10C16 10 11 19 11 24C11 27.5 13 30 16 30C19 30 21 27.5 21 24C21 19 16 10 16 10Z"
              fill="#FFD700"
              opacity="0.7"
            />
            {/* Core — white-hot center */}
            <ellipse
              cx="16"
              cy="26"
              rx="3"
              ry="4"
              fill="#FFF8E1"
              opacity="0.8"
            />
            {/* Diya base (small lamp bowl) */}
            <ellipse
              cx="16"
              cy="35"
              rx="7"
              ry="2.5"
              fill={bg}
              opacity="0.6"
            />
            <ellipse
              cx="16"
              cy="35"
              rx="5"
              ry="1.5"
              fill="#FFD700"
              opacity="0.3"
            />
          </svg>
        </span>

        {/* Hover / selected label — program title */}
        <span
          className={`pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-lg transition-all duration-300 ${
            isSelected
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
          style={{
            background: `${bg}dd`,
            color: "#fff",
            boxShadow: `0 2px 12px ${glow}`,
          }}
        >
          {program.title}
        </span>
      </button>
    </Marker>
  );
}
