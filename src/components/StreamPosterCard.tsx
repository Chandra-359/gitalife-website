"use client";

import { motion } from "framer-motion";
import type { Program } from "@/data/programs";
import { getCategoryColor, getCategoryIcon } from "@/data/programs";

interface StreamPosterCardProps {
  program: Program;
  index: number;
  onClick: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDaysUntil(iso: string): number | null {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function StreamPosterCard({ program, index, onClick }: StreamPosterCardProps) {
  const { bg } = getCategoryColor(program.category);
  const icon = getCategoryIcon(program.category);
  const daysUntil = getDaysUntil(program.date);
  const isFull = program.capacity && program.rsvpCount != null
    ? program.capacity - program.rsvpCount <= 0
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative shrink-0 cursor-pointer overflow-hidden rounded-lg"
      style={{ width: 200, height: 300 }}
    >
      {/* Background image or gradient */}
      {program.imageUrl ? (
        <img
          src={program.imageUrl}
          alt={program.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${bg}40 0%, #0a0a1a 60%, ${bg}20 100%)`,
          }}
        >
          {/* Pattern overlay for cards without images */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, ${bg} 1px, transparent 1px), radial-gradient(circle at 70% 60%, ${bg} 1px, transparent 1px)`,
              backgroundSize: "40px 40px, 60px 60px",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-30">{icon}</span>
          </div>
        </div>
      )}

      {/* Dark gradient overlay — always present for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Hover glow border */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 2px ${bg}, 0 0 20px ${bg}40`,
        }}
      />

      {/* Top badges */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
        {/* Category pill */}
        <span
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90"
          style={{ backgroundColor: `${bg}cc` }}
        >
          <span className="text-[11px]">{icon}</span>
          {program.category.length > 15
            ? program.category.split(" ")[0]
            : program.category}
        </span>

        {/* Urgency / countdown */}
        {daysUntil !== null && daysUntil <= 7 && (
          <span
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
            style={{ backgroundColor: daysUntil <= 2 ? "#dc2626cc" : `${bg}cc` }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                style={{ backgroundColor: "#fff" }}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
          </span>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {/* Title */}
        <h3 className="text-[14px] font-bold text-white leading-tight line-clamp-2 mb-1">
          {program.title}
        </h3>

        {/* Date */}
        <p className="text-[11px] text-white/60 font-medium">
          {formatDate(program.date)}
          {program.duration && ` · ${program.duration}`}
        </p>

        {/* Capacity indicator */}
        {program.capacity && (
          <div className="mt-2">
            <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(((program.rsvpCount ?? 0) / program.capacity) * 100, 100)}%`,
                  background: isFull
                    ? "#dc2626"
                    : (program.rsvpCount ?? 0) / program.capacity > 0.8
                      ? `linear-gradient(90deg, ${bg}, #dc2626)`
                      : bg,
                }}
              />
            </div>
            <p className="text-[9px] text-white/40 mt-0.5 font-medium">
              {isFull
                ? "Full"
                : `${program.capacity - (program.rsvpCount ?? 0)} spots left`}
            </p>
          </div>
        )}
      </div>

      {/* Featured ribbon */}
      {program.featured && (
        <div
          className="absolute top-0 right-0 w-16 h-16 overflow-hidden"
        >
          <div
            className="absolute top-[6px] right-[-20px] w-[80px] text-center text-[8px] font-bold uppercase tracking-widest text-white py-0.5 rotate-45"
            style={{ background: `linear-gradient(90deg, #D4A843, #E8751A)` }}
          >
            Featured
          </div>
        </div>
      )}
    </motion.div>
  );
}
