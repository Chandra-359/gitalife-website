"use client";

/**
 * RetreatPage — the /retreat/<slug> experience (invite-only link).
 *
 * Khadi-paper system, sibling to /festival and /volunteer:
 *   1. Indigo hero — poster beside the essentials (dates, venue, guest)
 *   2. What's included + pricing (student / working)
 *   3. Registration form with the Zelle payment card (RetreatRegisterForm)
 *
 * Everything comes from the server page; this component is presentational.
 */

import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Icon } from "@/components/home/icons";
import {
  OCCUPATIONS,
  formatUsd,
  retreatDatesLabel,
  retreatDatesShort,
  retreatMapsUrl,
} from "@/data/retreats";
import type { RetreatLive } from "@/lib/retreat";
import RetreatRegisterForm from "./RetreatRegisterForm";

interface RetreatPageProps {
  retreat: RetreatLive;
  /** Spam-guard token minted per render — echoed back on submit. */
  formToken: string | null;
}

/* ================================================================== */
/*  Hero                                                               */
/* ================================================================== */
function Hero({ retreat }: { retreat: RetreatLive }) {
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
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="order-2 md:order-1">
          <div
            className="mx-auto max-w-sm overflow-hidden rounded-3xl md:max-w-none"
            style={{ boxShadow: "0 30px 60px -30px rgba(0,0,0,0.6)", border: "1px solid rgba(251,245,230,0.18)" }}
          >
            <Image
              src={retreat.posterUrl}
              alt={`${retreat.title} poster`}
              width={1200}
              height={1600}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
        <div className="order-1 text-center md:order-2 md:text-left">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.3em]"
            style={{ color: "var(--divine-gold-light)" }}
          >
            Gita Life NYC invites you
          </p>
          <h1
            className="mt-4 font-serif text-4xl leading-[1.08] sm:text-5xl md:text-6xl"
            style={{ color: "var(--ink-onDark)", fontWeight: 600 }}
          >
            {retreat.shortTitle}
          </h1>
          <p className="mt-3 text-lg font-semibold sm:text-xl" style={{ color: "var(--divine-gold-light)" }}>
            {retreatDatesShort(retreat)} · {retreat.venueName}
          </p>
          <p
            className="mx-auto mt-5 max-w-xl text-sm leading-relaxed sm:text-[15px] md:mx-0"
            style={{ color: "var(--ink-muted-dark)" }}
          >
            {retreat.description}
          </p>

          <dl className="mt-7 grid gap-3 text-left sm:grid-cols-2">
            <Fact icon="calendar" label="When">
              {retreatDatesLabel(retreat)}
              <span className="block text-[12px] opacity-75">{retreat.timingNote}</span>
            </Fact>
            <Fact icon="mapPin" label="Where">
              {retreat.venueName}
              <a
                href={retreatMapsUrl(retreat)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[12px] underline-offset-2 hover:underline"
                style={{ color: "var(--divine-gold-light)" }}
              >
                {retreat.address}
              </a>
            </Fact>
            {retreat.specialGuest && (
              <Fact icon="lotus" label="Special guest">
                {retreat.specialGuest}
              </Fact>
            )}
            <Fact icon="gift" label="Contribution">
              {OCCUPATIONS.map((o, i) => (
                <span key={o}>
                  {i > 0 && " · "}
                  {o === "Student" ? "Students" : "Working"} {formatUsd(retreat.pricing[o])}
                </span>
              ))}
              <span className="block text-[12px] opacity-75">Paid via Zelle</span>
            </Fact>
          </dl>

          <a
            href="#register"
            className="btn-primary-gradient mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white"
          >
            {retreat.status === "closed" ? "Registration has closed" : "Register for the retreat"}
            <Icon name="arrowRight" size={13} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}

function Fact({
  icon,
  label,
  children,
}: {
  icon: "calendar" | "mapPin" | "lotus" | "gift";
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-4 py-3"
      style={{ background: "rgba(251,245,230,0.07)", border: "1px solid rgba(251,245,230,0.16)" }}
    >
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "rgba(201,162,72,0.18)", color: "var(--divine-gold-light)" }}
        aria-hidden
      >
        <Icon name={icon} size={15} />
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--divine-gold-light)" }}>
          {label}
        </dt>
        <dd className="mt-0.5 text-[13.5px] font-semibold leading-snug" style={{ color: "var(--ink-onDark)" }}>
          {children}
        </dd>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  What's included                                                    */
