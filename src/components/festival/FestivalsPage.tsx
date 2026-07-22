"use client";

/**
 * FestivalsPage — the redesigned /festival experience.
 *
 * Poster-led event cards on the khadi-paper system, sibling to the
 * /programs "chapters" page but with its own festival identity:
 *   1. Indigo hero with the gold festival thread
 *   2. Upcoming events — one full card each (poster, details, inline
 *      registration). Youth Festival = lotus, festivals = gold,
 *      volunteering crews = peacock.
 *   3. Photo wall from past gatherings
 *   4. FAQ + closing CTA
 *
 * Events come from the database (created in /admin/festivals); this
 * component is purely presentational.
 */

import Link from "next/link";
import Navbar from "@/components/Navbar";
import ConnectFooter from "@/components/home/ConnectFooter";
import { INSTAGRAM_URL } from "@/data/home";
import type { FestivalEventLive } from "@/data/festivals";
import EventRegisterForm from "./EventRegisterForm";

interface FestivalsPageProps {
  upcoming: FestivalEventLive[];
  past: FestivalEventLive[];
}

/* ================================================================== */
/*  Hero                                                               */
/* ================================================================== */
function Hero({ next }: { next: FestivalEventLive | undefined }) {
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
          Festivals &amp; Gatherings
        </p>
        <h1
          className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-[1.08] sm:text-5xl md:text-6xl"
          style={{ color: "var(--ink-onDark)", fontWeight: 600 }}
        >
          The big nights.
          <br />
          The whole family.
        </h1>
        <p
          className="mx-auto mt-5 max-w-xl text-sm leading-relaxed sm:text-[15px]"
          style={{ color: "var(--ink-muted-dark)" }}
        >
          Monthly Youth Festivals, Ratha Yatra, Janmashtami, and the volunteer
          crews that make them happen. Save your spot below — every gathering is
          free, and prasadam is always part of the plan.
        </p>
        {next && (
          <a
            href={`#${next.id}`}
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
            Up next: {next.title} · {next.dateLabel}
            <span aria-hidden>→</span>
          </a>
        )}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Event card                                                         */
/* ================================================================== */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 py-2.5"
      style={{ borderBottom: "1px solid rgba(21,34,79,0.1)" }}
    >
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

function EventCard({ event, flip }: { event: FestivalEventLive; flip: boolean }) {
  const volunteering = event.category === "Volunteering";
  return (
    <article
      id={event.id}
      className="glass-card scroll-mt-24 overflow-hidden rounded-3xl"
      style={{ borderTop: `4px solid ${event.accent}` }}
    >
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${flip ? "lg:[direction:rtl]" : ""}`}>
        {/* ----- Poster / visual ----- */}
        <div className="relative min-h-[260px] lg:min-h-full lg:[direction:ltr]">
          {event.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.posterUrl}
              alt={`${event.title} poster`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(150deg, ${event.accent}22 0%, ${event.accent}08 60%), var(--krishna-blue-deep)`,
              }}
            >
              <span
                className="px-6 text-center font-serif text-3xl leading-snug"
                style={{ color: "var(--ink-onDark)", fontWeight: 600 }}
              >
                {event.title}
              </span>
            </div>
          )}
          <span
            className="absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
            style={{ background: event.accent }}
          >
            {volunteering ? "Volunteer crew" : event.category}
          </span>
        </div>

        {/* ----- Details + registration ----- */}
        <div className="p-6 sm:p-8 lg:[direction:ltr]">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: event.accent }}>
            {event.dateLabel}
          </p>
          <h3
            className="mt-2 font-serif text-2xl leading-tight sm:text-3xl"
            style={{ color: "var(--ink-primary)", fontWeight: 600 }}
          >
            {event.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
            {event.description}
          </p>

          {event.highlights.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {event.highlights.map((h) => (
                <li
                  key={h}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold"
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
          )}

          <dl className="mb-5 mt-4">
            <DetailRow label="Time" value={event.timeLabel} />
            <DetailRow label="Venue" value={event.venueName} />
            {event.address && <DetailRow label="Address" value={event.address} />}
          </dl>

          <EventRegisterForm
            eventId={event.id}
            eventTitle={event.title}
            accent={event.accent}
            dateLabel={event.dateLabel}
            spotsLeft={event.spotsLeft}
            volunteering={volunteering}
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold underline-offset-2 hover:underline"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Open in Maps
            </a>
            {event.videoUrl && (
              <a
                href={event.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-[0.12em] hover:underline"
                style={{ color: event.accent }}
              >
                ▶ Last time&apos;s highlights
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ================================================================== */
/*  Empty state                                                        */
/* ================================================================== */
function EmptyState() {
  return (
    <div className="glass-card mx-auto max-w-xl rounded-3xl p-10 text-center">
      <p className="font-serif text-2xl" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
        The next gathering is being planned
      </p>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
        New festivals and volunteer opportunities are announced here first. Follow
        us on Instagram or get connected and we&apos;ll let you know the moment
        registration opens.
      </p>
      <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary-gradient inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white"
        >
          Follow @gitalifenyc
        </a>
        <Link
          href="/#get-connected"
          className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
          style={{ color: "var(--ink-primary)", border: "1px solid rgba(21,34,79,0.18)" }}
        >
          Get connected
        </Link>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Past gatherings photo wall                                         */
/* ================================================================== */
function PastWall({ past }: { past: FestivalEventLive[] }) {
  const photos = past.flatMap((e) =>
    (e.galleryUrls.length ? e.galleryUrls : e.posterUrl ? [e.posterUrl] : []).map((url) => ({
      url,
      title: e.title,
    })),
  );
  if (photos.length === 0) return null;

  return (
    <section className="surface-paper-warm px-5 py-14 sm:px-8 sm:py-16" style={{ borderTop: "1px solid var(--paper-edge)" }}>
      <div className="mx-auto max-w-6xl">
        <p
          className="text-center text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--ink-tertiary)" }}
        >
          From gatherings past
        </p>
        <h2
          className="mt-2 text-center font-serif text-3xl"
          style={{ color: "var(--ink-primary)", fontWeight: 600 }}
        >
          You had to be there. Next time, be there.
        </h2>
        <div className="scrollbar-hide -mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
          {photos.slice(0, 12).map((photo, i) => (
            <figure key={`${photo.url}-${i}`} className="shrink-0 snap-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.title}
                loading="lazy"
                className="h-52 w-72 rounded-2xl object-cover sm:h-60 sm:w-80"
                style={{ border: "1px solid rgba(21,34,79,0.14)" }}
              />
              <figcaption className="mt-2 text-xs font-semibold" style={{ color: "var(--ink-tertiary)" }}>
                {photo.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  FAQ                                                                */
/* ================================================================== */
const FAQS = [
  {
    q: "Is it free?",
    a: "Yes — completely free. We serve a full prasadam dinner too.",
  },
  {
    q: "Do I need to know anything about the Gita?",
    a: "Not at all. Come as you are. Whether it's your first time or your fiftieth, you'll feel at home.",
  },
  {
    q: "What should I wear?",
    a: "Comfortable clothes you can sit on the floor in. Modest dress is appreciated out of respect for the temple.",
  },
  {
    q: "Can I bring a friend?",
    a: "Please do! Just include them in your party size so we can plan prasadam. There's no limit.",
  },
];

function Faq() {
  return (
    <section className="surface-paper-light px-5 py-14 sm:px-8 sm:py-16" style={{ borderTop: "1px solid var(--paper-edge)" }}>
      <div className="mx-auto max-w-3xl">
        <h2
          className="text-center font-serif text-3xl"
          style={{ color: "var(--ink-primary)", fontWeight: 600 }}
        >
          Good questions, quick answers
        </h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="glass-card group rounded-2xl px-5 py-4"
            >
              <summary
                className="cursor-pointer list-none text-[15px] font-bold marker:content-none"
                style={{ color: "var(--ink-primary)" }}
              >
                <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden>
                  ›
                </span>
                {f.q}
              </summary>
              <p className="mt-2 pl-5 text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Composed page                                                      */
/* ================================================================== */
export default function FestivalsPage({ upcoming, past }: FestivalsPageProps) {
  return (
    <div className="surface-paper min-h-screen">
      <Navbar />
      <Hero next={upcoming[0]} />

      <section className="surface-paper-light px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-10">
          {upcoming.length === 0 ? (
            <EmptyState />
          ) : (
            upcoming.map((event, i) => <EventCard key={event.id} event={event} flip={i % 2 === 1} />)
          )}
        </div>
      </section>

      <PastWall past={past} />
      <Faq />
      <ConnectFooter testimonials={[]} />
    </div>
  );
}
