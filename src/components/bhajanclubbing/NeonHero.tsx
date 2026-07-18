"use client";

/**
 * NeonHero — cinematic full-bleed video hero for /bhajanclubbing.
 *
 * Layers (back → front): plum gradient base → aurora washes (also the
 * fallback while the video loads or if it 404s) → full-screen ambient
 * video loop → dark bottom-up scrim → content (blinking LIVE badge,
 * theatrical serif headline whose tracking tightens on entry, meta
 * chips, ticket-stub countdown, warm CTA) → marquee ticker.
 *
 * Video sources: /videos/hero-loop.mp4 is tried first — drop the real
 * B-roll there (slow-mo mridangam hands, haze through concert lights,
 * crowd hands up; H.264, 15–30s, ideally under ~8 MB). The committed
 * hero-loop.webm is a generated ambient placeholder (drifting warm
 * glows over plum haze) that plays until real footage lands.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Icon } from "@/components/home/icons";
import { EVENT } from "@/data/bhajanClubbing";
import SocialLinks from "./SocialLinks";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/*  Ambient background video — muted, looping, decorative only         */
/* ------------------------------------------------------------------ */
function AmbientVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  // Pause the loop for users who prefer reduced motion.
  useEffect(() => {
    const vid = ref.current;
    if (!vid) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (mq.matches) vid.pause();
      else vid.play().catch(() => {});
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <video
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      disablePictureInPicture
      aria-hidden
    >
      <source src="/videos/hero-loop.mp4" type="video/mp4" />
      <source src="/videos/hero-loop.webm" type="video/webm" />
    </video>
  );
}

/* ------------------------------------------------------------------ */
/*  Blinking LIVE badge                                                */
/* ------------------------------------------------------------------ */
function LiveBadge() {
  return (
    <span
      className="inline-flex items-center gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.34em]"
      style={{ color: "#EC9C90", textShadow: "0 0 14px rgba(228,87,79,0.45)" }}
    >
      <span className="bc2-live-dot h-1.5 w-1.5 rounded-full" style={{ background: "#E4574F" }} aria-hidden />
      Live · {EVENT.volume}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Countdown — transparent ticket stub over the live video            */
/* ------------------------------------------------------------------ */
function CountdownStub() {
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

  if (now === null) return <div className="mx-auto h-10 w-64 border border-white/20 bg-transparent" />;

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
    <span className="inline-flex items-stretch border border-white/25 bg-transparent backdrop-blur-[3px]" role="timer">
      <span className="flex items-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: "var(--bc2-amber)" }}>
        {live ? "Live now" : "Drops in"}
      </span>
      <span className="my-2 border-l border-dashed border-white/25" aria-hidden />
      <span className="flex items-center px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.24em] text-club-ink">
        {live ? "Doors open" : d > 0 ? `${d}d · ${h}h · ${m}m` : `${h}h · ${m}m · ${s}s`}
      </span>
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
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Parallax: content falls behind slightly as the hero scrolls out
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "42%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  // Theater-screen pull-back: the whole hero shell scales down and gains
  // rounded corners as the page content glides up over it.
  const shellScale = useTransform(scrollYProgress, [0, 0.9], [1, 0.95]);
  const shellRadius = useTransform(scrollYProgress, [0, 0.9], [0, 24]);

  return (
    <header ref={ref} className="relative">
      <motion.div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, var(--bc2-bg) 0%, var(--bc2-bg-mid) 45%, var(--bc2-bg-2) 100%)",
          scale: reduce ? 1 : shellScale,
          borderRadius: reduce ? 0 : shellRadius,
        }}
      >
        {/* aurora washes — ambience while the video loads, fallback if it fails */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <span className="bc2-aurora left-[-12%] top-[-8%] h-[540px] w-[540px]" style={{ background: "var(--bc2-saffron)", "--o": 0.3, "--t": "17s" } as React.CSSProperties} />
          <span className="bc2-aurora right-[-14%] top-[16%] h-[600px] w-[600px]" style={{ background: "var(--bc2-blue-deep)", "--o": 0.28, "--t": "21s", "--d": "-6s" } as React.CSSProperties} />
          <span className="bc2-aurora bottom-[-22%] left-[24%] h-[620px] w-[620px]" style={{ background: "var(--bc2-purple)", "--o": 0.3, "--t": "19s", "--d": "-11s" } as React.CSSProperties} />
        </div>

        {/* full-bleed ambient video */}
        <AmbientVideo />

        {/* dark, softly blurred scrim so the type stays perfectly legible */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1A1D] via-transparent to-transparent opacity-80 backdrop-blur-[2px]"
          aria-hidden
        />

        {/* content */}
        <motion.div
          className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-6 pb-24 pt-28 text-center"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          >
            {/* blinking LIVE indicator */}
            <div className="mb-6">
              <LiveBadge />
            </div>

            {/* official profiles */}
            <div className="mb-5">
              <SocialLinks />
            </div>

            {/* eyebrow */}
            <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: "var(--bc2-ink-faint)" }}>
              Gita Life NYC presents
            </p>

            {/* theatrical headline — tracking tightens from wide to set */}
            <h1 className="relative mt-6 text-club-ink">
              <span className="bc2-light-leak" aria-hidden />
              <motion.span
                className="relative block font-sans font-bold uppercase"
                style={{ fontSize: "clamp(1.25rem, 4vw, 2.3rem)" }}
                initial={reduce ? false : { opacity: 0, letterSpacing: "0.9em", marginLeft: "0.9em" }}
                animate={{ opacity: 1, letterSpacing: "0.4em", marginLeft: "0.4em" }}
                transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
              >
                Bhajan
              </motion.span>
              <motion.span
                className="bc2-display relative block italic"
                style={{ fontSize: "clamp(3rem, 12.5vw, 7.6rem)", fontWeight: 500 }}
                initial={reduce ? false : { opacity: 0, scale: 1.16, letterSpacing: "0.22em" }}
                animate={{ opacity: 1, scale: 1, letterSpacing: "-0.015em" }}
                transition={{ duration: 1.6, ease: EASE, delay: 0.35 }}
              >
                Clubbing
              </motion.span>
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
                    background: "rgba(244,240,235,0.06)",
                    border: "1px solid rgba(244,240,235,0.14)",
                    color: "var(--bc2-ink)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Icon name={chip.icon} size={13} style={{ color: "var(--bc2-amber)" }} />
                  {chip.label}
                </span>
              ))}
            </div>

            {/* ticket-stub countdown */}
            <div className="mt-7">
              <CountdownStub />
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(244,240,235,0.5)" strokeWidth="1.6" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.a>
        </motion.div>

        {/* marquee ticker */}
        <div
          className="relative z-10 overflow-hidden py-3.5"
          style={{
            borderTop: "1px solid rgba(122,92,158,0.3)",
            borderBottom: "1px solid rgba(122,92,158,0.3)",
            background: "rgba(26,26,29,0.6)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="bc-marquee-track">
            <TickerStrip />
            <TickerStrip ariaHidden />
          </div>
        </div>
      </motion.div>
    </header>
  );
}
