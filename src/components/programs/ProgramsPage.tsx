"use client";

/**
 * ProgramsPage — the public hub for every Gita Life NYC program.
 *
 * This page lives at /programs and is the destination for QR codes
 * distributed at temple, festivals, classes, NYU, and Newport. It must:
 *  - load fast on mobile
 *  - orient a brand-new visitor in under 5 seconds
 *  - hand off registration cleanly to Luma
 *
 * Composition (top → bottom):
 *   1. Navbar (shared)
 *   2. Hero (sacred indigo, drifting petals, identity)
 *   3. Trust strip (free · open · luma)
 *   4. Calendar embed (LumaCalendarEmbed)
 *   5. WhatToExpect (3 category cards: Classes · Volunteer · Retreats)
 *   6. PastPrograms carousel (desaturated, social proof)
 *   7. CTA strip (don't see your program? get connected)
 *   8. ConnectFooter (testimonials + social)
 */

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { Program } from "@/data/programs";
import type { LumaEvent } from "@/lib/luma";
import { RETREATS, INSTAGRAM_URL } from "@/data/home";
import { C, Icon } from "@/components/home/icons";
import Navbar from "@/components/Navbar";
import ConnectFooter from "@/components/home/ConnectFooter";
import LumaEventsSection from "./LumaEventsSection";

interface ProgramsPageProps {
  testimonials: Program[];
  events: LumaEvent[];
}

/* ================================================================== */
/*  Hero — sacred indigo, drifting petals                              */
/* ================================================================== */
const PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: `${(i * 11 + (i % 3) * 5) % 100}%`,
  delay: `${(i * 1.7) % 9}s`,
  duration: `${15 + (i % 4) * 2}s`,
  driftX: `${(i % 2 ? 1 : -1) * (24 + (i * 9) % 70)}px`,
  size: 7 + (i % 4) * 2,
  opacity: 0.32 + (i % 3) * 0.08,
}));

function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden surface-sacred texture-grain">
      {/* Drifting petals — pure CSS, reduced-motion respected globally */}
      {!reduce && (
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          {PETALS.map((p, i) => (
            <span
              key={i}
              className="absolute top-0 animate-petal rounded-full"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                background: `radial-gradient(circle, ${C.gold} 0%, ${C.saffron} 70%, transparent 100%)`,
                opacity: p.opacity,
                ["--drift-delay" as string]: p.delay,
                ["--drift-dur" as string]: p.duration,
                ["--drift-x" as string]: p.driftX,
              }}
            />
          ))}
        </div>
      )}

      {/* Warm aura under the eyebrow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${C.gold}33 0%, ${C.saffron}1a 50%, transparent 75%)`,
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 pt-32 pb-16 sm:pt-36 sm:pb-20 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow inline-flex items-center gap-2"
          style={{ color: C.goldLight }}
        >
          <span
            className="h-1 w-6 rounded-full"
            style={{ background: `linear-gradient(90deg, ${C.gold}, ${C.saffron})` }}
          />
          Programs · Classes · Volunteer · Retreats
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="display-xl mt-5 text-gradient-warm-glow"
        >
          Find your place.
          <br className="hidden sm:block" />
          <span className="sm:ml-3">Take a seat.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mx-auto mt-6 max-w-2xl text-[15px] sm:text-[17px] leading-relaxed"
          style={{ color: "rgba(255,251,242,0.78)" }}
        >
          Every gathering — weekly Gita classes, harinam on the streets, monthly
          festivals, retreats upstate, and seva opportunities — opens for
          registration here. Pick what calls you.
        </motion.p>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-2.5"
        >
          {[
            { icon: "lotus" as const, label: "Free · open to all" },
            { icon: "calendar" as const, label: "Registration via Luma" },
            { icon: "mapPin" as const, label: "NYC · NJ · upstate" },
          ].map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold backdrop-blur"
              style={{
                background: "rgba(255,251,242,0.06)",
                border: `1px solid ${C.gold}33`,
                color: "rgba(255,251,242,0.92)",
              }}
            >
              <Icon name={item.icon} size={13} style={{ color: C.goldLight }} />
              {item.label}
            </span>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <a
          href="#calendar"
          aria-label="Jump to upcoming programs"
          className="mt-12 inline-flex flex-col items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-100"
          style={{ color: "rgba(255,251,242,0.55)" }}
        >
          See what&rsquo;s open
          <span className="animate-scroll-cue inline-block">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>

      {/* Bottom gradient transition into parchment */}
      <div
        aria-hidden
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, var(--bg-parchment) 100%)",
        }}
      />
    </section>
  );
}

