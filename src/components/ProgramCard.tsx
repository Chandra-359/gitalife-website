"use client";

import { useState } from "react";
import type { Program } from "@/data/programs";
import { getCategoryColor, getCategoryIcon, VOLUNTEER_COLOR } from "@/data/programs";
import RsvpModal from "@/components/RsvpModal";

interface ProgramCardProps {
  program: Program;
  index: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void;
}

export default function ProgramCard({
  program,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: ProgramCardProps) {
  const { bg } = getCategoryColor(program.category);
  const icon = getCategoryIcon(program.category);
  const isVolunteer = program.type === "volunteer";
  const accentColor = isVolunteer ? VOLUNTEER_COLOR.bg : bg;

  const [showRsvp, setShowRsvp] = useState(false);

  // Capacity calculations
  const rsvpCount = program.rsvpCount ?? 0;
  const capacity = program.capacity;
  const spotsLeft = capacity ? capacity - rsvpCount : null;
  const fillPercent = capacity ? Math.min((rsvpCount / capacity) * 100, 100) : 0;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <>
      <div
        className="group relative rounded-xl cursor-pointer overflow-hidden transition-colors"
        style={{
          backgroundColor: "white",
          border: `1px solid ${isHovered ? `${accentColor}40` : "rgba(15,27,77,0.08)"}`,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: accentColor }}
        />

        <div className="relative px-5 py-4 pl-6">
          {/* Top row: Badges — Featured + Type */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              {program.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                    <path d="M8 1l2.24 4.54 5.01.73-3.63 3.53.86 4.99L8 12.27l-4.48 2.52.86-4.99L.75 6.27l5.01-.73L8 1z" />
                  </svg>
                  Featured
                </span>
              )}
              {isVolunteer && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="shrink-0">
                    <path d="M8 14s-5.5-3.5-5.5-7.5C2.5 4 4 2.5 5.5 2.5c1 0 1.8.5 2.5 1.3.7-.8 1.5-1.3 2.5-1.3C12 2.5 13.5 4 13.5 6.5 13.5 10.5 8 14 8 14z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Volunteer
                </span>
              )}
            </div>
          </div>

          {/* SCHEDULE LINE — Day & Time */}
          <p className="text-[13px] font-semibold tracking-wide text-gray-900 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gray-400 shrink-0">
              <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 7h12" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Every {program.dayOfWeek}{program.time ? ` · ${program.time}` : ""}
          </p>

          {/* Title */}
          <h3
            className="mt-1.5 text-[16px] font-semibold leading-snug transition-colors duration-200"
            style={{ color: isHovered ? accentColor : "#1f2937" }}
          >
            {program.title}
          </h3>

          {/* Venue name (friendly) */}
          {(program.venueName || program.address) && (
            <span className="mt-1 inline-flex items-center gap-1 text-[12px] text-gray-400 truncate max-w-full">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M8 1C5.24 1 3 3.13 3 5.75 3 9.5 8 15 8 15s5-5.5 5-9.25C13 3.13 10.76 1 8 1Z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {program.venueName || (program.address ? program.address.split(",")[0] : "")}
            </span>
          )}

          {/* Category tag + duration pills */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
              style={{ backgroundColor: `${bg}15`, color: bg }}
            >
              <span className="text-[13px]">{icon}</span>
              {program.category}
            </span>

            {program.duration && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] text-gray-500 font-medium">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                {program.duration}
              </span>
            )}
          </div>

          {/* Bottom row: Capacity bar + RSVP CTA */}
          <div className="mt-3 flex items-center justify-between gap-3">
            {/* Capacity info */}
            <div className="flex-1 min-w-0">
              {capacity ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: isFull ? "#dc2626" : spotsLeft !== null && spotsLeft <= 10 ? accentColor : "#6b7280" }}
                    >
                      {isFull
                        ? "Event full"
                        : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {rsvpCount}/{capacity}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${fillPercent}%`,
                        background: isFull
                          ? "#dc2626"
                          : accentColor,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <span className="text-[11px] text-gray-400">
                  {rsvpCount > 0 ? `${rsvpCount} attending` : "Open to all"}
                </span>
              )}
            </div>

            {/* Inline RSVP button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isFull) setShowRsvp(true);
              }}
              disabled={isFull}
              className="shrink-0 rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: isFull ? "#9ca3af" : accentColor }}
            >
              {isFull ? "Full" : "RSVP"}
            </button>
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      {showRsvp && (
        <RsvpModal
          program={program}
          onClose={() => setShowRsvp(false)}
        />
      )}
    </>
  );
}
