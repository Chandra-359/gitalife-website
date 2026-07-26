"use client";

/**
 * WeeklyProgramsPage — the redesigned /programs experience.
 *
 * Editorial "three chapters" layout on the site's khadi-paper system:
 *   1. Indigo manuscript hero with three ticket-stub jump cards
 *   2. "How it works" strip (register once → invite → weekly reminders)
 *   3. One full chapter per program — Devanagari numeral watermark,
 *      accent rule, this-week topic & poster, photo filmstrip, and an
 *      inline registration card
 *   4. Closing CTA + shared footer
 *
 * Visual language is derived from the existing site (globals.css):
 * Fraunces serif display, Inter body, saffron/gold/krishna accents,
 * cream glass-cards over the fixed paper backdrop.
 */

import Link from "next/link";
import type { Program } from "@/data/programs";
import type { WeeklyProgramLive } from "@/lib/weeklyPrograms";
import { INSTAGRAM_URL } from "@/data/home";
import Navbar from "@/components/Navbar";
import ConnectFooter from "@/components/home/ConnectFooter";
import ProgramRegisterForm from "./ProgramRegisterForm";

export type WeeklyProgramView = WeeklyProgramLive & { nextLabel: string };

interface WeeklyProgramsPageProps {
  programs: WeeklyProgramView[];
  testimonials: Program[];
}

