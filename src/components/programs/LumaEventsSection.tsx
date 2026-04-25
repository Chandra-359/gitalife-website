"use client";

/**
 * LumaEventsSection — the heart of /programs.
 *
 * Receives a server-fetched list of upcoming events and renders:
 *  - a featured hero card for the next-up event
 *  - filter chips for tags ("All" + each unique tag)
 *  - an animated magazine grid of the remaining events
 *
 * If the events array is empty, falls back to the LumaCalendarEmbed
 * iframe so the page never lies about availability.
 */

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LumaEvent } from "@/lib/luma";
import { C, Icon } from "@/components/home/icons";
import { getTagAccent } from "./dateUtils";
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

export default function LumaEventsSection({ events }: LumaEventsSectionProps) {
  const [activeTag, setActiveTag] = useState<string>(ALL);

  const tagOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    // Sort by frequency desc, then alpha
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [events]);

  const filtered = useMemo(() => {
    if (activeTag === ALL) return events;
    return events.filter((e) => e.tags.includes(activeTag));
  }, [activeTag, events]);

  const [featured, ...rest] = filtered;

  /* ---- Empty state — fallback to iframe ---- */
  if (events.length === 0) {
    return (
      <section
        id="calendar"
        className="relative px-5 sm:px-6 py-16 sm:py-24 surface-parchment"
      >
        <div className="mx-auto max-w-5xl">
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
          </div>
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
        {/* ---- Header ---- */}
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

        {/* ---- Featured hero ---- */}
        {featured && activeTag === ALL && (
          <div className="mb-10 sm:mb-14">
            <LumaFeaturedCard event={featured} />
          </div>
        )}

        {/* ---- Filter chips ---- */}
        {tagOptions.length > 0 && (
          <FilterRail
            options={tagOptions}
            activeTag={activeTag}
            onChange={setActiveTag}
            totalCount={events.length}
          />
        )}

        {/* ---- Grid ---- */}
        <motion.div
          layout
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {(activeTag === ALL ? rest : filtered).map((e, i) => (
              <motion.div
                key={e.apiId}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.32) }}
              >
                <LumaEventCard event={e} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ---- Filtered empty state ---- */}
        {filtered.length === 0 && (
          <div
            className="mt-8 rounded-2xl px-6 py-14 text-center"
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
            <p
              className="mt-2 text-[14px]"
              style={{ color: "var(--ink-secondary)" }}
            >
              Try another tag or view everything.
            </p>
            <button
              type="button"
              onClick={() => setActiveTag(ALL)}
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
        )}

        {/* ---- Helper line ---- */}
        <p
          className="mt-10 text-center text-[12.5px]"
          style={{ color: "#6b7280" }}
        >
          All registration is free and powered by Luma — no app required.
        </p>
      </div>
    </section>
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
      {/* edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 sm:hidden"
        style={{
          background: "linear-gradient(90deg, var(--bg-parchment) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10 sm:hidden"
        style={{
          background: "linear-gradient(270deg, var(--bg-parchment) 0%, transparent 100%)",
        }}
      />

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex flex-wrap sm:justify-center gap-2 px-1 pb-1 min-w-max sm:min-w-0">
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
        border: active
          ? `1px solid ${accent}`
          : `1px solid ${accent}33`,
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
