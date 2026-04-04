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

/** Returns days until the event, or null if in the past */
function getDaysUntil(iso: string): number | null {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
  const daysUntil = getDaysUntil(program.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl border border-white/60 cursor-pointer overflow-hidden"
      style={{
        backgroundColor: isHovered ? `${bg}0a` : "rgba(255,255,255,0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: isHovered ? `${bg}40` : "rgba(255,255,255,0.6)",
        boxShadow: isHovered
          ? `0 8px 32px ${glow}, 0 0 0 1px ${bg}20`
          : "0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.5)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Shimmer sweep on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${bg}10 50%, transparent 60%)`,
        }}
      />

      {/* Left accent bar with gradient */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300"
        style={{
          background: `linear-gradient(to bottom, ${bg}, ${bg}88)`,
          width: isHovered ? "4px" : "3px",
        }}
      />

      <div className="relative px-5 py-4 pl-6">
        {/* Top row: Date + Urgency badge */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold tracking-wide text-gray-900 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gray-400 shrink-0">
              <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 7h12" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {formatDate(program.date)} · {formatTime(program.date)}
          </p>

          {/* Urgency / countdown badge */}
          {daysUntil !== null && daysUntil <= 7 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 300, delay: index * 0.08 + 0.3 }}
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: daysUntil <= 2 ? "#fee2e2" : `${bg}15`,
                color: daysUntil <= 2 ? "#dc2626" : bg,
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                  style={{ backgroundColor: daysUntil <= 2 ? "#dc2626" : bg }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: daysUntil <= 2 ? "#dc2626" : bg }}
                />
              </span>
              {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow!" : `${daysUntil}d left`}
            </motion.span>
          )}
        </div>

        {/* Title with hover color transition */}
        <h3
          className="mt-2 text-[16px] font-semibold leading-snug transition-colors duration-200"
          style={{ color: isHovered ? bg : "#1f2937" }}
        >
          {program.title}
        </h3>

        {/* Category tag + location */}
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
            style={{ backgroundColor: `${bg}15`, color: bg }}
          >
            <span className="text-[13px]">{icon}</span>
            {program.category}
          </motion.span>

          {program.address && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 truncate max-w-[180px]">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M8 1C5.24 1 3 3.13 3 5.75 3 9.5 8 15 8 15s5-5.5 5-9.25C13 3.13 10.76 1 8 1Z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {program.address.split(",")[0]}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-2.5 text-[13px] leading-relaxed text-gray-500 line-clamp-2">
          {program.description}
        </p>

        {/* Bottom row: View details CTA */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {program.duration && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                {program.duration}
              </span>
            )}
          </div>

          <motion.span
            className="inline-flex items-center gap-1 text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
            style={{ color: bg }}
          >
            View Details
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
