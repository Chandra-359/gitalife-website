/**
 * FestivalBackdrop — decorative festival layer for the midnight page body.
 *
 * String lights + pennant bunting draped along the top, marigold petals
 * drifting down the whole page, twinkling sparkle stars, faint rangoli
 * medallions on the edges, and two extra colour washes. Every element is
 * aria-hidden, pointer-events-none, and animated with transform/opacity
 * only (the global prefers-reduced-motion rule stills all of it).
 *
 * Positions are index-derived (no Math.random) so SSR and client agree.
 */

import { C } from "@/components/home/icons";

/* ------------------------------------------------------------------ */
/*  String lights + bunting — one full-width double strand             */
/* ------------------------------------------------------------------ */
const BULB_COLORS = [C.gold, C.saffron, C.lotusPink, C.peacockLight, C.goldLight];
const BULBS: [number, number][] = [
  [60, 31], [150, 45], [250, 57], [360, 62], [470, 63], [570, 56], [660, 43],
  [720, 31], [800, 45], [900, 57], [1010, 63], [1120, 61], [1220, 52], [1320, 38], [1400, 26],
];
const FLAG_COLORS = [C.saffron, C.gold, C.lotusPink, C.peacockLight];
const FLAGS: [number, number][] = [
  [80, 40], [190, 56], [300, 67], [410, 73], [520, 72], [630, 62], [740, 49],
  [850, 42], [960, 50], [1070, 62], [1180, 66], [1290, 56], [1390, 40],
];

function StrandArt({ flags }: { flags: boolean }) {
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

      {flags && (
        <>
          {/* bunting wire */}
          <path
            d="M0,26 C300,78 600,78 900,40 C1140,70 1320,66 1440,34"
            fill="none"
            stroke="rgba(251,245,230,0.2)"
            strokeWidth="1"
          />
          {FLAGS.map(([x, y], i) => {
            const color = FLAG_COLORS[i % FLAG_COLORS.length];
            return (
              <polygon
                key={`f${i}`}
                points={`${x - 8},${y} ${x + 8},${y} ${x},${y + 15}`}
                fill={color}
                opacity="0.5"
                className="bc-sway"
                style={{ "--t": `${3.8 + (i % 4) * 0.6}s`, "--d": `${-(i * 0.5)}s` } as React.CSSProperties}
              />
            );
          })}
        </>
      )}
    </>
  );
}