/* ================================================================== */
/*  Hero — indigo manuscript with ticket-stub jump cards               */
/* ================================================================== */
function Hero({ programs }: { programs: WeeklyProgramView[] }) {
  return (
    <section className="surface-sacred relative overflow-hidden px-5 pb-14 pt-28 sm:px-8 sm:pb-16 sm:pt-32">
      <div className="mx-auto max-w-5xl">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.3em]"
          style={{ color: "var(--divine-gold-light)" }}
        >
          Weekly programs · Register once, come always
        </p>
        <h1
          className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] sm:text-5xl md:text-6xl"
          style={{ color: "var(--ink-onDark)", fontWeight: 600 }}
        >
          Three neighborhoods.
          <br />
          One timeless conversation.
        </h1>
        <p
          className="mt-5 max-w-xl text-sm leading-relaxed sm:text-[15px]"
          style={{ color: "var(--ink-muted-dark)" }}
        >
          Every week, the Bhagavad Gita comes alive in Newport, Jersey City, and
          Brooklyn — kirtan, honest discussion, and a hot prasadam meal. Register
          once and your seat is saved for every single week. Free, open to all.
        </p>

        {/* Ticket-stub jump cards */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {programs.map((p) => (
            <a
              key={p.id}
              href={`#${p.slug}`}
              className="group relative overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
              style={{
                background: "rgba(251,245,230,0.06)",
                border: "1px solid rgba(251,245,230,0.16)",
              }}
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accentSoft})` }}
                aria-hidden
              />
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: p.accentSoft }}
              >
                {p.dayOfWeek}s · {p.area}
              </p>
              <p
                className="mt-2 font-serif text-xl"
                style={{ color: "var(--ink-onDark)", fontWeight: 600 }}
              >
                {p.name}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--ink-dim-dark)" }}>
                {p.timeLabel}
              </p>
              <p
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-transform group-hover:translate-x-0.5"
                style={{ color: "var(--divine-gold-light)" }}
              >
                Reserve your seat <span aria-hidden>→</span>
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  How it works — the one-and-done promise                            */
/* ================================================================== */
const STEPS = [
  {
    n: "01",
    title: "Register once",
    body: "Thirty seconds, no account, no tickets. Your name goes on the list for good.",
  },
  {
    n: "02",
    title: "Get your invite",
    body: "A recurring calendar invite lands in your inbox from no-reply@gitalifenyc.com.",
  },
  {
    n: "03",
    title: "A nudge each week",
    body: "The day before class we send that week's topic and speaker. One click to unsubscribe.",
  },
  {
    n: "04",
    title: "Just show up",
    body: "Say your name at the door — you're checked in. Prasadam is always included.",
  },
];

function HowItWorks() {
  return (
    <section className="surface-paper-light px-5 py-12 sm:px-8 sm:py-16" style={{ borderBottom: "1px solid var(--paper-edge)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="relative pl-5">
              <span
                className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-[3px] rounded-full"
                style={{ background: "var(--divine-gold)" }}
                aria-hidden
              />
              <p
                className="font-serif text-sm"
                style={{ color: "var(--divine-gold-deep)", fontWeight: 600 }}
              >
                {s.n}
              </p>
              <h3 className="mt-1 text-[15px] font-bold" style={{ color: "var(--ink-primary)" }}>
                {s.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Chapter — one program, full editorial treatment                    */
/* ================================================================== */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid rgba(21,34,79,0.1)" }}>
      <dt
        className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: "var(--ink-tertiary)" }}
      >
        {label}
      </dt>
      <dd className="text-right text-[13px] font-semibold" style={{ color: "var(--ink-primary)" }}>
        {value}
      </dd>
    </div>
  );
}

function ThisWeekCard({ p }: { p: WeeklyProgramView }) {
  if (!p.lectureTopic && !p.posterUrl) return null;
  return (
    <div
      className="mt-6 overflow-hidden rounded-2xl"
      style={{ border: `1.5px solid ${p.accent}45`, background: "rgba(255,255,255,0.5)" }}
    >
      {p.posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.posterUrl}
          alt={`${p.title} — this week's poster`}
          className="max-h-96 w-full object-cover"
        />
      )}
      <div className="p-5">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.22em]"
          style={{ color: p.accent }}
        >
          This week&apos;s session
        </p>
        {p.lectureTopic && (
          <p className="mt-2 font-serif text-xl leading-snug" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
            “{p.lectureTopic}”
          </p>
        )}
        {p.gitaReference && (
          <p className="mt-1 text-xs" style={{ color: "var(--ink-tertiary)" }}>
            {p.gitaReference}
          </p>
        )}
        {p.speakerName && (
          <p className="mt-2 text-[13px]" style={{ color: "var(--ink-secondary)" }}>
            with <strong style={{ color: "var(--ink-primary)" }}>{p.speakerName}</strong>
            {p.speakerTitle ? ` · ${p.speakerTitle}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function GalleryStrip({ p }: { p: WeeklyProgramView }) {
  if (p.galleryUrls.length === 0 && !p.videoUrl) return null;
  return (
    <div className="mt-6">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: "var(--ink-tertiary)" }}
      >
        From recent weeks
      </p>
      {p.galleryUrls.length > 0 && (
        <div className="scrollbar-hide -mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
          {p.galleryUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={`${p.name} program — photo ${i + 1}`}
              loading="lazy"
              className="h-36 w-52 shrink-0 snap-start rounded-xl object-cover sm:h-40 sm:w-60"
              style={{ border: "1px solid rgba(21,34,79,0.12)" }}
            />
          ))}
        </div>
      )}
      {p.videoUrl && (
        <a
          href={p.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] hover:underline"
          style={{ color: p.accent }}
        >
          ▶ Watch highlights
        </a>
      )}
    </div>
  );
}

function Chapter({ p, index }: { p: WeeklyProgramView; index: number }) {
  const flip = index % 2 === 1;
  return (
    <section
      id={p.slug}
      className={`relative scroll-mt-24 overflow-hidden px-5 py-14 sm:px-8 sm:py-20 ${flip ? "surface-paper-warm" : "surface-paper-light"}`}
      style={{ borderBottom: "1px solid var(--paper-edge)" }}
    >
      {/* Watermark numeral */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-6 select-none font-serif leading-none"
        style={{
          [flip ? "left" : "right"]: "-0.05em",
          fontSize: "clamp(14rem, 28vw, 24rem)",
          color: `${p.accent}12`,
          fontWeight: 600,
        }}
      >
        {p.chapterMark}
      </span>

      <div className="relative mx-auto max-w-6xl">
        <div className={`grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 ${flip ? "lg:[direction:rtl]" : ""}`}>
          {/* ----- Story column ----- */}
          <div className="lg:[direction:ltr]">
            <div className="flex items-center gap-3">
              <span
                className="pill-chip"
                style={{
                  background: `${p.accent}14`,
                  border: `1px solid ${p.accent}45`,
                  color: p.accent,
                }}
              >
                {p.dayOfWeek}s · {p.timeLabel.split("–")[0].trim()}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--ink-tertiary)" }}>
                {p.area}
              </span>
            </div>

            <h2
              className="mt-4 font-serif text-3xl leading-tight sm:text-4xl"
              style={{ color: "var(--ink-primary)", fontWeight: 600 }}
            >
              {p.title}
            </h2>
            <p className="mt-2 text-[15px] font-medium" style={{ color: p.accent }}>
              {p.tagline}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed sm:text-[15px]" style={{ color: "var(--ink-secondary)" }}>
              {p.description}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {p.highlights.map((h) => (
                <li
                  key={h}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(21,34,79,0.12)",
                    color: "var(--ink-primary)",
                  }}
                >
                  {h}
                </li>
              ))}
            </ul>

            <ThisWeekCard p={p} />
            <GalleryStrip p={p} />
          </div>

          {/* ----- Registration column ----- */}
          <div className="lg:[direction:ltr]">
            <div className="glass-card rounded-2xl p-6 sm:p-7 lg:sticky lg:top-24">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: p.accent }}
              >
                Save your seat — free
              </p>
              <h3 className="mt-1.5 font-serif text-2xl" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
                Join us {p.dayOfWeek.toLowerCase()}
              </h3>

              <dl className="mt-4 mb-5">
                <DetailRow label="Next class" value={p.nextLabel} />
                <DetailRow label="Time" value={p.timeLabel} />
                <DetailRow label="Venue" value={p.venueName} />
                <DetailRow label="Getting there" value={p.transit} />
              </dl>

              <ProgramRegisterForm
                programId={p.id}
                programName={p.title}
                dayOfWeek={p.dayOfWeek}
                accent={p.accent}
              />

              <a
                href={p.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center text-xs font-semibold underline-offset-2 hover:underline"
                style={{ color: "var(--ink-tertiary)" }}
              >
                {p.address} — open in Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Closing CTA                                                        */
/* ================================================================== */
function ClosingCta() {
  return (
    <section className="surface-sacred px-5 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.3em]"
          style={{ color: "var(--divine-gold-light)" }}
        >
          Not sure which night is yours?
        </p>
        <h2
          className="mt-3 font-serif text-3xl sm:text-4xl"
          style={{ color: "var(--ink-onDark)", fontWeight: 600 }}
        >
          Come once. The kirtan does the rest.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed" style={{ color: "var(--ink-muted-dark)" }}>
          Every program is free and beginner-friendly — no background in the Gita
          needed. Bring a friend, or come solo and leave with several.
        </p>
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/#get-connected"
            className="btn-primary-gradient inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-bold text-white"
          >
            Get connected
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost-light inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
          >
            Follow @gitalifenyc
          </a>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Composed page                                                      */
/* ================================================================== */
export default function WeeklyProgramsPage({ programs, testimonials }: WeeklyProgramsPageProps) {
  return (
    <div className="surface-paper min-h-screen">
      <Navbar />
      <Hero programs={programs} />
      <HowItWorks />
      {programs.map((p, i) => (
        <Chapter key={p.id} p={p} index={i} />
      ))}
      <ClosingCta />
      <ConnectFooter testimonials={testimonials} />
    </div>
  );
}
