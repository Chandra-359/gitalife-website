"use client";

import { motion } from "framer-motion";
import type { Program } from "@/data/programs";
import { getCategoryColor, getCategoryIcon } from "@/data/programs";

interface ProgramCardProps {
  program: Program;
  index: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void;
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
  index,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: ProgramCardProps) {
  const { bg, glow } = getCategoryColor(program.category);
  const icon = getCategoryIcon(program.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className={`rounded-xl border px-5 py-4 transition-all duration-200 cursor-pointer ${
        isHovered
          ? "shadow-md -translate-y-0.5"
          : "hover:shadow-sm hover:-translate-y-px"
      }`}
      style={{
        borderLeft: `4px solid ${bg}`,
        borderColor: isHovered ? bg : undefined,
        borderLeftColor: bg,
        backgroundColor: isHovered ? `${bg}08` : "rgba(255,255,255,0.8)",
        boxShadow: isHovered ? `0 4px 16px ${glow}` : undefined,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Date & time */}
      <p className="text-[13px] font-semibold tracking-wide text-gray-900">
        {formatDate(program.date)} &middot; {formatTime(program.date)}
      </p>

      {/* Title */}
      <h3 className="mt-1.5 text-[15px] font-medium leading-snug text-gray-800">
        {program.title}
      </h3>

      {/* Category tag with icon */}
      <span
        className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide"
        style={{ backgroundColor: `${bg}18`, color: bg }}
      >
        <span className="text-[12px]">{icon}</span>
        {program.category}
      </span>

      {/* Description */}
      <p className="mt-2 text-[13px] leading-relaxed text-gray-500 line-clamp-2">
        {program.description}
      </p>
    </motion.div>
  );
}
