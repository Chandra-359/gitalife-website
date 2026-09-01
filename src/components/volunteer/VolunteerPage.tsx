"use client";

/**
 * VolunteerPage — the /volunteer experience, rebuilt around volunteer
 * DRIVES (src/data/volunteer.ts).
 *
 * Khadi-paper system, sibling to /festival:
 *   1. Indigo hero with a "now recruiting" thread to the active drive
 *   2. One section per drive — activity cards with dated shifts and an
 *      inline signup form (DriveSignup)
 *   3. The seva ladder — three commitment tiers beyond festival crews
 *   4. Why seva + closing CTA
 *
 * Drives and their live counts come from the server page; this
 * component is purely presentational.
 */

import Link from "next/link";
import Navbar from "@/components/Navbar";
import ConnectFooter from "@/components/home/ConnectFooter";
import { VOLUNTEER_LADDER, INSTAGRAM_URL, type VolunteerRung } from "@/data/home";
import { Icon, colorFor } from "@/components/home/icons";
import type { VolunteerDriveLive } from "@/lib/volunteer";
import DriveSignup from "./DriveSignup";

interface VolunteerPageProps {
  drives: VolunteerDriveLive[];
  /** Spam-guard token minted per render — echoed back on signup. */
  formToken: string | null;
}

/* ================================================================== */
/*  Hero                                                               */
/* ================================================================== */
function Hero({ active }: { active: VolunteerDriveLive | undefined }) {
  return (
    <section className="surface-sacred relative overflow-hidden px-5 pb-14 pt-28 sm:px-8 sm:pb-16 sm:pt-32">
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--divine-gold), var(--saffron), var(--divine-gold), transparent)",
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-5xl text-center">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.3em]"
          style={{ color: "var(--divine-gold-light)" }}
        >
          Seva &amp; Volunteering
        </p>
        <h1
          className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-[1.08] sm:text-5xl md:text-6xl"
          style={{ color: "var(--ink-onDark)", fontWeight: 600 }}
        >
          Don&rsquo;t just attend the festival.
          <br />
          Make it happen.
        </h1>
        <p
          className="mx-auto mt-5 max-w-xl text-sm leading-relaxed sm:text-[15px]"
          style={{ color: "var(--ink-muted-dark)" }}
        >
          Every garland, every plate of prasadam, every warm welcome at the door
          is someone&rsquo;s seva. Pick a crew and a shift below — no experience
          needed, someone will show you the ropes.
        </p>
        {active && (
          <a
            href={`#${active.id}`}
            className="mt-8 inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
            style={{
              background: "rgba(251,245,230,0.08)",
              border: "1px solid rgba(251,245,230,0.2)",
              color: "var(--ink-onDark)",
            }}
          >
            <span
              className="inline-block h-2 w-2 animate-pulse rounded-full"
              style={{ background: "var(--divine-gold-light)" }}
              aria-hidden
            />
            Now recruiting: {active.festival} · {active.datesLabel}
            <span aria-hidden>→</span>
          </a>
        )}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Drive section — header + DriveSignup                               */
/* ================================================================== */
function DriveHeader({ drive }: { drive: VolunteerDriveLive }) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <span
        className="inline-block rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
        style={{ background: "var(--divine-gold-deep)" }}
      >
        {drive.status === "closed" ? "This drive has wrapped" : "Festival seva crew"}
      </span>
      <h2
        className="mt-4 font-serif text-3xl leading-tight sm:text-4xl"
        style={{ color: "var(--ink-primary)", fontWeight: 600 }}
      >
        {drive.title}
      </h2>
      <p className="mt-2 text-[15px] font-semibold" style={{ color: "var(--divine-gold-deep)" }}>
        {drive.datesLabel} · {drive.venueName}
      </p>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
        {drive.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold" style={{ color: "var(--ink-tertiary)" }}>
        <a
          href={drive.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
        >
          <Icon name="mapPin" size={13} aria-hidden />
          {drive.address}
        </a>
        {drive.volunteerCount > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Icon name="handshake" size={13} aria-hidden />
            {drive.volunteerCount} volunteer{drive.volunteerCount === 1 ? "" : "s"} already on the crew
          </span>
        )}
      </div>
    </header>
  );
}

/* ================================================================== */
/*  Empty state (no drives configured/published)                       */
/* ================================================================== */
function EmptyState() {
  return (
    <div className="glass-card mx-auto max-w-xl rounded-3xl p-10 text-center">
      <p className="font-serif text-2xl" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
        The next seva drive is being planned
      </p>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
        Festival volunteer crews are announced here first. Follow us on
        Instagram or DM us and we&apos;ll let you know the moment signups open —
        or start smaller with the weekly seva options below.
      </p>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary-gradient mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white"
      >
        Follow @gitalifenyc
      </a>
    </div>
  );
}

