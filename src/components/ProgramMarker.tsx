"use client";

/**
 * ProgramMarker — Airbnb-style pill marker on the map
 *
 * A clean rounded pill showing the program title. Highlights on hover
 * (from the list) or when selected (clicked on map).
 */

import { useCallback } from "react";
import { Marker } from "react-map-gl/mapbox";
import type { Program } from "@/data/programs";

interface ProgramMarkerProps {
  program: Program;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (program: Program) => void;
}

export default function ProgramMarker({
  program,
  isSelected,
  isHovered = false,
  onSelect,
}: ProgramMarkerProps) {
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
      <button
        onClick={handleClick}
        aria-label={`View details for ${program.title}`}
        className={`rounded-full px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer border ${
          highlighted
            ? "bg-gray-900 text-white border-gray-900 shadow-lg scale-110 z-10"
            : "bg-white text-gray-900 border-gray-200 shadow-md hover:shadow-lg hover:scale-105"
        }`}
        style={{ lineHeight: 1 }}
      >
        {program.title}
      </button>
    </Marker>
  );
}
