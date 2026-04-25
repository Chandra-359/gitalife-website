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
import { AnimatePresence, motion } from "framer-motion";
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
        className="relative px-5 sm:px-6 py-16 sm:py-24 surface-parchment"
      >
        <div className="mx-auto max-w-5xl">
          <SectionHeader />
          <LumaCalendarEmbed />
        </div>
      </section>
    );
  }

  return (
    <section
      id="calendar"
      className="relative px-5 sm:px-6 py-16 sm:py-24 surface-parchment"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader />

        {/* ---- Featured hero ---- */}
        {featured && (
          <div className="mb-10 sm:mb-14">
            <LumaFeaturedCard event={featured} />
          </div>
        )}

        {/* ---- Filter chips (sticky on scroll) ---- */}
        {tagOptions.length > 0 && (
          <div
            className="sticky top-2 z-30 -mx-5 sm:-mx-6 px-5 sm:px-6 py-3 mb-6"
            style={{
              background:
                "linear-gradient(180deg, var(--bg-parchment) 0%, var(--bg-parchment) 70%, transparent 100%)",
            }}
          >
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

        {/* ---- Empty filter result ---- */}
        {filtered.length === 0 ? (
          <FilteredEmptyState onReset={() => setActiveTag(ALL)} />
        ) : (
          <>
            {/* ---- Week-bucketed sections ---- */}
            <div className="space-y-12 sm:space-y-14">
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleBuckets.map((bucket) => (
                  <motion.div
                    key={`${activeTag}-${bucket.key}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <BucketHeader
                      label={bucket.label}
                      count={bucket.events.length}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                      {bucket.events.map((e, i) => (
                        <LumaEventCard
                          key={e.apiId}
                          event={e}
                          index={i}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ---- Show-all toggle ---- */}
            {hiddenBuckets.length > 0 && (
              <div className="mt-12 flex flex-col items-center gap-3">
                {!showAll ? (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.16em] transition-all hover:scale-[1.02]"
                    style={{
                      background: "white",
                      color: C.krishnaBlue,
                      border: `1px solid ${C.gold}40`,
                      boxShadow:
                        "0 1px 2px rgba(15,27,77,0.04), 0 12px 24px -12px rgba(15,27,77,0.18)",
                    }}
                  >
                    <span>
                      Show {hiddenEventCount} more program
                      {hiddenEventCount === 1 ? "" : "s"}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
                      style={{
                        background: `${C.gold}1f`,
                        color: C.saffron,
                      }}
                    >
                      +{hiddenBuckets.length}{" "}
                      {hiddenBuckets.length === 1 ? "week" : "weeks"}
                    </span>
                    <Icon
                      name="arrowRight"
                      size={12}
                      className="rotate-90 transition-transform group-hover:translate-y-0.5"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="text-[12px] font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "#6b7280" }}
                  >
                    Collapse to upcoming weeks
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* ---- Helper line ---- */}
        <p
          className="mt-12 text-center text-[12.5px]"
          style={{ color: "#6b7280" }}
        >
          All registration is free and powered by Luma — no app required.
        </p>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  SectionHeader — eyebrow + heading                                  */
/* ================================================================== */
function SectionHeader() {
  return (
    <div className="text-center mb-10 sm:mb-12">
      <span
        className="eyebrow inline-flex items-center gap-2"
        style={{ color: C.saffron }}
      >
        <Icon name="sparkle" size={13} />
        What&rsquo;s open right now
      </span>
      <h2
        className="mt-3 text-3xl sm:text-4xl font-bold font-serif"
        style={{ color: C.krishnaBlue }}
      >
        Upcoming programs
      </h2>
      <p
        className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed"
        style={{ color: "var(--ink-secondary)" }}
      >
        Tap any program to RSVP — registration opens on Luma. New here?
        Start with a Sunday class.
      </p>
    </div>
  );
}

/* ================================================================== */
/*  BucketHeader — section divider for each week                       */
/* ================================================================== */
function BucketHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <h3
        className="font-serif text-xl sm:text-2xl font-bold"
        style={{ color: C.krishnaBlue, letterSpacing: "-0.01em" }}
      >
        {label}
      </h3>
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.16em] tabular-nums"
        style={{
          background: `${C.gold}14`,
          color: C.saffron,
          border: `1px solid ${C.gold}33`,
        }}
      >
        {count} {count === 1 ? "program" : "programs"}
      </span>
      <div
        aria-hidden
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(90deg, ${C.gold}30, transparent)`,
        }}
      />
    </div>
  );
}

/* ================================================================== */
/*  FilteredEmptyState                                                 */
/* ================================================================== */
function FilteredEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div
      className="rounded-2xl px-6 py-14 text-center"
      style={{
        background: "white",
        border: `1px dashed ${C.gold}40`,
      }}
    >
      <p
        className="font-serif text-xl font-bold"
        style={{ color: C.krishnaBlue }}
      >
        Nothing matches that filter — yet.
      </p>
      <p className="mt-2 text-[14px]" style={{ color: "var(--ink-secondary)" }}>
        Try another tag or view everything.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em]"
        style={{
          background: `${C.saffron}12`,
          color: C.saffron,
          border: `1px solid ${C.saffron}33`,
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
