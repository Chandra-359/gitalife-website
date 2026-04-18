"use client";

/**
 * ClassesPageContent — List of weekly classes with location filter
 * and "what to expect" guide.
 *
 * Phase 3 follow-up: swap WEEKLY_SCHEDULE for a live Google Sheet
 * fetch via src/lib/schedule.ts and add map markers to the locations.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  WEEKLY_SCHEDULE,
  CLASS_LOCATIONS,
  type WeeklyClass,
  type ClassLocation,
} from "@/data/home";
import { C, Icon, colorFor } from "./icons";

const WHAT_TO_EXPECT = [
  {
    time: "7:00 PM",
    title: "Opening kirtan",
    desc: "A short chanting of the Hare Krishna mahamantra with harmonium and mridanga.",
  },
  {
    time: "7:20 PM",
    title: "Gita study",
    desc: "A senior devotee reads one verse, shares Srila Prabhupada's purport, and opens the floor for questions.",
  },
  {
    time: "8:15 PM",
    title: "Dinner (prasadam)",
    desc: "Vegetarian, home-cooked, offered first to the deities. All are welcome to stay and eat.",
  },
  {
    time: "9:00 PM",
    title: "Q&A & closing",
    desc: "Anyone can ask anything — no dumb questions, no judgment.",
  },
];

export default function ClassesPageContent() {
  const [locationSlug, setLocationSlug] = useState<string>("all");

  const filtered = useMemo<WeeklyClass[]>(() => {
    if (locationSlug === "all") return WEEKLY_SCHEDULE;
    const loc = CLASS_LOCATIONS.find((l) => l.slug === locationSlug);
    if (!loc) return WEEKLY_SCHEDULE;
    return WEEKLY_SCHEDULE.filter((c) => c.location === loc.name);
  }, [locationSlug]);

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-28 pb-14 px-6 overflow-hidden"
        style={{
          background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 100%)`,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.saffron}, ${C.gold}, transparent)`,
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{
              background: "rgba(212,168,67,0.12)",
              border: `1px solid ${C.gold}30`,
              color: C.goldLight,
            }}
          >
            <Icon name="book" size={12} />
            Weekly Classes
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl font-bold font-serif text-white leading-tight">
            Three classes every week, across NYC
          </h1>

          <p
            className="mt-5 text-[15px] sm:text-[16px] leading-[1.75] max-w-xl mx-auto"
            style={{ color: "rgba(255,251,242,0.72)" }}
          >
            Friday in Newport, Saturday in Jersey City, Sunday at ISKCON
            Brooklyn. Free, open to all, and beginner-friendly.
          </p>
        </div>
      </section>

      {/* Location filter pills */}
      <section className="px-6 pt-10 pb-4" style={{ background: C.cream }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-2">
          <FilterPill
            label="All locations"
            active={locationSlug === "all"}
            onClick={() => setLocationSlug("all")}
          />
          {CLASS_LOCATIONS.map((loc) => (
            <FilterPill
              key={loc.slug}
              label={loc.name}
              color={colorFor(loc.color)}
              active={locationSlug === loc.slug}
              onClick={() => setLocationSlug(loc.slug)}
            />
          ))}
        </div>
      </section>

      {/* Weekly schedule list */}
      <section className="px-6 py-10" style={{ background: C.cream }}>
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((cls, i) => (
                <ClassCard key={`${cls.day}-${cls.time}-${cls.location}`} cls={cls} i={i} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 text-[14px]">
                  No classes match this filter yet.
                </div>
              )}
            </div>
          </AnimatePresence>
        </div>
      </section>

      {/* Location detail cards */}
      <section id="locations" className="px-6 py-16" style={{ background: C.warmBg }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.gold }}
            >
              Locations
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              Where to find us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CLASS_LOCATIONS.map((loc, i) => (
              <LocationCard key={loc.slug} loc={loc} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section id="what-to-expect" className="px-6 py-20" style={{ background: C.cream }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.gold }}
            >
              A typical class
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              What to expect
            </h2>
            <p className="mt-3 text-[14px] text-gray-600 max-w-md mx-auto">
              First time? Here&rsquo;s the rough flow of an evening.
            </p>
          </div>

          <div className="space-y-3">
            {WHAT_TO_EXPECT.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 rounded-2xl"
                style={{
                  background: "white",
                  border: `1px solid ${C.gold}18`,
                }}
              >
                <div
                  className="shrink-0 text-[11px] font-bold font-mono w-16 pt-1"
                  style={{ color: C.saffron }}
                >
                  {step.time}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold font-serif" style={{ color: C.krishnaBlue }}>
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-[1.6] text-gray-600">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section
        className="px-6 py-16"
        style={{
          background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 100%)`,
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Questions? Just want to come say hi?
          </h2>
          <p className="mt-3 text-[14px]" style={{ color: "rgba(255,251,242,0.65)" }}>
            Message us on Instagram or stop by any Sunday class — we&rsquo;d love to meet you.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/festival"
              className="rounded-full px-6 py-3 text-[13px] font-semibold text-white transition-all hover:scale-[1.03]"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                boxShadow: `0 0 25px ${C.gold}30`,
              }}
            >
              See the monthly festival
            </Link>
            <Link
              href="/"
              className="rounded-full px-6 py-3 text-[13px] font-semibold transition-all"
              style={{
                border: `1px solid ${C.gold}30`,
                color: C.goldLight,
              }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function FilterPill({
  label,
  active,
  color = C.krishnaBlue,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-4 py-2 text-[13px] font-semibold transition-all"
      style={{
        background: active ? color : "white",
        color: active ? "white" : C.krishnaBlue,
        border: `1px solid ${active ? color : `${C.gold}30`}`,
        boxShadow: active ? `0 6px 16px ${color}25` : "none",
      }}
    >
      {label}
    </button>
  );
}

function ClassCard({ cls, i }: { cls: WeeklyClass; i: number }) {
  const loc = CLASS_LOCATIONS.find((l) => l.name === cls.location);
  const color = loc ? colorFor(loc.color) : C.gold;
  const kindLabel =
    cls.kind === "gita-class"
      ? "Gita class"
      : cls.kind === "harinam"
        ? "Street kirtan"
        : cls.kind === "japa"
          ? "Japa meditation"
          : "Book reading";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: i * 0.05 }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: "white",
        border: `1px solid ${color}25`,
        boxShadow: "0 4px 16px rgba(27,42,107,0.04)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ background: `linear-gradient(180deg, ${color}, ${color}80)` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
              style={{ background: `${color}15`, color }}
            >
              {cls.day}
            </span>
            <span className="text-[12px] font-bold" style={{ color: C.saffron }}>
              {cls.time}
            </span>
          </div>

          <h3
            className="mt-2 text-[17px] font-bold font-serif"
            style={{ color: C.krishnaBlue }}
          >
            {cls.title}
          </h3>
          <p className="mt-0.5 text-[12px] uppercase tracking-wider text-gray-500">
            {kindLabel}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[13px] text-gray-600">
        <Icon name="mapPin" size={13} style={{ color }} />
        <span className="font-semibold">{cls.location}</span>
        <span className="text-gray-300">·</span>
        <span>{cls.neighborhood}</span>
      </div>

      {loc && (
        <a
          href={loc.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors hover:opacity-80"
          style={{ color }}
        >
          Directions
          <Icon name="arrowRight" size={10} />
        </a>
      )}
    </motion.div>
  );
}

function LocationCard({ loc, i }: { loc: ClassLocation; i: number }) {
  const color = colorFor(loc.color);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: i * 0.08 }}
      className="rounded-2xl p-6"
      style={{
        background: "white",
        border: `1px solid ${color}25`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
      >
        <Icon name="mapPin" size={18} />
      </div>

      <h3 className="text-[18px] font-bold font-serif" style={{ color: C.krishnaBlue }}>
        {loc.name}
      </h3>
      <p className="text-[12px] text-gray-500 uppercase tracking-wider">{loc.neighborhood}</p>

      <p className="mt-3 text-[13px] leading-[1.6] text-gray-600">{loc.description}</p>

      {loc.transit && (
        <p className="mt-4 text-[12px] text-gray-500 pt-3" style={{ borderTop: `1px solid ${C.gold}15` }}>
          <span className="font-semibold" style={{ color }}>Transit:</span> {loc.transit}
        </p>
      )}

      <a
        href={loc.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold"
        style={{ color }}
      >
        Open in Maps
        <Icon name="arrowRight" size={10} />
      </a>
    </motion.div>
  );
}
