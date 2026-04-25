"use client";

/**
 * LumaEventsSection — the heart of /programs.
 *
 * Receives a server-fetched list of upcoming events and renders:
 *  - a featured hero card for the next-up event (no filter active)
 *  - sticky filter chips for tags ("All" + each unique tag)
 *  - week-bucketed sections with progressive disclosure so a 50-event
 *    calendar doesn't dump the full list at once
 *
 * If the events array is empty, falls back to the LumaCalendarEmbed
 * iframe so the page never lies about availability.
 */

import { useMemo, useState } from "react";
import type { LumaEvent } from "@/lib/luma";
import { C, Icon } from "@/components/home/icons";
import { bucketEventsByWeek, getTagAccent } from "./dateUtils";
import LumaFeaturedCard from "./LumaFeaturedCard";
import LumaEventCard from "./LumaEventCard";
import LumaCalendarEmbed from "./LumaCalendarEmbed";

const ACCENT_HEX: Record<ReturnType<typeof getTagAccent>, string> = {
  saffron: C.saffron,
  gold: C.gold,
  peacock: C.peacock,
  lotus: C.lotusPink,
  krishna: C.krishnaBlue,
};

interface LumaEventsSectionProps {
  events: LumaEvent[];
}

const ALL = "__ALL__";
const DEFAULT_VISIBLE_BUCKETS = 2;

