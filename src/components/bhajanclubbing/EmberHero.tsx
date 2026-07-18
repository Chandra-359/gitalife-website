"use client";

/**
 * EmberHero — warm, atmospheric "Candlelit Kirtan" hero.
 *
 * Layers (back → front): deep umber gradient + grain → two static gold
 * candle pools (one breathing slowly) → string lights along the top →
 * content: eyebrow, Fraunces serif headline, tagline + one-line kirtan
 * definition (teach-first), meta chips, countdown pill, CTAs. Content
 * keeps a light parallax fade as the hero scrolls out.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Icon } from "@/components/home/icons";
import { EVENT, INTRO } from "@/data/bhajanClubbing";
import { StringLights } from "./FestivalBackdrop";
import HeroAmbientVideo from "./HeroAmbientVideo";

/* ------------------------------------------------------------------ */
/*  EmberField — floating sparks rising through the hero on mobile,    */
/*  where the ambient video doesn't run. Index-derived positions       */
/*  (no Math.random) so SSR and client agree.                          */
/* ------------------------------------------------------------------ */
const EMBER_COLORS = ["#EDD698", "#F2B95C", "#E8873C", "#C9A248"];

function EmberField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden md:hidden" aria-hidden>
      {Array.from({ length: 14 }, (_, i) => {
        const left = (i * 37 + 13) % 92;
        const top = 55 + ((i * 23) % 40);
        const size = 3 + (i % 4);
        const color = EMBER_COLORS[i % EMBER_COLORS.length];
        return (
          <span
            key={i}
            className="bc3-ember"
            style={
              {
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                background: color,
                boxShadow: `0 0 ${size * 2.5}px ${color}`,
                "--t": `${9 + (i % 6) * 1.6}s`,
                "--d": `${-(i * 1.9)}s`,
                "--x": i % 2 === 0 ? `${2 + (i % 3)}vw` : `-${2 + (i % 3)}vw`,
                "--o": i % 3 === 0 ? "0.85" : "0.55",
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Slim countdown pill (full countdown lives in the bento grid)       */
/* ------------------------------------------------------------------ */
function CountdownPill() {
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

  if (now === null) return <div className="mx-auto h-9 w-56 rounded-full" style={{ background: "rgba(251,245,230,0.05)" }} />;

  const start = new Date(EVENT.startIso).getTime();
  const end = new Date(EVENT.endIso).getTime();
  const live = now >= start && now <= end;
  if (now > end) return null;

  const diff = start - now;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);

  return (
    <span
      className="inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-[12px] font-bold uppercase tracking-[0.2em]"
      style={{
        background: "rgba(251,245,230,0.05)",
        border: "1px solid var(--bc3-line)",
        color: "var(--bc3-gold-hi)",
      }}
      role="timer"
    >
      <span className="relative inline-flex h-2 w-2">
        <span className="bc-glow-pulse absolute inline-flex h-full w-full rounded-full" style={{ background: "var(--bc3-saffron)" }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--bc3-saffron)" }} />
      </span>
      {live ? "Happening now — doors open" : d > 0 ? `${d}d · ${h}h · ${m}m to go` : `${h}h · ${m}m · ${s}s to go`}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
export default function EmberHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "34%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <header ref={ref} className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #100A05 0%, var(--bc3-bg) 45%, var(--bc3-bg-2) 100%)" }}>
      {/* ambient kirtan video (desktop) + sound toggle */}
      <HeroAmbientVideo />

      {/* grain */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--tex-grain-dark)", backgroundSize: "240px 240px", opacity: 0.45, mixBlendMode: "screen" }}
        aria-hidden
      />

      {/* candle pools — one breathing, one still */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <span
          className="bc3-glow bc3-breathe left-1/2 top-[18%] h-[560px] w-[860px] -translate-x-1/2"
          style={{ "--glow": "rgba(201,162,72,0.16)" } as React.CSSProperties}
        />
        <span
          className="bc3-glow bottom-[-18%] left-[16%] h-[520px] w-[680px]"
          style={{ "--glow": "rgba(217,105,26,0.1)" } as React.CSSProperties}
        />
      </div>

      {/* floating embers (mobile, where the video doesn't run) */}
      <EmberField />

      {/* string lights sealing the top */}
      <StringLights className="absolute inset-x-0 top-0 opacity-80" flags={false} />

      {/* content */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 pb-20 pt-28 text-center"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* eyebrow */}
          <p className="bc3-eyebrow">
            Gita Life NYC presents · {EVENT.volume}
          </p>

          {/* serif headline */}
          <h1 className="bc3-display mt-6 text-white" style={{ fontSize: "clamp(3rem, 10.5vw, 6.6rem)" }}>
            Bhajan <span className="bc3-headline-warm">Clubbing</span>
          </h1>

          {/* tagline + teach-first definition */}
          <p className="bc3-display mt-6 text-[19px] italic sm:text-[22px]" style={{ color: "var(--bc3-gold-hi)" }}>
            {EVENT.tagline}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed sm:text-[17px]" style={{ color: "var(--bc3-ink-dim)" }}>
            {INTRO.definition} This is that practice on a concert rig — a completely sober night that ends with free
            packed prasadam.
          </p>

          {/* meta chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {[
              { icon: "calendar" as const, label: "Sat · Aug 15 · 2026" },
              { icon: "sparkle" as const, label: EVENT.timeLabel },
              { icon: "mapPin" as const, label: EVENT.venue.name },
            ].map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold"
                style={{
                  background: "rgba(251,245,230,0.05)",
                  border: "1px solid rgba(251,245,230,0.14)",
                  color: "var(--bc3-ink)",
                }}
              >
                <Icon name={chip.icon} size={13} style={{ color: "var(--bc3-gold)" }} />
                {chip.label}
              </span>
            ))}
          </div>

          {/* countdown pill */}
          <div className="mt-7">
            <CountdownPill />
          </div>

          {/* CTAs */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <a href="#tickets" className="bc3-btn w-full rounded-full px-9 py-4 text-[14px] font-extrabold uppercase tracking-[0.08em] sm:w-auto">
              Get Tickets
            </a>
            <a href="#listen" className="bc3-btn-ghost w-full rounded-full px-8 py-4 text-[14px] font-semibold sm:w-auto">
              Hear the sound
            </a>
          </div>

          <p className="mt-6 text-[11.5px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--bc3-ink-faint)" }}>
            {EVENT.priceLabel} · 100% sattvic
          </p>
        </motion.div>

        {/* scroll cue */}
        <motion.a
          href="#vibe"
          className="absolute bottom-16 left-1/2 hidden -translate-x-1/2 sm:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          aria-label="Scroll to the what-is-kirtan section"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(251,245,230,0.5)" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.a>
      </motion.div>
    </header>
  );
}