/* ================================================================== */
/*  WhatToExpect — 3 category cards                                    */
/* ================================================================== */
const TRACKS: Array<{
  title: string;
  description: string;
  href: string;
  accent: keyof typeof TRACK_ACCENTS;
  icon: "book" | "handshake" | "mountain";
  details: string[];
}> = [
  {
    title: "Classes",
    description:
      "Weekly Bhagavad Gita classes — Newport, Jersey City, ISKCON Brooklyn, and at NYU. Tea, dinner, real conversation.",
    href: "/classes",
    accent: "saffron",
    icon: "book",
    details: ["Weekly · Fri / Sat / Sun", "Open to all", "Free, prasadam included"],
  },
  {
    title: "Volunteer",
    description:
      "From a one-hour drop-in at a Sunday harinam to leading a festival crew — find a role that fits your schedule.",
    href: "/volunteer",
    accent: "peacock",
    icon: "handshake",
    details: ["1 hour to ongoing", "Mentored by senior devotees", "Real friendships"],
  },
  {
    title: "Retreats",
    description:
      "Quarterly weekends upstate — kirtan under the stars, Gita study, hikes, fire yajña, and meals together.",
    href: "/retreats",
    accent: "gold",
    icon: "mountain",
    details: ["3 days · Catskills / Hudson", "Limited capacity", "All meals prasadam"],
  },
];

const TRACK_ACCENTS = {
  saffron: { color: C.saffron, soft: `${C.saffron}12`, ring: `${C.saffron}26` },
  peacock: { color: C.peacock, soft: `${C.peacock}12`, ring: `${C.peacock}26` },
  gold: { color: C.gold, soft: `${C.gold}1a`, ring: `${C.gold}33` },
} as const;

