/**
 * FestivalBackdrop — decorative candlelit layer for the umber page body.
 *
 * Gold string lights draped along the top, a faint gold dot lattice so
 * the long dark stretch never reads flat, and a few static warm light
 * pools down the body. Diya rows (exported separately) divide sections.
 * Every element is aria-hidden, pointer-events-none, and animated with
 * transform/opacity only (the global prefers-reduced-motion rule stills
 * all of it).
 *
 * Positions are index-derived (no Math.random) so SSR and client agree.
 */

import { C } from "@/components/home/icons";

/* ------------------------------------------------------------------ */
/*  String lights — one full-width strand of warm gold bulbs           */
/* ------------------------------------------------------------------ */
const BULB_COLORS = [C.gold, C.goldLight, "#E8A33D"];
const BULBS: [number, number][] = [
  [60, 31], [150, 45], [250, 57], [360, 62], [470, 63], [570, 56], [660, 43],
  [720, 31], [800, 45], [900, 57], [1010, 63], [1120, 61], [1220, 52], [1320, 38], [1400, 26],
];

function StrandArt() {
  return (
    <>
      {/* light wire */}
      <path
        d="M0,18 C240,66 480,66 720,30 C960,66 1200,66 1440,22"
        fill="none"
        stroke="rgba(201,162,72,0.32)"
        strokeWidth="1.2"
      />
      {BULBS.map(([x, y], i) => {
        const color = BULB_COLORS[i % BULB_COLORS.length];
        return (
          <g key={`b${i}`} className="bc-twinkle" style={{ "--t": `${2.4 + (i % 5) * 0.5}s`, "--d": `${-(i * 0.7)}s` } as React.CSSProperties}>
            <circle cx={x} cy={y + 6} r="8" fill={color} opacity="0.16" />
            <circle cx={x} cy={y + 6} r="2.6" fill={color} />
          </g>
        );
      })}
    </>
  );
}

export function StringLights({ className = "" }: { className?: string; flags?: boolean }) {
  return (
    <span className={`pointer-events-none block ${className}`} aria-hidden>
      {/* Desktop: full 1440-wide strand */}
      <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="hidden h-[96px] w-full sm:block">
        <StrandArt />
      </svg>
      {/* Mobile: middle window of the same art, so bulbs keep their shape */}
      <svg viewBox="450 0 540 96" preserveAspectRatio="none" className="h-[72px] w-full sm:hidden">
        <StrandArt />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Diya row — oil lamps with flickering flames (section divider)      */
/* ------------------------------------------------------------------ */
function Diya({ delay }: { delay: string }) {
  return (
    <svg width="34" height="30" viewBox="0 0 34 30" aria-hidden>
      <defs>
        <linearGradient id={`bc-diya-${delay}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8A33D" />
          <stop offset="100%" stopColor="#B85308" />
        </linearGradient>
      </defs>
      {/* flame */}
      <g className="bc-twinkle" style={{ "--t": "2.1s", "--d": delay } as React.CSSProperties}>
        <circle cx="17" cy="9" r="7" fill={C.goldLight} opacity="0.22" />
        <path d="M17 2 C19.6 5.4, 19.6 9.6, 17 12.5 C14.4 9.6, 14.4 5.4, 17 2 Z" fill={C.goldLight} />
        <path d="M17 6 C18.2 7.8, 18.2 10, 17 12 C15.8 10, 15.8 7.8, 17 6 Z" fill={C.saffron} />
      </g>
      {/* bowl */}
      <path d="M3 16 C7.5 25.5, 26.5 25.5, 31 16 C24 19.5, 10 19.5, 3 16 Z" fill={`url(#bc-diya-${delay})`} />
      <ellipse cx="17" cy="16.4" rx="14" ry="2.2" fill="#F2B95C" opacity="0.55" />
    </svg>
  );
}

export function DiyaRow() {
  return (
    <div className="relative z-10 mx-auto flex max-w-3xl items-center justify-center gap-4 px-6 sm:gap-7" aria-hidden>
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}59)` }} />
      {["-0.3s", "-1.1s", "-0.6s", "-1.6s", "-0.9s"].map((d, i) => (
        <span key={i} className={i % 2 === 1 ? "hidden sm:block" : ""}>
          <Diya delay={d} />
        </span>
      ))}
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${C.gold}59, transparent)` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Backdrop                                                           */
/* ------------------------------------------------------------------ */
/** Faint gold dot lattice, tiled across the whole body. */
const DOT_TILE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><g fill='%23EDD698'><circle cx='32' cy='32' r='1.5'/><circle cx='32' cy='4' r='1'/><circle cx='4' cy='32' r='1'/><circle cx='60' cy='32' r='1'/><circle cx='32' cy='60' r='1'/><circle cx='18' cy='18' r='0.7'/><circle cx='46' cy='18' r='0.7'/><circle cx='18' cy='46' r='0.7'/><circle cx='46' cy='46' r='0.7'/></g></svg>\")";

export default function FestivalBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Gold dot lattice over the whole body — kills the flat dark */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: DOT_TILE, backgroundSize: "64px 64px", opacity: 0.05 }}
      />

      {/* String lights sealing the top of the body */}
      <StringLights className="absolute inset-x-0 top-0" />

      {/* Static candle pools so the long dark stretch breathes */}
      <div
        className="absolute left-[-10%] top-[30%] h-[560px] w-[560px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.gold}1c, transparent 65%)`, filter: "blur(46px)" }}
      />
      <div
        className="absolute right-[-12%] top-[55%] h-[600px] w-[600px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.saffron}14, transparent 65%)`, filter: "blur(50px)" }}
      />
      <div
        className="absolute left-[20%] top-[80%] h-[480px] w-[480px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.goldLight}12, transparent 65%)`, filter: "blur(44px)" }}
      />
    </div>
  );
}
