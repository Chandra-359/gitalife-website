"use client";

/**
 * LumaEventCard — grid card for an upcoming program.
 *
 * Layout:
 *  - 4:3 cover image on top with floating date pill (top-right) and
 *    a subtle relative-time badge (top-left)
 *  - Tag pills (max 2)
 *  - Serif title (clamped to 2 lines)
 *  - Time + venue line
 *  - "Reserve" arrow link (entire card is clickable)
 */

import Image from "next/image";
import { motion } from "framer-motion";
import type { LumaEvent } from "@/lib/luma";
import { C, Icon } from "@/components/home/icons";
import {
  formatRelativeDay,
  formatTime,
  getDatePill,
  getTagAccent,
} from "./dateUtils";

const ACCENT_HEX: Record<ReturnType<typeof getTagAccent>, string> = {
  saffron: C.saffron,
  gold: C.gold,
  peacock: C.peacock,
  lotus: C.lotusPink,
  krishna: C.krishnaBlue,
};

interface LumaEventCardProps {
  event: LumaEvent;
  index?: number;
}

export default function LumaEventCard({ event, index = 0 }: LumaEventCardProps) {
  const pill = getDatePill(event.startAt);
  const relative = formatRelativeDay(event.startAt);
  const time = formatTime(event.startAt);
  const venue = event.location?.venue ?? event.location?.city;
  const primaryAccent = ACCENT_HEX[getTagAccent(event.tags[0] ?? "")];

  return (
    <motion.a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4) }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: "white",
        border: `1px solid ${C.gold}22`,
        boxShadow: "0 1px 2px rgba(15,27,77,0.04), 0 12px 32px -16px rgba(15,27,77,0.10)",
        transition:
          "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease",
      }}
    >
      {/* ---- Cover image ---- */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {event.coverUrl ? (
          <Image
            src={event.coverUrl}
            alt={event.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${primaryAccent}, ${primaryAccent}88)`,
            }}
          >
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-serif text-5xl font-bold text-white/60">
                {event.name.slice(0, 1)}
              </span>
            </div>
          </div>
        )}

        {/* gradient mask for legibility */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,27,77,0.10) 0%, transparent 30%, transparent 70%, rgba(15,27,77,0.18) 100%)",
          }}
        />

        {/* Relative-time badge — top-left */}
        <div className="absolute top-3 left-3">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md"
            style={{
              background: "rgba(255,255,255,0.9)",
              color: C.saffron,
              border: `1px solid ${C.gold}33`,
            }}
          >
            {relative}
          </span>
        </div>

        {/* Date pill — top-right */}
        <div
          className="absolute top-3 right-3 rounded-xl px-2.5 py-1.5 text-center backdrop-blur-md"
          style={{
            background: "rgba(255,251,242,0.95)",
            border: `1px solid ${C.gold}33`,
            boxShadow: "0 4px 12px -4px rgba(15,27,77,0.18)",
          }}
        >
          <p
            className="text-[8.5px] font-bold uppercase tracking-[0.2em] leading-none"
            style={{ color: C.saffron }}
          >
            {pill.monthShort}
          </p>
          <p
            className="font-serif text-lg font-bold leading-none mt-0.5 tabular-nums"
            style={{ color: C.krishnaBlue }}
          >
            {pill.day}
          </p>
        </div>
      </div>

      {/* ---- Body ---- */}
      <div className="flex flex-col flex-1 p-5">
        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {event.tags.slice(0, 2).map((tag) => {
              const accent = ACCENT_HEX[getTagAccent(tag)];
              return (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    background: `${accent}14`,
                    color: accent,
                    border: `1px solid ${accent}26`,
                  }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Title */}
        <h3
          className="font-serif text-[18px] sm:text-[19px] font-bold leading-snug line-clamp-2 transition-colors"
          style={{ color: C.krishnaBlue }}
        >
          {event.name}
        </h3>

        {/* Time + venue */}
        <div className="mt-3 space-y-1.5 text-[13px]" style={{ color: "#6b7280" }}>
          <p className="inline-flex items-center gap-1.5">
            <Icon name="calendar" size={12} style={{ color: C.gold }} />
            <span>{time}</span>
          </p>
          {venue && (
            <p className="inline-flex items-center gap-1.5 line-clamp-1">
              <Icon name="mapPin" size={12} style={{ color: C.gold }} />
              <span className="truncate">{venue}</span>
            </p>
          )}
        </div>

        {/* CTA — pinned bottom */}
        <div
          className="mt-auto pt-4 flex items-center justify-between border-t"
          style={{ borderColor: `${C.gold}1f` }}
        >
          <span
            className="text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "#9ca3af" }}
          >
            via Luma
          </span>
          <span
            className="inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.14em] transition-transform group-hover:translate-x-0.5"
            style={{ color: C.saffron }}
          >
            Reserve
            <Icon name="arrowRight" size={11} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}
