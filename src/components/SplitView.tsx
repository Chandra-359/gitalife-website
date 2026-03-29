"use client";

import { useState } from "react";
import type { Program } from "@/data/programs";
import MapScene from "@/components/MapScene";
import ProgramCard from "@/components/ProgramCard";

interface SplitViewProps {
  programs: Program[];
}

export default function SplitView({ programs }: SplitViewProps) {
  const [hoveredProgramId, setHoveredProgramId] = useState<string | null>(null);
  const [isMobileMapView, setIsMobileMapView] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      {/* Left panel — scrollable program list */}
      {/* Mobile: hidden when map is active. Desktop: always visible. */}
      <div
        className={`w-full md:w-1/2 h-full overflow-y-auto bg-[#0a0a1a] ${
          isMobileMapView ? "hidden md:block" : ""
        }`}
      >
        <div className="px-5 py-6 pb-24 md:pb-6">
          <h2 className="text-lg font-semibold text-white mb-1">
            Upcoming Programs
          </h2>
          <p className="text-[13px] text-white/40 mb-5">
            {programs.length} events near you
          </p>
          <div className="space-y-3">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                isHovered={hoveredProgramId === program.id}
                onMouseEnter={() => setHoveredProgramId(program.id)}
                onMouseLeave={() => setHoveredProgramId(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — map */}
      {/* Mobile: hidden when list is active. Desktop: always visible. */}
      <div
        className={`w-full md:w-1/2 h-full relative overflow-hidden ${
          isMobileMapView ? "" : "hidden md:block"
        }`}
      >
        <MapScene programs={programs} hoveredProgramId={hoveredProgramId} />
      </div>

      {/* Mobile FAB — toggles between list and map view */}
      <button
        onClick={() => setIsMobileMapView((v) => !v)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center gap-2 rounded-full bg-[#1a1a2e] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-black/40 border border-white/10 active:scale-95 transition-transform"
      >
        {isMobileMapView ? (
          <>
            {/* List icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Show List
          </>
        ) : (
          <>
            {/* Map icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Show Map
          </>
        )}
      </button>
    </div>
  );
}