/* ================================================================== */
/*  The seva ladder — beyond festival crews                            */
/* ================================================================== */
function RungCard({ rung }: { rung: VolunteerRung }) {
  const color = colorFor(rung.color);
  return (
    <div className="glass-card flex flex-col rounded-3xl p-6" style={{ borderTop: `4px solid ${color}` }}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-serif text-lg font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
          aria-hidden
        >
          {rung.tier}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color }}>
            Tier {rung.tier} · {rung.commitment}
          </p>
          <h3 className="font-serif text-lg leading-tight" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
            {rung.title}
          </h3>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
        {rung.description}
      </p>
      <ul className="mt-3 flex-1 space-y-1.5">
        {rung.examples.map((ex) => (
          <li key={ex} className="flex items-start gap-2 text-[12.5px]" style={{ color: "var(--ink-secondary)" }}>
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
            {ex}
          </li>
        ))}
      </ul>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center justify-center gap-2 self-start rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-transform hover:-translate-y-0.5"
        style={{ background: color }}
      >
        {rung.cta}
        <Icon name="arrowRight" size={12} aria-hidden />
      </a>
    </div>
  );
}

function Ladder() {
  return (
    <section className="surface-paper-warm px-5 py-14 sm:px-8 sm:py-16" style={{ borderTop: "1px solid var(--paper-edge)" }}>
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--ink-tertiary)" }}>
          Beyond festival crews
        </p>
        <h2 className="mt-2 text-center font-serif text-3xl" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
          Seva that fits your life
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
          Festival shifts are the easiest way in. When you&rsquo;re ready for
          more, there&rsquo;s a rung for every schedule — DM us and we&rsquo;ll
          connect you with that team.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {VOLUNTEER_LADDER.map((rung) => (
            <RungCard key={rung.tier} rung={rung} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Why seva                                                           */
/* ================================================================== */
const WHY = [
  {
    title: "It's how you become the community, not just visit it",
    body: "The people you meet at the festival are the same ones who cooked, decorated, and welcomed you in. Seva is the quickest way from guest to family.",
  },
  {
    title: "Scripture study without service stays abstract",
    body: "The Gita calls karma-yoga — action offered to Krishna — essential. A few hours of seva teaches what pages of theory can't.",
  },
  {
    title: "You don't need to know anything",
    body: "Show up with willingness. Every crew has someone who'll teach you the first time. No experience, no devotional background, no problem.",
  },
];

function WhySeva() {
  return (
    <section className="surface-paper-light px-5 py-14 sm:px-8 sm:py-16" style={{ borderTop: "1px solid var(--paper-edge)" }}>
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--ink-tertiary)" }}>
          Why seva
        </p>
        <h2 className="mt-2 text-center font-serif text-3xl" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
          Why we keep asking
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="glass-card rounded-3xl p-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, var(--divine-gold), var(--saffron))" }}
                aria-hidden
              >
                <Icon name="lotus" size={18} />
              </div>
              <h3 className="mt-4 font-serif text-[16px] leading-snug" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
                {w.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                {w.body}
              </p>
            </div>
          ))}
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
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-3xl text-white" style={{ fontWeight: 600 }}>
          Can&rsquo;t make these dates?
        </h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-muted-dark)" }}>
          DM @gitalifenyc on Instagram with how you&rsquo;d like to serve and
          we&rsquo;ll find a seva that fits — or just come by a program first
          and meet the family.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-gradient rounded-full px-6 py-3 text-sm font-bold text-white"
          >
            DM us on Instagram
          </a>
          <Link
            href="/programs"
            className="rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            style={{ border: "1px solid rgba(251,245,230,0.25)", color: "var(--ink-onDark)" }}
          >
            Or drop by a program
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Composed page                                                      */
/* ================================================================== */
export default function VolunteerPage({ drives, formToken }: VolunteerPageProps) {
  const active = drives.find((d) => d.status === "published");

  return (
    <div className="surface-paper min-h-screen">
      <Navbar />
      <Hero active={active} />

      <section className="surface-paper-light px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-16">
          {drives.length === 0 ? (
            <EmptyState />
          ) : (
            drives.map((drive) => (
              <div key={drive.id} id={drive.id} className="scroll-mt-24">
                <DriveHeader drive={drive} />
                <div className="mt-8">
                  <DriveSignup drive={drive} formToken={formToken} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Ladder />
      <WhySeva />
      <ClosingCta />
      <ConnectFooter testimonials={[]} />
    </div>
  );
}