export function StringLights({ className = "", flags = true }: { className?: string; flags?: boolean }) {
  return (
    <span className={`pointer-events-none block ${className}`} aria-hidden>
      {/* Desktop: full 1440-wide strand */}
      <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="hidden h-[96px] w-full sm:block">
        <StrandArt flags={flags} />
      </svg>
      {/* Mobile: middle window of the same art, so bulbs/flags keep their shape */}
      <svg viewBox="450 0 540 96" preserveAspectRatio="none" className="h-[72px] w-full sm:hidden">
        <StrandArt flags={flags} />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Bhajan instruments — floating line-art glyphs                      */
/* ------------------------------------------------------------------ */
const GLYPHS = {
  bansuri: (
    <>
      <rect x="2" y="21" width="44" height="6.5" rx="3.2" />
      <circle cx="10" cy="24.2" r="1.1" />
      <circle cx="18" cy="24.2" r="1.1" />
      <circle cx="22.5" cy="24.2" r="1.1" />
      <circle cx="27" cy="24.2" r="1.1" />
      <circle cx="31.5" cy="24.2" r="1.1" />
      <circle cx="36" cy="24.2" r="1.1" />
      <path d="M41.5 21.5 v6" />
      <path d="M43.5 21.5 v6" />
    </>
  ),
  tabla: (
    <>
      <ellipse cx="14" cy="21" rx="9" ry="3.4" />
      <path d="M5 21 C5 32 8.5 38 14 38 C19.5 38 23 32 23 21" />
      <circle cx="14" cy="21" r="3" />
      <path d="M7.5 23.5 L10.5 36" />
      <path d="M20.5 23.5 L17.5 36" />
      <ellipse cx="35" cy="17.5" rx="7" ry="2.8" />
      <path d="M28 17.5 C28 31 30 38 35 38 C40 38 42 31 42 17.5" />
      <circle cx="35" cy="17.5" r="2.3" />
      <path d="M30 20 L32.5 36" />
      <path d="M40 20 L37.5 36" />
    </>
  ),
  mridanga: (
    <>
      <ellipse cx="7" cy="24" rx="3.2" ry="8.5" />
      <ellipse cx="41" cy="24" rx="3.2" ry="8.5" />
      <path d="M7 15.5 C17 11.5 31 11.5 41 15.5" />
      <path d="M7 32.5 C17 36.5 31 36.5 41 32.5" />
      <path d="M12 14.2 L16 33" />
      <path d="M19 12.9 L23 34.5" />
      <path d="M26 12.6 L30 34.6" />
      <path d="M33 13.4 L36 33.4" />
    </>
  ),
  harmonium: (
    <>
      <rect x="5" y="19" width="38" height="15" rx="2" />
      <path d="M9 19 L11.5 11 L36.5 11 L39 19" />
      <path d="M13 15.5 H35" />
      <rect x="8.5" y="26" width="31" height="5.5" rx="1" />
      <path d="M13 26 v5.5 M17.5 26 v5.5 M22 26 v5.5 M26.5 26 v5.5 M31 26 v5.5 M35.5 26 v5.5" />
      <circle cx="11" cy="22.5" r="1.1" />
      <circle cx="15.5" cy="22.5" r="1.1" />
      <circle cx="20" cy="22.5" r="1.1" />
    </>
  ),
  kartals: (
    <>
      <circle cx="16" cy="18" r="7.5" />
      <circle cx="16" cy="18" r="2.6" />
      <circle cx="32" cy="29" r="7.5" />
      <circle cx="32" cy="29" r="2.6" />
      <path d="M16 25.5 C19 30.5 25 33.5 32 36.5" />
    </>
  ),
  tanpura: (
    <>
      <circle cx="24" cy="36" r="8.5" />
      <path d="M21.8 28.5 L21.8 6 M26.2 28.5 L26.2 6" />
      <rect x="20.8" y="2.5" width="6.4" height="4" rx="1" />
      <path d="M18.5 4.5 H20.8 M27.2 4.5 H29.5" />
      <path d="M23.2 7 V36 M24.8 7 V36" />
      <path d="M20 40.5 H28" />
    </>
  ),
} as const;

export type InstrumentKind = keyof typeof GLYPHS;

export function InstrumentSprite({
  kind,
  size = 96,
  rotate = 0,
  color = C.goldLight,
  opacity = 0.13,
  className = "",
  style,
  float = true,
  floatDelay = "0s",
  floatDuration = "9s",
}: {
  kind: InstrumentKind;
  size?: number;
  rotate?: number;
  color?: string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
  float?: boolean;
  floatDelay?: string;
  floatDuration?: string;
}) {
  return (
    <span
      className={`bc-sprite pointer-events-none absolute ${float ? "bc-float" : ""} ${className}`}
      style={
        {
          ...style,
          opacity,
          "--w": `${size}px`,
          "--r": `${rotate}deg`,
          "--t": floatDuration,
          "--d": floatDelay,
        } as React.CSSProperties
      }
      aria-hidden
    >
      <svg viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {GLYPHS[kind]}
      </svg>
    </span>
  );
}

/** Gutter placements down the body. Roughly half hide on phones. */
const INSTRUMENTS: {
  kind: InstrumentKind;
  top: string;
  side: { left?: string; right?: string };
  size: number;
  rotate: number;
  color?: string;
  desktopOnly?: boolean;
}[] = [
  { kind: "bansuri", top: "4%", side: { left: "2%" }, size: 112, rotate: -24 },
  { kind: "tabla", top: "11%", side: { right: "2.5%" }, size: 96, rotate: 10, desktopOnly: true },
  { kind: "kartals", top: "19%", side: { left: "3.5%" }, size: 78, rotate: -12, color: C.gold },
  { kind: "harmonium", top: "28%", side: { right: "2%" }, size: 108, rotate: 8, desktopOnly: true },
  { kind: "mridanga", top: "37%", side: { left: "2%" }, size: 118, rotate: -8 },
  { kind: "tanpura", top: "46%", side: { right: "3%" }, size: 100, rotate: 14, desktopOnly: true },
  { kind: "bansuri", top: "57%", side: { right: "4%" }, size: 92, rotate: 18, color: C.gold },
  { kind: "kartals", top: "66%", side: { left: "3%" }, size: 72, rotate: 10, desktopOnly: true },
  { kind: "tabla", top: "76%", side: { left: "2%" }, size: 94, rotate: -10 },
  { kind: "mridanga", top: "87%", side: { right: "2%" }, size: 106, rotate: 12, desktopOnly: true },
];

function Instruments() {
  return (
    <>
      {INSTRUMENTS.map((it, i) => (
        <InstrumentSprite
          key={`i${i}`}
          kind={it.kind}
          size={it.size}
          rotate={it.rotate}
          color={it.color}
          opacity={0.13}
          className={it.desktopOnly ? "hidden md:block" : ""}
          style={{ top: it.top, ...it.side }}
          floatDelay={`${-(i * 1.7)}s`}
          floatDuration={`${8 + (i % 5)}s`}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Music notes rising through the night                               */
/* ------------------------------------------------------------------ */
function NoteGlyph({ double, size }: { double: boolean; size: number }) {
  if (double) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <ellipse cx="7" cy="26" rx="4.4" ry="3.4" fill="currentColor" stroke="none" transform="rotate(-18 7 26)" />
        <ellipse cx="23" cy="23" rx="4.4" ry="3.4" fill="currentColor" stroke="none" transform="rotate(-18 23 23)" />
        <path d="M11.3 25 V8 M27.3 22 V5" />
        <path d="M11.3 8 L27.3 5 L27.3 9.5 L11.3 12.5 Z" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg width={size * 0.75} height={size} viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <ellipse cx="7" cy="26" rx="4.6" ry="3.6" fill="currentColor" stroke="none" transform="rotate(-18 7 26)" />
      <path d="M11.5 25 V6" />
      <path d="M11.5 6 C17 8 19 12 17.5 17" />
    </svg>
  );
}

const NOTE_COLORS = [C.goldLight, "#FBF5E6", C.gold, "#F0A0C4"];

function RisingNotes() {
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const top = [7, 13, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 89, 94][i];
        const left = (i * 37 + 21) % 89;
        const size = 15 + (i % 4) * 3;
        return (
          <span
            key={`n${i}`}
            className={`bc-note ${i % 2 === 1 ? "hidden sm:block" : ""}`}
            style={
              {
                top: `${top}%`,
                left: `${left}%`,
                color: NOTE_COLORS[i % NOTE_COLORS.length],
                "--t": `${13 + (i % 6) * 2.5}s`,
                "--d": `${-(i * 3.1)}s`,
                "--o": i % 3 === 0 ? "0.5" : "0.34",
                "--sway": i % 2 === 0 ? `${2 + (i % 3)}vw` : `-${2 + (i % 3)}vw`,
                "--rr": i % 2 === 0 ? "16deg" : "-14deg",
              } as React.CSSProperties
            }
          >
            <NoteGlyph double={i % 3 === 1} size={size} />
          </span>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Marigold petals — sprinkled down the entire body                   */
/* ------------------------------------------------------------------ */
const PETAL_COLORS = [
  ["#F2B95C", "#D9691A"], // marigold
  ["#E8A33D", "#B85308"], // deep marigold
  ["#EDD698", "#C9A248"], // gold
  ["#F0A0C4", "#C84682"], // lotus
];

function Petal({ index }: { index: number }) {
  const top = [3, 8, 14, 20, 27, 33, 40, 47, 54, 61, 68, 75, 82, 89, 95][index % 15];
  const left = (index * 53 + 13) % 97;
  const size = 11 + (index % 4) * 3;
  const [hi, lo] = PETAL_COLORS[index % PETAL_COLORS.length];
  const sway = index % 2 === 0 ? `${3 + (index % 5)}vw` : `-${3 + (index % 4)}vw`;
  return (
    <span
      className="bc-petal"
      style={
        {
          top: `${top}%`,
          left: `${left}%`,
          "--t": `${15 + (index % 6) * 3}s`,
          "--d": `${-(index * 2.7)}s`,
          "--sway": sway,
          "--fall": `${44 + (index % 4) * 9}vh`,
          "--o": index % 3 === 0 ? "0.85" : "0.6",
        } as React.CSSProperties
      }
    >
      <svg width={size} height={size * 1.6} viewBox="0 0 12 19" style={{ transform: `rotate(${(index * 47) % 360}deg)` }}>
        <defs>
          <linearGradient id={`bc-petal-g${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hi} />
            <stop offset="100%" stopColor={lo} />
          </linearGradient>
        </defs>
        <path d="M6 0.5 C 10 4, 10.5 12, 6 18.5 C 1.5 12, 2 4, 6 0.5 Z" fill={`url(#bc-petal-g${index})`} />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Sparkle stars                                                      */
/* ------------------------------------------------------------------ */
function Star({ index }: { index: number }) {
  const top = [6, 12, 19, 26, 35, 43, 52, 63, 72, 81, 90][index % 11];
  const left = (index * 41 + 29) % 93;
  const size = 8 + (index % 3) * 4;
  const color = index % 3 === 0 ? C.goldLight : index % 3 === 1 ? "#FBF5E6" : C.gold;
  return (
    <svg
      className="bc-twinkle absolute"
      style={
        {
          top: `${top}%`,
          left: `${left}%`,
          "--t": `${2.6 + (index % 5) * 0.7}s`,
          "--d": `${-(index * 0.9)}s`,
        } as React.CSSProperties
      }
      width={size}
      height={size}
      viewBox="0 0 12 12"
    >
      <path d="M6 0 C6.7 3.6 8.4 5.3 12 6 C8.4 6.7 6.7 8.4 6 12 C5.3 8.4 3.6 6.7 0 6 C3.6 5.3 5.3 3.6 6 0 Z" fill={color} />
    </svg>
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
/*  Rangoli medallion — faint spinning ring on the page edges          */
/* ------------------------------------------------------------------ */
function Medallion({ style }: { style: React.CSSProperties }) {
  const rays = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg viewBox="0 0 400 400" className="bc-spin-slow absolute h-[420px] w-[420px]" style={style}>
      <g stroke={C.goldLight} fill="none" strokeWidth="0.9">
        {rays.map((deg) => (
          <line key={deg} x1="200" y1="52" x2="200" y2="86" transform={`rotate(${deg} 200 200)`} />
        ))}
        <circle cx="200" cy="200" r="96" strokeDasharray="3 8" />
        <circle cx="200" cy="200" r="126" strokeWidth="0.6" strokeDasharray="1 10" />
        <circle cx="200" cy="200" r="150" strokeWidth="0.5" opacity="0.7" />
        {rays.map((deg) => (
          <circle key={`d${deg}`} cx="200" cy="90" r="1.6" fill={C.goldLight} stroke="none" transform={`rotate(${deg + 7.5} 200 200)`} />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Backdrop                                                           */
/* ------------------------------------------------------------------ */
/** Phulkari-style dot lattice, tiled across the whole body. */
const RANGOLI_TILE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><g fill='%23EDD698'><circle cx='32' cy='32' r='1.5'/><circle cx='32' cy='4' r='1'/><circle cx='4' cy='32' r='1'/><circle cx='60' cy='32' r='1'/><circle cx='32' cy='60' r='1'/><circle cx='18' cy='18' r='0.7'/><circle cx='46' cy='18' r='0.7'/><circle cx='18' cy='46' r='0.7'/><circle cx='46' cy='46' r='0.7'/></g></svg>\")";

export default function FestivalBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Rangoli dot lattice over the whole body — kills the flat black */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: RANGOLI_TILE, backgroundSize: "64px 64px", opacity: 0.055 }}
      />

      {/* String lights + bunting sealing the top of the body */}
      <StringLights className="absolute inset-x-0 top-0" />

      {/* Colour washes so the long dark stretch breathes */}
      <div
        className="absolute left-[-10%] top-[30%] h-[560px] w-[560px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.lotusPink}1f, transparent 65%)`, filter: "blur(46px)" }}
      />
      <div
        className="absolute right-[-12%] top-[55%] h-[600px] w-[600px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.peacockLight}1a, transparent 65%)`, filter: "blur(50px)" }}
      />
      <div
        className="absolute left-[20%] top-[78%] h-[480px] w-[480px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.saffron}17, transparent 65%)`, filter: "blur(44px)" }}
      />

      {/* Rangoli medallions hugging the edges */}
      <Medallion style={{ top: "10%", right: "-150px", opacity: 0.1 }} />
      <Medallion style={{ top: "36%", left: "-170px", opacity: 0.09 }} />
      <Medallion style={{ top: "62%", right: "-130px", opacity: 0.085 }} />
      <Medallion style={{ top: "86%", left: "-150px", opacity: 0.08 }} />

      {/* Bhajan instruments floating in the gutters */}
      <Instruments />

      {/* Music notes rising through the night */}
      <RisingNotes />

      {/* Twinkling stars */}
      {Array.from({ length: 18 }, (_, i) => (
        <Star key={`s${i}`} index={i} />
      ))}

      {/* Marigold petals drifting down */}
      {Array.from({ length: 26 }, (_, i) => (
        <Petal key={`p${i}`} index={i} />
      ))}
    </div>
  );
}