export default function LumaEventsSection({ events }: LumaEventsSectionProps) {
  const [activeTag, setActiveTag] = useState<string>(ALL);
  const [showAll, setShowAll] = useState(false);

  const tagOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [events]);

  const filtered = useMemo(() => {
    if (activeTag === ALL) return events;
    return events.filter((e) => e.tags.includes(activeTag));
  }, [activeTag, events]);

  // Featured only when no filter is active and there's at least one event.
  const featured = activeTag === ALL ? filtered[0] : undefined;
  const remainder = featured ? filtered.slice(1) : filtered;

  const buckets = useMemo(
    () => bucketEventsByWeek(remainder),
    [remainder],
  );

  const visibleBuckets = showAll
    ? buckets
    : buckets.slice(0, DEFAULT_VISIBLE_BUCKETS);
  const hiddenBuckets = buckets.slice(DEFAULT_VISIBLE_BUCKETS);
  const hiddenEventCount = hiddenBuckets.reduce(
    (acc, b) => acc + b.events.length,
    0,
  );

  /* ---- Empty (no events at all) — fallback to iframe ---- */
  if (events.length === 0) {
    return (
      <section
        id="calendar"
        className="relative px-5 sm:px-8 py-10 sm:py-14"
        style={{ background: "white" }}
      >
        <div className="mx-auto max-w-5xl">
          <LumaCalendarEmbed />
        </div>
      </section>
    );
  }

  return (
    <section
      id="calendar"
      className="relative px-5 sm:px-8 py-8 sm:py-12"
      style={{ background: "white" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Featured */}
        {featured && (
          <div className="mb-8 sm:mb-10">
            <LumaFeaturedCard event={featured} />
          </div>
        )}

        {/* Filter chips */}
        {tagOptions.length > 0 && (
          <div className="mb-6">
            <FilterRail
              options={tagOptions}
              activeTag={activeTag}
              onChange={(tag) => {
                setActiveTag(tag);
                setShowAll(false);
              }}
              totalCount={events.length}
            />
          </div>
        )}

        {/* Events list */}
        {filtered.length === 0 ? (
          <FilteredEmptyState onReset={() => setActiveTag(ALL)} />
        ) : (
          <>
            <div className="space-y-8 sm:space-y-10">
              {visibleBuckets.map((bucket) => (
                <div key={`${activeTag}-${bucket.key}`}>
                  <BucketHeader
                    label={bucket.label}
                    count={bucket.events.length}
                  />
                  {/* Mobile: vertical stack with tight gap. sm+: grid. */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                    {bucket.events.map((e, i) => (
                      <LumaEventCard key={e.apiId} event={e} index={i} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Show-all toggle */}
            {hiddenBuckets.length > 0 && (
              <div className="mt-8 flex flex-col items-center gap-3">
                {!showAll ? (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-gray-50"
                    style={{
                      background: "white",
                      color: C.krishnaBlue,
                      border: "1px solid rgba(15,27,77,0.15)",
                    }}
                  >
                    Show {hiddenEventCount} more
                    <Icon name="arrowRight" size={12} className="rotate-90" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="text-xs font-semibold text-gray-500 transition-opacity hover:opacity-70"
                  >
                    Collapse
                  </button>
                )}
              </div>
            )}
          </>
        )}

        <p className="mt-8 text-center text-xs text-gray-500">
          All registration is free and powered by Luma — no app required.
        </p>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  BucketHeader — week section divider                                */
/* ================================================================== */
function BucketHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h3
        className="text-lg sm:text-xl font-semibold"
        style={{ color: C.krishnaBlue }}
      >
        {label}
      </h3>
      <span className="text-xs text-gray-500 tabular-nums">
        {count} {count === 1 ? "program" : "programs"}
      </span>
    </div>
  );
}

/* ================================================================== */
/*  FilteredEmptyState                                                 */
/* ================================================================== */
function FilteredEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div
      className="rounded-xl px-6 py-10 text-center"
      style={{
        background: "white",
        border: "1px dashed rgba(15,27,77,0.15)",
      }}
    >
      <p className="text-base font-semibold" style={{ color: C.krishnaBlue }}>
        Nothing matches that filter.
      </p>
      <p className="mt-1 text-sm text-gray-600">
        Try another tag or view everything.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
        style={{
          background: `${C.saffron}12`,
          color: C.saffron,
        }}
      >
        Show all
      </button>
    </div>
  );
}

/* ================================================================== */
/*  FilterRail — horizontal-scrollable chip rail                       */
/* ================================================================== */
interface FilterRailProps {
  options: Array<{ tag: string; count: number }>;
  activeTag: string;
  onChange: (tag: string) => void;
  totalCount: number;
}

function FilterRail({ options, activeTag, onChange, totalCount }: FilterRailProps) {
  return (
    <div className="relative">
      {/* edge fades on mobile */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 sm:hidden"
        style={{
          background:
            "linear-gradient(90deg, var(--bg-parchment) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10 sm:hidden"
        style={{
          background:
            "linear-gradient(270deg, var(--bg-parchment) 0%, transparent 100%)",
        }}
      />

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex sm:flex-wrap sm:justify-center gap-2 px-1 pb-1 min-w-max sm:min-w-0">
          <Chip
            label="All programs"
            count={totalCount}
            active={activeTag === ALL}
            accent={C.saffron}
            onClick={() => onChange(ALL)}
          />
          {options.map(({ tag, count }) => {
            const accent = ACCENT_HEX[getTagAccent(tag)];
            return (
              <Chip
                key={tag}
                label={tag}
                count={count}
                active={activeTag === tag}
                accent={accent}
                onClick={() => onChange(tag)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ChipProps {
  label: string;
  count: number;
  active: boolean;
  accent: string;
  onClick: () => void;
}

function Chip({ label, count, active, accent, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-all whitespace-nowrap"
      style={{
        background: active ? accent : "white",
        color: active ? "white" : C.krishnaBlue,
        border: active ? `1px solid ${accent}` : `1px solid ${accent}33`,
        boxShadow: active
          ? `0 6px 18px -6px ${accent}66`
          : "0 1px 2px rgba(15,27,77,0.04)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: active ? "white" : accent }}
      />
      {label}
      <span
        className="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
        style={{
          background: active ? "rgba(255,255,255,0.18)" : `${accent}14`,
          color: active ? "white" : accent,
        }}
      >
        {count}
      </span>
    </button>
  );
}