/* ================================================================== */
const INCLUDED: { icon: "handshake" | "sparkle" | "food" | "music"; title: string; body: string }[] = [
  {
    icon: "handshake",
    title: "Association",
    body: "A whole weekend with devotees and seekers — the conversations that don't fit into a Monday evening.",
  },
  {
    icon: "sparkle",
    title: "Drama",
    body: "Stories from the scriptures brought to life on stage — and yes, you might end up in the cast.",
  },
  {
    icon: "food",
    title: "Prasadam",
    body: "Every meal home-cooked and offered — breakfast, lunch, dinner, and the snacks in between.",
  },
  {
    icon: "music",
    title: "Kirtan",
    body: "Morning to night, from the temple room to the fields. The best kirtans of the year happen here.",
  },
];

function Included({ retreat }: { retreat: RetreatLive }) {
  return (
    <section className="surface-paper-light px-5 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--ink-tertiary)" }}>
          What the weekend holds
        </p>
        <h2 className="mt-2 text-center font-serif text-3xl" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
          {retreat.tagline}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map((item) => (
            <div key={item.title} className="glass-card rounded-3xl p-6" style={{ borderTop: "4px solid var(--divine-gold)" }}>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, var(--divine-gold), var(--saffron))" }}
                aria-hidden
              >
                <Icon name={item.icon} size={18} />
              </div>
              <h3 className="mt-4 font-serif text-[18px] leading-snug" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {OCCUPATIONS.map((o) => (
            <div
              key={o}
              className="glass-card flex items-center justify-between gap-4 rounded-2xl px-6 py-5"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--ink-tertiary)" }}>
                  {o === "Student" ? "Students" : "Working professionals"}
                </p>
                <p className="mt-1 text-[13px]" style={{ color: "var(--ink-secondary)" }}>
                  Covers the whole weekend — stay, every meal, everything.
                </p>
              </div>
              <p className="font-serif text-3xl" style={{ color: "var(--divine-gold-deep)", fontWeight: 600 }}>
                {formatUsd(retreat.pricing[o])}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[12.5px]" style={{ color: "var(--ink-tertiary)" }}>
          Payment by Zelle — details are in the form below and in your confirmation email.
        </p>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Register                                                           */
/* ================================================================== */
function Register({ retreat, formToken }: RetreatPageProps) {
  return (
    <section id="register" className="surface-paper-warm scroll-mt-24 px-5 py-14 sm:px-8 sm:py-20" style={{ borderTop: "1px solid var(--paper-edge)" }}>
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <span
            className="inline-block rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
            style={{ background: "var(--divine-gold-deep)" }}
          >
            {retreat.status === "closed" ? "Registration closed" : "Registration"}
          </span>
          <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
            Save your spot
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
            Fill in your details, send your contribution by Zelle, and you&rsquo;re set.
            You&rsquo;ll get a confirmation email right away, a reminder the day before,
            and one on the morning of the retreat.
          </p>
        </header>
        <div className="glass-card mt-8 rounded-3xl p-6 sm:p-8" style={{ borderTop: "4px solid var(--divine-gold)" }}>
          <RetreatRegisterForm retreat={retreat} formToken={formToken} />
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Composed page                                                      */
/* ================================================================== */
export default function RetreatPage({ retreat, formToken }: RetreatPageProps) {
  return (
    <div className="surface-paper min-h-screen">
      <Navbar />
      <Hero retreat={retreat} />
      <Included retreat={retreat} />
      <Register retreat={retreat} formToken={formToken} />
      <footer className="surface-sacred px-5 py-10 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--ink-muted-dark)" }}>
          Gita Life NYC · A community initiative under ISKCON
        </p>
        <p className="mt-2 text-[12.5px]" style={{ color: "var(--ink-muted-dark)" }}>
          Questions?{" "}
          <a href={`mailto:${retreat.contactEmail}`} className="font-semibold underline-offset-2 hover:underline" style={{ color: "var(--divine-gold-light)" }}>
            {retreat.contactEmail}
          </a>
        </p>
      </footer>
    </div>
  );
}
