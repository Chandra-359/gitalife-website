"use client";

/**
 * WeekRail — "This Week" rail of upcoming programs.
 * Driven by the same Luma feed as /programs so day/time stay in sync.
 */

import Link from "next/link";
import type { LumaEvent } from "@/lib/luma";
import { formatTime, getTagAccent } from "@/components/programs/dateUtils";
import { C, Icon } from "./icons";

const DOW_LONG = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "America/New_York",
});

const ACCENT_HEX: Record<ReturnType<typeof getTagAccent>, string> = {
  saffron: C.saffron,
  gold: C.gold,
  peacock: C.peacock,
  lotus: C.lotusPink,
  krishna: C.krishnaBlue,
};

type IconName = "book" | "music" | "flame" | "calendar";

function tagIcon(tag: string | undefined): IconName {
  const key = (tag ?? "").toLowerCase();
  if (key.includes("harinam") || key.includes("kirtan")) return "music";
  if (key.includes("japa")) return "flame";
  if (
    key.includes("class") ||
    key.includes("study") ||
    key.includes("student") ||
    key.includes("professional") ||
    key.includes("sunday")
  ) {
    return "book";
  }
  return "calendar";
}

const MAX_ITEMS = 4;

interface WeekRailProps {
  events: LumaEvent[];
}

export default function WeekRail({ events }: WeekRailProps) {
  const items = events.slice(0, MAX_ITEMS);

  if (items.length === 0) return null;

  return (
    <section className="surface-paper-warm relative py-14 px-5 sm:py-20 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: C.gold }}
            >
              <Icon name="calendar" size={14} />
              This Week
            </span>
            <h2
              className="section-heading mt-2 text-3xl sm:text-4xl"
              style={{ color: C.krishnaBlue }}
            >
              Join a class, kirtan, or seva
            </h2>
          </div>
          <Link href="/programs" className="btn-soft btn-soft-krishna">
            See full schedule
            <Icon name="arrowRight" size={12} />
          </Link>
        </div>

        {/* Mobile swipe hint */}
        <p className="sm:hidden mb-3 text-[11px] uppercase tracking-[0.16em] text-gray-400">
          Swipe to browse →
        </p>

        <div
          className="snap-rail snap-rail-bleed sm:m-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:p-0 lg:grid-cols-4"
          role="list"
          aria-label="This week's schedule"
        >
          {items.map((event, i) => {
            const start = new Date(event.startAt);
            const dayName = DOW_LONG.format(start);
            const time = formatTime(event.startAt);
            const primaryTag = event.tags[0];
            const accent = ACCENT_HEX[getTagAccent(primaryTag ?? "")];
            const icon = tagIcon(primaryTag);
            const venue =
              event.location?.venue ?? event.location?.city ?? "";
            const neighborhood =
              event.location?.venue && event.location?.city
                ? event.location.city
                : undefined;
            const isNext = i === 0;

            return (
              <a
                key={event.apiId}
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                role="listitem"
                className="glass-card hover-lift group relative w-[78%] max-w-[300px] shrink-0 rounded-xl p-5 sm:w-auto sm:max-w-none sm:shrink"
                style={{
                  border: `1px solid ${isNext ? accent : "var(--paper-edge)"}`,
                }}
              >
                {/* Up next badge */}
                {isNext && (
                  <span
                    className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white"
                    style={{ background: accent }}
                  >
                    Up next
                  </span>
                )}

                {/* Day + time */}
                <div className="flex items-baseline justify-between mb-3">
                  <span
                    className="text-[16px] font-semibold"
                    style={{ color: C.krishnaBlue }}
                  >
                    {dayName}
                  </span>
                  <span className="text-[12px] text-gray-500">{time}</span>
                </div>

                {/* Tag chip */}
                {primaryTag && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider mb-3 text-white"
                    style={{
                      background: accent,
                      boxShadow: `0 1px 2px rgba(80,55,15,0.15), 0 4px 10px -4px ${accent}88`,
                    }}
                  >
                    <Icon name={icon} size={10} />
                    {primaryTag}
                  </span>
                )}

                <h3
                  className="text-[15px] font-semibold line-clamp-2"
                  style={{ color: C.krishnaBlue }}
                >
                  {event.name}
                </h3>

                {venue && (
                  <div
                    className="flex items-center gap-1 mt-1 text-[12px]"
                    style={{ color: C.peacock }}
                  >
                    <Icon name="mapPin" size={11} />
                    <span className="truncate">
                      {venue}
                      {neighborhood && (
                        <span className="text-gray-400"> · {neighborhood}</span>
                      )}
                    </span>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
