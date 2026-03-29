"use client";

import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";

interface ProgramCardProps {
  program: Program;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ProgramCard({
  program,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: ProgramCardProps) {
  const { bg } = getCategoryColor(program.category);

  return (
    <div
      className={`rounded-xl border px-5 py-4 transition-all duration-200 cursor-pointer ${
        isHovered
          ? "bg-white/[0.08] border-white/20 shadow-lg shadow-white/[0.03]"
          : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Date & time */}
      <p className="text-[13px] font-semibold tracking-wide text-white/90">
        {formatDate(program.date)} &middot; {formatTime(program.date)}
      </p>

      {/* Title */}
      <h3 className="mt-1.5 text-[15px] font-medium leading-snug text-white">
        {program.title}
      </h3>

      {/* Category tag */}
      <span
        className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide"
        style={{ backgroundColor: `${bg}20`, color: bg }}
      >
        {program.category}
      </span>

      {/* Description */}
      <p className="mt-2 text-[13px] leading-relaxed text-white/50 line-clamp-2">
        {program.description}
      </p>
    </div>
  );
}