function WhatToExpect() {
  return (
    <section className="relative px-5 sm:px-6 py-16 sm:py-24" style={{ background: C.warmBg }}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <span className="eyebrow" style={{ color: C.peacock }}>
            What you&rsquo;ll find on the calendar
          </span>
          <h2
            className="mt-3 text-2xl sm:text-3xl font-bold font-serif"
            style={{ color: C.krishnaBlue }}
          >
            Three ways to begin
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {TRACKS.map((track, i) => {
            const accent = TRACK_ACCENTS[track.accent];
            return (
              <motion.div
                key={track.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={track.href}
                  className="group relative block h-full rounded-3xl p-7 hover-lift"
                  style={{
                    background: "white",
                    border: `1px solid ${accent.ring}`,
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      background: accent.soft,
                      color: accent.color,
                    }}
                  >
                    <Icon name={track.icon} size={22} />
                  </div>

                  <h3
                    className="mt-5 text-xl font-bold font-serif"
                    style={{ color: C.krishnaBlue }}
                  >
                    {track.title}
                  </h3>

                  <p className="mt-2 text-[14px] leading-[1.65] text-gray-600">
                    {track.description}
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {track.details.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-2 text-[12.5px] text-gray-700"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: accent.color }}
                        />
                        {d}
                      </li>
                    ))}
                  </ul>

                  <span
                    className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.16em] transition-transform group-hover:translate-x-0.5"
                    style={{ color: accent.color }}
                  >
                    Learn more
                    <Icon name="arrowRight" size={12} />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  PastPrograms — desaturated horizontal carousel of past retreats    */
/* ================================================================== */
function PastPrograms() {
  const past = RETREATS.filter((r) => r.status === "past");
  if (past.length === 0) return null;

  return (
    <section
      className="relative px-0 sm:px-6 py-16 sm:py-20"
      style={{ background: C.cream }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-0">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <span className="eyebrow" style={{ color: "#9ca3af" }}>
              From those who came before
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              Past gatherings
            </h2>
          </div>
          <span className="text-[12px] hidden sm:block" style={{ color: "#9ca3af" }}>
            ← scroll →
          </span>
        </div>
      </div>

      <div className="relative">
        {/* Edge fade overlays for the scroll affordance */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10"
          style={{
            background: `linear-gradient(90deg, ${C.cream} 0%, transparent 100%)`,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10"
          style={{
            background: `linear-gradient(270deg, ${C.cream} 0%, transparent 100%)`,
          }}
        />

        <div className="snap-x snap-mandatory overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-5 sm:px-6 pb-2">
            {/* Initial spacer to center first card on small screens */}
            <div className="shrink-0 w-1 sm:hidden" />
            {past.map((r, i) => (
              <motion.article
                key={r.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="snap-start shrink-0 w-[320px] sm:w-[360px] rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,251,242,0.8) 100%)",
                  border: `1px solid rgba(15,27,77,0.06)`,
                  boxShadow: "0 1px 2px rgba(15,27,77,0.04)",
                  filter: "saturate(0.85)",
                }}
              >
                <span
                  className="text-[10.5px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: "#9ca3af" }}
                >
                  {r.dateLabel} · {r.location}
                </span>

                <h3
                  className="mt-2 text-lg font-bold font-serif"
                  style={{ color: C.krishnaBlue }}
                >
                  {r.title}
                </h3>

                {r.quote && (
                  <blockquote
                    className="mt-4 text-[13.5px] leading-[1.65] italic"
                    style={{ color: "#4b5563" }}
                  >
                    &ldquo;{r.quote}&rdquo;
                  </blockquote>
                )}

                {r.quoteAuthor && (
                  <p
                    className="mt-2 text-[11.5px] font-semibold"
                    style={{ color: C.gold }}
                  >
                    — {r.quoteAuthor}
                  </p>
                )}

                {r.pastHighlights && r.pastHighlights.length > 0 && (
                  <ul className="mt-5 pt-4 space-y-1.5 border-t" style={{ borderColor: `${C.gold}22` }}>
                    {r.pastHighlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-[12px] text-gray-600"
                      >
                        <span
                          className="mt-1.5 h-1 w-1 rounded-full shrink-0"
                          style={{ background: C.gold }}
                        />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.article>
            ))}
            <div className="shrink-0 w-1" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  CTA strip — "don't see your program?"                              */
/* ================================================================== */
function CTAStrip() {
  return (
    <section
      className="relative px-6 py-16 sm:py-20"
      style={{ background: C.warmBg }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow" style={{ color: C.lotusPink }}>
          Don&rsquo;t see your program?
        </span>
        <h2
          className="mt-3 text-2xl sm:text-3xl font-bold font-serif"
          style={{ color: C.krishnaBlue }}
        >
          Tell us what you&rsquo;d love to attend.
        </h2>
        <p
          className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed"
          style={{ color: "var(--ink-secondary)" }}
        >
          New to NYC? Want to host a class in your neighborhood? Want to help
          run the next festival? Drop us a line and we&rsquo;ll find a spot
          for you.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/#get-connected"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:scale-[1.03] btn-primary-gradient"
          >
            Get connected
            <Icon name="arrowRight" size={12} />
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-[13px] font-semibold transition-colors"
            style={{
              color: C.krishnaBlue,
              border: `1px solid ${C.gold}40`,
            }}
          >
            Follow @gitalifenyc
          </a>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  ProgramsPage — composed                                            */
/* ================================================================== */
export default function ProgramsPage({
  testimonials,
  events,
}: ProgramsPageProps) {
  return (
    <div className="min-h-screen surface-parchment">
      <Navbar />
      <Hero />
      <LumaEventsSection events={events} />
      <WhatToExpect />
      <PastPrograms />
      <CTAStrip />
      <ConnectFooter testimonials={testimonials} />
    </div>
  );
}
