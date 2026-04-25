"use client";

/**
 * LumaFeaturedCard — featured next-up event.
 *
 * Mobile: stacked image-on-top card. Desktop: 2-col split.
 * No animations. Static, mobile-first.
 */

import Image from "next/image";
import type { LumaEvent } from "@/lib/luma";
import { C, Icon } from "@/components/home/icons";
import {
  formatRelativeDay,
  formatTimeRange,
  getDatePill,
  getTagAccent,
} from "./dateUtils";
import LumaCountdown from "./LumaCountdown";

const ACCENT_HEX: Record<ReturnType<typeof getTagAccent>, string> = {
  saffron: C.saffron,
  gold: C.gold,
  peacock: C.peacock,
  lotus: C.lotusPink,
  krishna: C.krishnaBlue,
};

interface LumaFeaturedCardProps {
  event: LumaEvent;
}

export default function LumaFeaturedCard({ event }: LumaFeaturedCardProps) {
  const pill = getDatePill(event.startAt);
  const relative = formatRelativeDay(event.startAt);
  const timeRange = formatTimeRange(event.startAt, event.endAt);
  const venueLine = [event.location?.venue, event.location?.city]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid rgba(15,27,77,0.08)" }}
    >
      <div className="grid md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px]">
          {event.coverUrl ? (
            <Image
              src={event.coverUrl}
              alt={event.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${C.krishnaBlue} 0%, ${C.krishnaDeep} 100%)`,
              }}
            />
          )}

          {/* Featured badge */}
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{
                background: "rgba(255,255,255,0.95)",
                color: C.saffron,
              }}
            >
              <Icon name="sparkle" size={11} />
              Next up
            </span>
          </div>

          {/* Date pill */}
          <div
            className="absolute bottom-3 left-3 rounded-lg px-3 py-2 text-center"
            style={{ background: "rgba(255,251,242,0.96)" }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ color: C.saffron }}
            >
              {pill.monthShort}
            </p>
            <p
              className="text-2xl font-bold leading-none mt-0.5 tabular-nums"
              style={{ color: C.krishnaBlue }}
            >
              {pill.day}
            </p>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.14em] mt-0.5 text-gray-500"
            >
              {pill.dowShort}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col p-5 sm:p-7">
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {event.tags.slice(0, 3).map((tag) => {
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

          <p
            className="text-[12px] font-bold uppercase tracking-[0.14em]"
            style={{ color: C.saffron }}
          >
            {relative} · {timeRange}
          </p>

          <h3
            className="mt-2 text-xl sm:text-2xl font-bold leading-tight"
            style={{ color: C.krishnaBlue }}
          >
            {event.name}
          </h3>

          {venueLine && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-600">
              <Icon name="mapPin" size={13} style={{ color: C.gold }} />
              {venueLine}
            </p>
          )}

          {event.description && (
            <p className="mt-3 text-sm leading-relaxed line-clamp-3 text-gray-600">
              {event.description}
            </p>
          )}

          <div className="mt-4">
            <LumaCountdown startIso={event.startAt} endIso={event.endAt} />
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            >
              Reserve your spot
              <Icon name="arrowRight" size={13} />
            </a>
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: C.krishnaBlue }}
            >
              View on Luma
              <Icon name="arrowRight" size={11} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
