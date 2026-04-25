"use client";

/**
 * WeekRail — "This Week" horizontal-ish grid of upcoming classes.
 * Highlights the next upcoming class based on current weekday.
 */

import Link from "next/link";
import { WEEKLY_SCHEDULE, type WeeklyClass } from "@/data/home";
import { C, Icon } from "./icons";

const DAY_ORDER: WeeklyClass["day"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function isNextUpcoming(item: WeeklyClass, today: number, nextIdx: number): boolean {
  return DAY_ORDER.indexOf(item.day) === nextIdx && today !== nextIdx;
}

function getNextUpcomingIdx(items: WeeklyClass[]): number {
  const today = new Date().getDay(); // 0=Sun..6=Sat
  const todayIdx = today === 0 ? 6 : today - 1; // convert to Mon=0..Sun=6
  const dayIdxs = items.map((i) => DAY_ORDER.indexOf(i.day));
  // find the smallest dayIdx >= todayIdx, else wrap to min
  const future = dayIdxs.filter((i) => i >= todayIdx);
  return future.length ? Math.min(...future) : Math.min(...dayIdxs);
}

function kindMeta(kind: WeeklyClass["kind"]) {
  switch (kind) {
    case "gita-class":
      return { label: "Gita Class", color: C.gold, icon: "book" as const };
    case "harinam":
      return { label: "Harinam", color: C.saffron, icon: "music" as const };
    case "japa":
      return { label: "Japa", color: C.lotusPink, icon: "flame" as const };
    case "book-reading":
      return { label: "Book Reading", color: C.peacock, icon: "book" as const };
  }
}

export default function WeekRail() {
  const nextIdx = getNextUpcomingIdx(WEEKLY_SCHEDULE);
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

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
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
            style={{ color: C.krishnaBlue }}
          >
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
          {WEEKLY_SCHEDULE.map((item, i) => {
            const meta = kindMeta(item.kind);
            const isNext = isNextUpcoming(item, todayIdx, nextIdx);
            return (
              <div
                key={i}
                role="listitem"
                className="glass-card hover-lift group relative w-[78%] max-w-[300px] shrink-0 rounded-xl p-5 sm:w-auto sm:max-w-none sm:shrink"
                style={{
                  border: `1px solid ${isNext ? meta.color : "var(--paper-edge)"}`,
                }}
              >
                {/* Upcoming badge */}
                {isNext && (
                  <span
                    className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white"
                    style={{ background: meta.color }}
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
                    {item.day}
                  </span>
                  <span className="text-[12px] text-gray-500">{item.time}</span>
                </div>

                {/* Kind chip */}
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold mb-3"
                  style={{ background: `${meta.color}15`, color: meta.color }}
                >
                  <Icon name={meta.icon} size={10} />
                  {meta.label}
                </span>

                <h3
                  className="text-[15px] font-semibold"
                  style={{ color: C.krishnaBlue }}
                >
                  {item.title}
                </h3>

                <div className="flex items-center gap-1 mt-1 text-[12px]" style={{ color: C.peacock }}>
                  <Icon name="mapPin" size={11} />
                  <span>
                    {item.location}
                    <span className="text-gray-400"> · {item.neighborhood}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
