"use client";

/**
 * NeonHero — full-screen "Transcendental Neon" hero.
 *
 * Layers (back → front): deep purple gradient + grain → parallax aurora
 * blobs (saffron / electric blue / violet) → rotating light-rig beam
 * wheel → content (eyebrow, massive Unbounded headline, meta chips,
 * glowing Get Tickets CTA) → marquee ticker on the bottom edge.
 * Parallax is framer-motion useScroll/useTransform (no extra deps).
 */

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Icon } from "@/components/home/icons";
import { EVENT, SOCIALS } from "@/data/bhajanClubbing";
import { InstrumentSprite } from "./FestivalBackdrop";

/* ------------------------------------------------------------------ */
/*  Official profiles — top of the page for visibility                 */
/* ------------------------------------------------------------------ */
function SocialLinks() {
  const linkStyle: React.CSSProperties = {
    background: "rgba(244,239,255,0.06)",
    border: "1px solid rgba(244,239,255,0.18)",
    backdropFilter: "blur(8px)",
  };
  return (
    <div className="flex items-center justify-center gap-2.5">
      <a
        href={SOCIALS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Gita Life NYC on Instagram"
        title="Follow on Instagram"
        className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:border-[#F5AED8]"
        style={{ ...linkStyle, color: "#F5AED8" }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a
        href={SOCIALS.youtube}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Gita Life NYC on YouTube"
        title="Watch on YouTube"
        className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:border-[#FF8E8E]"
        style={{ ...linkStyle, color: "#FF8E8E" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M23 7.6a3 3 0 0 0-2.1-2.2C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.6 32.6 32.6 0 0 0 .5 12 32.6 32.6 0 0 0 1 16.4a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A32.6 32.6 0 0 0 23.5 12 32.6 32.6 0 0 0 23 7.6ZM9.7 15.1V8.9l6 3.1-6 3.1Z" />
        </svg>
      </a>
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

  if (now === null) return <div className="mx-auto h-9 w-56 rounded-full" style={{ background: "rgba(244,239,255,0.05)" }} />;

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
        background: "rgba(244,239,255,0.06)",
        border: "1px solid rgba(255,122,26,0.4)",
        color: "#FFD9B0",
        backdropFilter: "blur(8px)",
      }}
      role="timer"
    >
      <span className="relative inline-flex h-2 w-2">
        <span className="bc-glow-pulse absolute inline-flex h-full w-full rounded-full" style={{ background: "var(--bc2-saffron)" }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--bc2-saffron)" }} />
      </span>
      {live ? "Happening now — doors open" : d > 0 ? `Drops in ${d}d · ${h}h · ${m}m` : `Drops in ${h}h · ${m}m · ${s}s`}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Marquee ticker                                                     */
/* ------------------------------------------------------------------ */
const TICKER = [
  "Live kirtan",
  "Free packed prasadam",
  "100% sattvic",
  "All ages",
  "Jersey City",
  "Sat · Aug 15",
];

function TickerStrip({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex items-center" aria-hidden={ariaHidden}>
      {TICKER.map((item) => (
        <span key={item} className="flex items-center">
          <span className="whitespace-nowrap px-5 text-[12px] font-bold uppercase tracking-[0.24em]" style={{ color: "var(--bc2-ink-dim)" }}>
            {item}
          </span>
          <span style={{ color: "var(--bc2-saffron)" }} aria-hidden>
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
export default function NeonHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Parallax: layers fall behind at different rates as the hero scrolls out
  const auroraY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const beamsY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "42%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <header ref={ref} className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #070313 0%, var(--bc2-bg) 40%, var(--bc2-bg-2) 100%)" }}>
      {/* grain */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--tex-grain-dark)", backgroundSize: "240px 240px", opacity: 0.5, mixBlendMode: "screen" }}
        aria-hidden
      />

      {/* aurora blobs (parallax) */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ y: auroraY }} aria-hidden>
        <span className="bc2-aurora left-[-12%] top-[-8%] h-[540px] w-[540px]" style={{ background: "var(--bc2-saffron)", "--o": 0.34, "--t": "17s" } as React.CSSProperties} />
        <span className="bc2-aurora right-[-14%] top-[16%] h-[600px] w-[600px]" style={{ background: "var(--bc2-blue-deep)", "--o": 0.3, "--t": "21s", "--d": "-6s" } as React.CSSProperties} />
        <span className="bc2-aurora bottom-[-22%] left-[24%] h-[620px] w-[620px]" style={{ background: "var(--bc2-purple)", "--o": 0.32, "--t": "19s", "--d": "-11s" } as React.CSSProperties} />
        <span className="bc2-aurora bottom-[6%] right-[18%] h-[380px] w-[380px]" style={{ background: "var(--bc2-pink)", "--o": 0.2, "--t": "23s", "--d": "-3s" } as React.CSSProperties} />
      </motion.div>

      {/* rotating light-rig beams */}
      <motion.div className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2" style={{ y: beamsY }} aria-hidden>
        <div className="bc-spin-slow bc2-beams h-[160vw] max-h-[1100px] w-[160vw] max-w-[1100px] rounded-full" />
      </motion.div>

      {/* floating instruments at the edges (desktop) */}
      <InstrumentSprite kind="bansuri" size={128} rotate={-22} color="#9DB8FF" opacity={0.15} className="hidden md:block" style={{ left: "4%", bottom: "24%" }} floatDuration="10s" />
      <InstrumentSprite kind="mridanga" size={112} rotate={12} color="#FFB25C" opacity={0.14} className="hidden md:block" style={{ right: "4%", top: "30%" }} floatDelay="-4s" floatDuration="11s" />
      <InstrumentSprite kind="kartals" size={72} rotate={-10} color="#C9A8FF" opacity={0.13} className="hidden lg:block" style={{ left: "13%", top: "22%" }} floatDelay="-7s" floatDuration="8s" />

      {/* content */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-6 pb-24 pt-28 text-center"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* official profiles */}
          <div className="mb-5">
            <SocialLinks />
          </div>

          {/* eyebrow */}
          <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: "var(--bc2-ink-faint)" }}>
            Gita Life NYC presents · {EVENT.volume}
          </p>

          {/* massive headline */}
          <h1 className="bc2-display mt-6" style={{ fontSize: "clamp(2.7rem, 11.5vw, 7.2rem)" }}>
            <span className="block text-white" style={{ textShadow: "0 0 44px rgba(139,92,246,0.55)" }}>
              Bhajan
            </span>
            <span className="bc2-headline-grad block">Clubbing</span>
          </h1>

          {/* tagline */}
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed sm:text-[18px]" style={{ color: "var(--bc2-ink-dim)" }}>
            {EVENT.tagline} High-energy kirtan on a concert rig, lights like a rave, a room completely sober — and
            packed prasadam to land it.
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
                  background: "rgba(244,239,255,0.06)",
                  border: "1px solid rgba(244,239,255,0.14)",
                  color: "var(--bc2-ink)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Icon name={chip.icon} size={13} style={{ color: "var(--bc2-amber)" }} />
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
            <a href="#tickets" className="bc2-btn-glow w-full rounded-full px-9 py-4 text-[15px] font-extrabold uppercase tracking-[0.08em] sm:w-auto">
              Get Tickets
            </a>
            <a href="#lineup" className="bc2-btn-ghost w-full rounded-full px-8 py-4 text-[14px] font-semibold sm:w-auto">
              Meet the lineup
            </a>
          </div>

          <p className="mt-6 text-[11.5px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--bc2-ink-faint)" }}>
            {EVENT.priceLabel} · 100% sattvic
          </p>
        </motion.div>

        {/* scroll cue */}
        <motion.a
          href="#vibe"
          className="absolute bottom-20 left-1/2 hidden -translate-x-1/2 sm:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          aria-label="Scroll to about section"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(244,239,255,0.5)" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.a>
      </motion.div>

      {/* marquee ticker */}
      <div
        className="relative z-10 overflow-hidden py-3.5"
        style={{
          borderTop: "1px solid rgba(139,92,246,0.3)",
          borderBottom: "1px solid rgba(139,92,246,0.3)",
          background: "rgba(7,3,19,0.6)",
          backdropFilter: "blur(10px)",
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
