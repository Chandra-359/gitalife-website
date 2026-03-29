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

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      {/* Left panel — scrollable program list */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto bg-[#0a0a1a]">
        <div className="px-5 py-6">
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
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
        <MapScene programs={programs} hoveredProgramId={hoveredProgramId} />
      </div>
    </div>
  );
}
