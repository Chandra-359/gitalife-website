"use client";

/**
 * BentoDetails — scannable bento grid for the event logistics:
 * venue + stylized map (wide) · date/time with live countdown ·
 * dress code · house rules · run-of-show (wide).
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/home/icons";
import { EVENT, NIGHT_FLOW } from "@/data/bajanClubbing";

/* ------------------------------------------------------------------ */
/*  Stylized map — abstract downtown grid with a glowing pin           */
/* ------------------------------------------------------------------ */
function StylizedMap() {
  return (
    <div className="relative mt-5 h-[150px] overflow-hidden rounded-xl sm:h-[170px]" style={{ background: "rgba(7,3,19,0.55)", border: "1px solid rgba(77,159,255,0.2)" }}>
      <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
        <g stroke="rgba(77,159,255,0.28)" strokeWidth="1.5">
          {/* avenues */}
          <path d="M-10 40 H410" />
          <path d="M-10 85 H410" />
          <path d="M-10 130 H410" />
          {/* streets */}
          {[40, 95, 150, 205, 260, 315, 370].map((x) => (
            <path key={x} d={`M${x} -10 V180`} strokeWidth="1" />
          ))}
          {/* the diagonal — Flatbush energy */}
          <path d="M-10 160 L410 10" stroke="rgba(139,92,246,0.4)" strokeWidth="2.5" />
        </g>
        {/* park block */}
        <rect x="262" y="42" width="51" height="41" rx="4" fill="rgba(77,159,255,0.1)" stroke="rgba(77,159,255,0.25)" />
        {/* subway dots */}
        {[[95, 85], [205, 130], [315, 40]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3.5" fill="none" stroke="rgba(255,178,92,0.7)" strokeWidth="1.4" />
        ))}
      </svg>
      {/* glowing venue pin */}
      <div className="absolute left-[46%] top-[42%] -translate-x-1/2 -translate-y-1/2">
        <span className="bc-glow-pulse absolute -inset-4 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,122,26,0.5), transparent 70%)" }} aria-hidden />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--bc2-saffron)", boxShadow: "0 0 24px rgba(255,122,26,0.9)" }}>
          <Icon name="mapPin" size={17} style={{ color: "#1C0A02" }} />
        </span>
      </div>
      <span
        className="absolute bottom-2.5 left-3 rounded-full px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.16em]"
        style={{ background: "rgba(7,3,19,0.75)", color: "var(--bc2-amber)", border: "1px solid rgba(255,178,92,0.3)" }}
      >
        Downtown Brooklyn
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Countdown chips (full version, SSR-safe)                           */
/* ------------------------------------------------------------------ */
function BentoCountdown() {
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

  if (now === null) return <div className="mt-5 h-[64px] rounded-xl" style={{ background: "rgba(244,239,255,0.04)" }} />;

  const start = new Date(EVENT.startIso).getTime();
  const diff = Math.max(0, start - now);
  const segs = [
    { v: Math.floor(diff / 86_400_000), l: "days" },
    { v: Math.floor((diff % 86_400_000) / 3_600_000), l: "hrs" },
    { v: Math.floor((diff % 3_600_000) / 60_000), l: "min" },
    { v: Math.floor((diff % 60_000) / 1000), l: "sec" },
  ];

  return (
    <div className="mt-5 grid grid-cols-4 gap-2" role="timer" aria-label="Countdown to the event">
      {segs.map((s) => (
        <div key={s.l} className="rounded-xl px-1 py-2.5 text-center" style={{ background: "rgba(244,239,255,0.055)", border: "1px solid rgba(77,159,255,0.28)" }}>
          <div className="bc2-display text-[22px] leading-none tabular-nums" style={{ color: "#9DC8FF", fontWeight: 700 }}>
            {String(s.v).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[8.5px] font-extrabold uppercase tracking-[0.2em]" style={{ color: "var(--bc2-ink-faint)" }}>
            {s.l}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bento card shell                                                   */
/* ------------------------------------------------------------------ */
function Bento({
  children,
  edge,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  edge: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay }}
      className={`bc2-glass bc2-glass-hover bc2-edge-top p-6 ${className}`}
      style={{ "--bc2-edge": edge, "--bc2-hover-glow": `${edge}4d` } as React.CSSProperties}
    >
      {children}
    </motion.div>
  );
}

function BentoLabel({ icon, children, color }: { icon: Parameters<typeof Icon>[0]["name"]; children: React.ReactNode; color: string }) {
  return (
    <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.26em]" style={{ color }}>
      <Icon name={icon} size={13} />
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Grid                                                               */
/* ------------------------------------------------------------------ */
export default function BentoDetails() {
  return (
    <section id="details" className="relative mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
          The Details
        </p>
        <h2 className="bc2-display mt-4 text-[30px] text-white sm:text-[40px]">
          Everything you need. <span className="bc2-headline-grad">Nothing you don&rsquo;t.</span>
        </h2>
      </motion.div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Venue + map — wide */}
        <Bento edge="#FF7A1A" className="sm:col-span-2" delay={0}>
          <BentoLabel icon="mapPin" color="var(--bc2-amber)">
            Hosted by ISKCON NYC
          </BentoLabel>
          <h3 className="bc2-display mt-3 text-[20px] text-white sm:text-[23px]" style={{ fontWeight: 700 }}>
            {EVENT.venue.name}
          </h3>
          <p className="mt-1.5 text-[13px]" style={{ color: "var(--bc2-ink-dim)" }}>
            {EVENT.venue.address}
          </p>
          <StylizedMap />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12px]" style={{ color: "var(--bc2-ink-faint)" }}>
              {EVENT.venue.transit}
            </p>
            <a
              href={EVENT.venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bc2-btn-ghost inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold"
              onClick={(e) => e.stopPropagation()}
            >
              Get directions
              <Icon name="arrowRight" size={12} />
            </a>
          </div>
        </Bento>

        {/* Date & time + countdown */}
        <Bento edge="#4D9FFF" className="sm:col-span-2 lg:col-span-2" delay={0.08}>
          <BentoLabel icon="calendar" color="#9DC8FF">
            Time &amp; Date
          </BentoLabel>
          <h3 className="bc2-display mt-3 text-[20px] text-white sm:text-[23px]" style={{ fontWeight: 700 }}>
            {EVENT.dateLabel}
          </h3>
          <p className="mt-1.5 text-[13px]" style={{ color: "var(--bc2-ink-dim)" }}>
            {EVENT.timeLabel} · {EVENT.doorsLabel} — the chai bar opens with the doors.
          </p>
          <BentoCountdown />
        </Bento>

        {/* Dress code */}
        <Bento edge="#E86BB7" delay={0.12}>
          <BentoLabel icon="sparkle" color="#F5AED8">
            Dress Code
          </BentoLabel>
          <h3 className="mt-3 text-[16px] font-bold text-white">Festival fits, dance-proof</h3>
          <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
            {EVENT.venue.note} Kurtas, sneakers, saris, streetwear — modest and movable wins.
          </p>
        </Bento>

        {/* House rules */}
        <Bento edge="#8B5CF6" delay={0.16}>
          <BentoLabel icon="lotus" color="#C9A8FF">
            House Rules
          </BentoLabel>
          <ul className="mt-3 space-y-2.5">
            {["Zero alcohol, zero substances", "All ages — bring your grandmother", "Phones down during the final kirtan"].map((rule) => (
              <li key={rule} className="flex items-start gap-2.5 text-[12.5px] leading-snug" style={{ color: "var(--bc2-ink-dim)" }}>
                <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#8B5CF6", boxShadow: "0 0 8px #8B5CF6" }} aria-hidden />
                {rule}
              </li>
            ))}
          </ul>
        </Bento>

        {/* Run of show — wide strip */}
        <Bento edge="#FFB25C" className="sm:col-span-2 lg:col-span-2" delay={0.2}>
          <BentoLabel icon="music" color="var(--bc2-amber)">
            Run of Show
          </BentoLabel>
          <ol className="mt-4 space-y-3">
            {NIGHT_FLOW.map((stop) => (
              <li key={stop.time} className="flex items-baseline gap-4">
                <span className="bc2-display w-12 shrink-0 text-[14px] tabular-nums" style={{ color: "#9DC8FF", fontWeight: 700 }}>
                  {stop.time}
                </span>
                <div className="min-w-0">
                  <span className="text-[13.5px] font-bold text-white">{stop.title}</span>
                  <span className="ml-2 hidden text-[12px] sm:inline" style={{ color: "var(--bc2-ink-faint)" }}>
                    {stop.detail}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </Bento>
      </div>
    </section>
  );
}
