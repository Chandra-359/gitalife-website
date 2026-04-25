"use client";

/**
 * ProgramsPage — public hub for every Gita Life NYC program.
 * Mobile-first: get visitors to the events list fast, no oversized hero.
 *
 * Composition:
 *   1. Navbar
 *   2. PageHeader (compact title + one-liner)
 *   3. LumaEventsSection (the events list — the point of the page)
 *   4. WhatToExpect (3 category cards)
 *   5. PastPrograms (horizontal scroller of past retreats)
 *   6. CTAStrip
 *   7. ConnectFooter
 */

import Link from "next/link";
import type { LumaEvent } from "@/lib/luma";
import { RETREATS, INSTAGRAM_URL } from "@/data/home";
import { C, Icon } from "@/components/home/icons";
import Navbar from "@/components/Navbar";
import ConnectFooter from "@/components/home/ConnectFooter";
import LumaEventsSection from "./LumaEventsSection";

interface ProgramsPageProps {
  events: LumaEvent[];
}

/* ================================================================== */
/*  PageHeader — compact, mobile-first. No giant hero.                 */
/* ================================================================== */
function PageHeader() {
  return (
    <section
      className="relative px-5 sm:px-8 pt-20 pb-6 sm:pt-24 sm:pb-8"
      style={{ background: "white", borderBottom: "1px solid rgba(15,27,77,0.06)" }}
    >
      <div className="mx-auto max-w-5xl">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: C.saffron }}
        >
          Programs
        </span>
        <h1
          className="mt-1 text-2xl sm:text-3xl font-bold"
          style={{ color: C.krishnaBlue }}
        >
          Upcoming gatherings
        </h1>
        <p className="mt-2 max-w-xl text-sm sm:text-[15px] leading-relaxed text-gray-600">
          Classes, harinam, festivals, retreats, and seva — tap any program to RSVP on Luma.
        </p>
      </div>
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
    href: "/programs",
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
  saffron: { color: C.saffron, soft: `${C.saffron}12` },
  peacock: { color: C.peacock, soft: `${C.peacock}12` },
  gold: { color: C.gold, soft: `${C.gold}1a` },
} as const;

function WhatToExpect() {
  return (
    <section className="relative px-5 sm:px-8 py-12 sm:py-16" style={{ background: C.warmBg }}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-8 sm:mb-10">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: C.peacock }}
          >
            What you&rsquo;ll find on the calendar
          </span>
          <h2
            className="mt-2 text-2xl sm:text-3xl font-bold"
            style={{ color: C.krishnaBlue }}
          >
            Three ways to begin
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {TRACKS.map((track) => {
            const accent = TRACK_ACCENTS[track.accent];
            return (
              <Link
                key={track.title}
                href={track.href}
                className="group block h-full rounded-xl p-6 transition-colors hover:bg-gray-50"
                style={{
                  background: "white",
                  border: "1px solid rgba(15,27,77,0.08)",
                }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ background: accent.soft, color: accent.color }}
                >
                  <Icon name={track.icon} size={20} />
                </div>

                <h3
                  className="mt-4 text-lg font-semibold"
                  style={{ color: C.krishnaBlue }}
                >
                  {track.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {track.description}
                </p>

                <ul className="mt-3 space-y-1">
                  {track.details.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 text-xs text-gray-700"
                    >
                      <span
                        className="mt-1.5 h-1 w-1 rounded-full shrink-0"
                        style={{ background: accent.color }}
                      />
                      {d}
                    </li>
                  ))}
                </ul>

                <span
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
                  style={{ color: accent.color }}
                >
                  Learn more
                  <Icon name="arrowRight" size={11} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  PastPrograms — horizontal scroller                                 */
/* ================================================================== */
function PastPrograms() {
  const past = RETREATS.filter((r) => r.status === "past");
  if (past.length === 0) return null;

  return (
    <section
      className="relative px-0 sm:px-8 py-12 sm:py-16"
      style={{ background: C.cream }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-0">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <span
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400"
            >
              From those who came before
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold"
              style={{ color: C.krishnaBlue }}
            >
              Past gatherings
            </h2>
          </div>
        </div>
      </div>

      <div className="snap-x snap-mandatory overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-5 sm:px-8 pb-2">
          {past.map((r) => (
            <article
              key={r.id}
              className="snap-start shrink-0 w-[280px] sm:w-[340px] rounded-xl p-5"
              style={{
                background: "white",
                border: "1px solid rgba(15,27,77,0.08)",
              }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400"
              >
                {r.dateLabel} · {r.location}
              </span>

              <h3
                className="mt-2 text-base font-semibold"
                style={{ color: C.krishnaBlue }}
              >
                {r.title}
              </h3>

              {r.quote && (
                <blockquote className="mt-3 text-sm leading-relaxed text-gray-600">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
              )}

              {r.quoteAuthor && (
                <p
                  className="mt-2 text-xs font-semibold"
                  style={{ color: C.gold }}
                >
                  — {r.quoteAuthor}
                </p>
              )}

              {r.pastHighlights && r.pastHighlights.length > 0 && (
                <ul
                  className="mt-4 pt-3 space-y-1 border-t"
                  style={{ borderColor: "rgba(15,27,77,0.08)" }}
                >
                  {r.pastHighlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-xs text-gray-600"
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  CTAStrip — "don't see your program?"                               */
/* ================================================================== */
function CTAStrip() {
  return (
    <section
      className="relative px-5 sm:px-8 py-12 sm:py-16"
      style={{ background: C.warmBg }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: C.lotusPink }}
        >
          Don&rsquo;t see your program?
        </span>
        <h2
          className="mt-2 text-2xl sm:text-3xl font-bold"
          style={{ color: C.krishnaBlue }}
        >
          Tell us what you&rsquo;d love to attend.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
          New to NYC? Want to host a class in your neighborhood? Want to help run the next festival?
          Drop us a line and we&rsquo;ll find a spot for you.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link
            href="/#get-connected"
            className="btn-primary-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
          >
            Get connected
            <Icon name="arrowRight" size={12} />
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors hover:bg-white"
            style={{
              color: C.krishnaBlue,
              border: "1px solid rgba(15,27,77,0.15)",
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
export default function ProgramsPage({ events }: ProgramsPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <PageHeader />
      <LumaEventsSection events={events} />
      <WhatToExpect />
      <PastPrograms />
      <CTAStrip />
      <ConnectFooter />
    </div>
  );
}
