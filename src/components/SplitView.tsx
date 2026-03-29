"use client";

import { useState } from "react";
import type { Program } from "@/data/programs";
import MapScene from "@/components/MapScene";

interface SplitViewProps {
  programs: Program[];
}

export default function SplitView({ programs }: SplitViewProps) {
  const [hoveredProgramId, setHoveredProgramId] = useState<string | null>(null);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      {/* Left panel — scrollable list (placeholder for now) */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto bg-[#0a0a1a] text-white">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Programs</h2>
          <div className="space-y-4">
            {programs.map((program) => (
              <div
                key={program.id}
                className={`rounded-lg border border-white/10 p-4 transition-colors cursor-pointer ${
                  hoveredProgramId === program.id
                    ? "bg-white/10 border-white/20"
                    : "bg-white/5 hover:bg-white/10"
                }`}
                onMouseEnter={() => setHoveredProgramId(program.id)}
                onMouseLeave={() => setHoveredProgramId(null)}
              >
                <p className="text-sm text-white/50">{program.category}</p>
                <h3 className="font-medium">{program.title}</h3>
                <p className="text-sm text-white/70 mt-1">{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — map */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
        <MapScene programs={programs} />
      </div>
    </div>
  );
}
