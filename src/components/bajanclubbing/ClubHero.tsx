"use client";

/**
 * ClubHero — full-bleed midnight hero for the Bhajan Clubbing page.
 *
 * Layers (back to front):
 *   1. surface-midnight (indigo + paper grain, from the design system)
 *   2. drifting "club light" glow orbs (saffron / lotus / peacock)
 *   3. slow-rotating disco-chakra sunburst
 *   4. content: eyebrow → display title → meta → countdown → CTAs
 *   5. marquee ticker sealing the bottom edge
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { C, Icon } from "@/components/home/icons";
import { EVENT } from "@/data/bajanClubbing";

/* ------------------------------------------------------------------ */
/*  Countdown — dark-styled, SSR-safe (renders placeholder pre-mount)  */
/* ------------------------------------------------------------------ */
function ClubCountdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  if (now === null) {
    return <div className="h-[74px] w-full max-w-sm mx-auto rounded-2xl" style={{ background: "rgba(251,245,230,0.05)" }} />;
  }

  const start = new Date(EVENT.startIso).getTime();
  const end = new Date(EVENT.endIso).getTime();

  if (now >= start && now <= end) {
    return (
      <span
        className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.2em]"
        style={{
          background: "rgba(217,105,26,0.14)",
          border: `1px solid ${C.saffron}55`,
          color: C.goldLight,
        }}
      >
        <span className="relative inline-flex h-2.5 w-2.5">
          <span className="bc-glow-pulse absolute inline-flex h-full w-full rounded-full" style={{ background: C.saffron }} />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: C.saffron }} />
        </span>
        Happening now — doors are open
      </span>
    );
  }

  if (now > end) {
    return (
      <span
        className="inline-flex items-center rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.2em]"
        style={{ background: "rgba(251,245,230,0.06)", border: "1px solid rgba(251,245,230,0.18)", color: "rgba(251,245,230,0.7)" }}
      >
        Vol. 01 has wrapped — Vol. 02 announcing soon
      </span>
    );
  }

  const diff = start - now;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);

  const segs = [
    { value: d, label: "days" },
    { value: h, label: "hrs" },
    { value: m, label: "min" },
    { value: s, label: "sec" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" role="timer" aria-label="Countdown to Bhajan Clubbing">
      {segs.map((seg) => (
        <div
          key={seg.label}
          className="min-w-[64px] rounded-2xl px-3 py-2.5 text-center"
          style={{
            background: "rgba(251,245,230,0.055)",
            border: "1px solid rgba(201,162,72,0.28)",
            boxShadow: "inset 0 1px 0 rgba(251,245,230,0.06)",
          }}
        >
          <div
            className="font-serif text-[26px] font-bold leading-none tabular-nums"
            style={{ color: C.goldLight, fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            {String(seg.value).padStart(2, "0")}
          </div>
          <div className="mt-1.5 text-[9.5px] font-bold uppercase tracking-[0.22em]" style={{ color: "rgba(251,245,230,0.45)" }}>
            {seg.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Disco chakra — sunburst mandala that doubles as mirror-ball rays   */
/* ------------------------------------------------------------------ */
function DiscoChakra() {
  const rays = Array.from({ length: 36 }, (_, i) => i * 10);
  return (
    <svg
      viewBox="0 0 400 400"
      className="bc-spin-slow absolute left-1/2 top-[46%] h-[135vw] max-h-[860px] w-[135vw] max-w-[860px] -translate-x-1/2 -translate-y-1/2"
      style={{ opacity: 0.14 }}
      aria-hidden
    >
      <g stroke={C.goldLight} fill="none">
        {rays.map((deg, i) => (
          <line
            key={deg}
            x1="200"
            y1={i % 2 === 0 ? 30 : 58}
            x2="200"
            y2={i % 3 === 0 ? 86 : 96}
            strokeWidth={i % 2 === 0 ? 1.4 : 0.8}
            transform={`rotate(${deg} 200 200)`}
          />
        ))}
        <circle cx="200" cy="200" r="104" strokeWidth="0.8" strokeDasharray="2 7" />
        <circle cx="200" cy="200" r="126" strokeWidth="0.6" opacity="0.7" />
        <circle cx="200" cy="200" r="170" strokeWidth="0.5" strokeDasharray="1 11" opacity="0.6" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Equalizer — sound-wave motif under the meta row                    */
/* ------------------------------------------------------------------ */
const EQ_BARS = [
  { h: "42%", d: "0s", c: C.gold },
  { h: "68%", d: "0.12s", c: C.saffron },
  { h: "95%", d: "0.24s", c: C.goldLight },
  { h: "58%", d: "0.36s", c: C.lotusPink },
  { h: "88%", d: "0.1s", c: C.saffron },
  { h: "48%", d: "0.3s", c: C.gold },
  { h: "76%", d: "0.18s", c: C.peacockLight },
  { h: "100%", d: "0.05s", c: C.goldLight },
  { h: "62%", d: "0.28s", c: C.saffron },
  { h: "40%", d: "0.4s", c: C.gold },
];

function Equalizer() {
  return (
    <span className="bc-eq" aria-hidden>
      {EQ_BARS.map((b, i) => (
        <span key={i} style={{ "--h": b.h, "--d": b.d, background: b.c } as React.CSSProperties} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Marquee ticker                                                     */
/* ------------------------------------------------------------------ */
const TICKER = [
  "Live kirtan",
  "Mantra-house DJ",
  "Chai + mocktail bar",
  "Smoke + lasers",
  "Midnight prasadam",
  "100% alcohol-free",
  "All ages",
];

function TickerStrip({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex items-center" aria-hidden={ariaHidden}>
      {TICKER.map((item) => (
        <span key={item} className="flex items-center">
          <span
            className="whitespace-nowrap px-5 text-[12px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "rgba(251,245,230,0.72)" }}
          >
            {item}
          </span>
          <span style={{ color: C.saffron }} aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
export default function ClubHero() {
  return (
    <header className="surface-midnight relative overflow-hidden">
      {/* Laser hairline along the top, under the navbar */}
      <div
        className="absolute left-0 right-0 top-0 z-10 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.saffron}, ${C.lotusPink}, ${C.gold}, transparent)` }}
      />

      {/* Club-light glow orbs */}
      <div
        className="bc-drift-a absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.saffron}38, transparent 65%)`, filter: "blur(40px)" }}
        aria-hidden
      />
      <div
        className="bc-drift-b absolute -right-32 top-40 h-[480px] w-[480px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.lotusPink}30, transparent 65%)`, filter: "blur(48px)" }}
        aria-hidden
      />
      <div
        className="bc-drift-a absolute -bottom-40 left-1/4 h-[460px] w-[460px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.peacockLight}26, transparent 65%)`, filter: "blur(52px)", animationDelay: "-7s" }}
        aria-hidden
      />

      <DiscoChakra />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-32 text-center sm:pt-36">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          {/* Eyebrow */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em]"
            style={{
              background: "rgba(201,162,72,0.1)",
              border: `1px solid ${C.gold}3d`,
              color: C.goldLight,
            }}
          >
            <Icon name="sparkle" size={12} />
            <span className="whitespace-nowrap">After Dark · {EVENT.volume}</span>
          </span>

          {/* Title */}
          <h1
            className="mx-auto mt-7 leading-[0.98] text-white"
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: 700,
              fontSize: "clamp(3rem, 12vw, 6.5rem)",
              letterSpacing: "-0.03em",
              textShadow: `0 0 80px ${C.saffron}66, 0 0 26px ${C.gold}33`,
            }}
          >
            Bhajan
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>
            <em style={{ color: C.goldLight, fontStyle: "italic" }}>Clubbing</em>
          </h1>

          {/* Tagline */}
          <p
            className="mx-auto mt-5 text-[17px] sm:text-[19px]"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontStyle: "italic", color: "rgba(251,245,230,0.85)" }}
          >
            {EVENT.tagline} The city&rsquo;s most blissful night out.
          </p>

          {/* Meta row */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[14px]" style={{ color: "rgba(251,245,230,0.8)" }}>
            <span className="flex items-center gap-2">
              <Icon name="calendar" size={15} style={{ color: C.goldLight }} />
              {EVENT.dateLabel}
            </span>
            <span className="hidden sm:inline" style={{ color: "rgba(251,245,230,0.25)" }}>
              ·
            </span>
            <span>{EVENT.timeLabel}</span>
            <span className="hidden sm:inline" style={{ color: "rgba(251,245,230,0.25)" }}>
              ·
            </span>
            <span className="flex items-center gap-2">
              <Icon name="mapPin" size={15} style={{ color: C.goldLight }} />
              {EVENT.venue.name}
            </span>
          </div>

          {/* Equalizer flourish */}
          <div className="mt-7 flex items-center justify-center gap-4">
            <span className="h-px w-14" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}66)` }} aria-hidden />
            <Equalizer />
            <span className="h-px w-14" style={{ background: `linear-gradient(90deg, ${C.gold}66, transparent)` }} aria-hidden />
          </div>

          {/* Countdown */}
          <div className="mt-8">
            <ClubCountdown />
          </div>

          {/* CTAs */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <a
              href="#register"
              className="btn-primary-gradient w-full rounded-full px-8 py-4 text-[15px] font-bold text-white sm:w-auto"
            >
              Claim your free pass
            </a>
            <a href="#lineup" className="btn-ghost-light w-full rounded-full px-8 py-4 text-[15px] font-semibold sm:w-auto">
              See the lineup
            </a>
          </div>

          <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(251,245,230,0.5)" }}>
            {EVENT.priceLabel} · {EVENT.capacity} spots · midnight feast included
          </p>
        </motion.div>
      </div>

      {/* Marquee ticker */}
      <div
        className="relative z-10 overflow-hidden py-3.5"
        style={{
          borderTop: `1px solid rgba(201,162,72,0.22)`,
          borderBottom: `1px solid rgba(201,162,72,0.22)`,
          background: "rgba(8,14,42,0.55)",
        }}
      >
        <div className="bc-marquee-track">
          <TickerStrip />
          <TickerStrip ariaHidden />
        </div>
      </div>
    </header>
  );
}
