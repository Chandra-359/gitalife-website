"use client";

/**
 * LumaEventCard — compact event row.
 *
 * Mobile (< sm): horizontal row — small square image on the left,
 * title + meta on the right. Tight, list-friendly.
 *
 * sm and up: vertical card — 4:3 cover image on top, content below.
 */

import Image from "next/image";
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
  /**
   * When true, render the vertical (cover-on-top) layout at every
   * breakpoint instead of swapping to a compact horizontal row on
   * mobile. Useful inside a horizontal snap rail.
   */
  alwaysVertical?: boolean;
}

export default function LumaEventCard({ event, alwaysVertical = false }: LumaEventCardProps) {
  const pill = getDatePill(event.startAt);
  const relative = formatRelativeDay(event.startAt);
  const time = formatTime(event.startAt);
  const venue = event.location?.venue ?? event.location?.city;
  const primaryAccent = ACCENT_HEX[getTagAccent(event.tags[0] ?? "")];
  const primaryTag = event.tags[0];

  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl bg-white transition-colors hover:bg-gray-50"
      style={{ border: "1px solid rgba(15,27,77,0.08)" }}
    >
      {/* Mobile: horizontal row (suppressed when alwaysVertical is set) */}
      <div className={`${alwaysVertical ? "hidden" : "flex"} items-stretch gap-3 p-3 sm:hidden`}>
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
          {event.coverUrl ? (
            <Image
              src={event.coverUrl}
              alt={event.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white/70"
              style={{
                background: `linear-gradient(135deg, ${primaryAccent}, ${primaryAccent}99)`,
              }}
            >
              {event.name.slice(0, 1)}
            </div>
          )}
          {/* Date badge */}
          <div
            className="absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-center"
            style={{ background: "rgba(255,251,242,0.95)" }}
          >
            <p
              className="text-[8px] font-bold uppercase leading-none tracking-wider"
              style={{ color: C.saffron }}
            >
              {pill.monthShort}
            </p>
            <p
              className="text-[13px] font-bold leading-none mt-0.5 tabular-nums"
              style={{ color: C.krishnaBlue }}
            >
              {pill.day}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: C.saffron }}
          >
            {relative} · {time}
          </p>
          <h3
            className="mt-1 text-[15px] font-semibold leading-snug line-clamp-2"
            style={{ color: C.krishnaBlue }}
          >
            {event.name}
          </h3>
          {venue && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500 line-clamp-1">
              <Icon name="mapPin" size={11} style={{ color: C.gold }} />
              <span className="truncate">{venue}</span>
            </p>
          )}
          {primaryTag && (
            <span
              className="mt-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{
                background: `${primaryAccent}14`,
                color: primaryAccent,
              }}
            >
              {primaryTag}
            </span>
          )}
        </div>
      </div>

      {/* sm+ (or always when alwaysVertical): vertical card */}
      <div className={`${alwaysVertical ? "flex flex-col" : "hidden"} sm:flex sm:flex-col`}>
        {/* Cover */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {event.coverUrl ? (
            <Image
              src={event.coverUrl}
              alt={event.name}
              fill
              sizes="(max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-white/60"
              style={{
                background: `linear-gradient(135deg, ${primaryAccent}, ${primaryAccent}88)`,
              }}
            >
              {event.name.slice(0, 1)}
            </div>
          )}

          {/* Date pill */}
          <div
            className="absolute top-3 right-3 rounded-md px-2 py-1 text-center"
            style={{ background: "rgba(255,251,242,0.95)" }}
          >
            <p
              className="text-[9px] font-bold uppercase leading-none tracking-wider"
              style={{ color: C.saffron }}
            >
              {pill.monthShort}
            </p>
            <p
              className="text-base font-bold leading-none mt-0.5 tabular-nums"
              style={{ color: C.krishnaBlue }}
            >
              {pill.day}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5">
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {event.tags.slice(0, 2).map((tag) => {
                const accent = ACCENT_HEX[getTagAccent(tag)];
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{
                      background: `${accent}14`,
                      color: accent,
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}

          <h3
            className="text-base font-semibold leading-snug line-clamp-2"
            style={{ color: C.krishnaBlue }}
          >
            {event.name}
          </h3>

          <div className="mt-2 space-y-1 text-[13px] text-gray-500">
            <p className="inline-flex items-center gap-1.5">
              <Icon name="calendar" size={12} style={{ color: C.gold }} />
              <span>
                {relative} · {time}
              </span>
            </p>
            {venue && (
              <p className="inline-flex items-center gap-1.5 line-clamp-1">
                <Icon name="mapPin" size={12} style={{ color: C.gold }} />
                <span className="truncate">{venue}</span>
              </p>
            )}
          </div>

          <div className="mt-auto pt-4">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: C.saffron }}
            >
              Reserve
              <Icon name="arrowRight" size={11} />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
