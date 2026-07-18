"use client";

/**
 * TheVibe — manifesto + interactive instrument showcase.
 *
 * The manifesto typography unfolds on scroll (heading words rise
 * word-by-word, then the serif line and paragraphs, on one staggered
 * viewport trigger). The four feature cards are media-rich magnetic
 * tiles: a dark masked video window with a floating instrument
 * line-art glyph, spring-driven 3D tilt that pulls toward the cursor,
 * and an accent glow that spills past the card onto the page on hover.
 *
 * Per-card footage: drop /videos/vibe-<clip>.mp4 (e.g. vibe-kirtan.mp4
 * — mridangam hands in club light) and it plays instead of the shared
 * ambient placeholder loop.
 */

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { VIBE_FACTS } from "@/data/bhajanClubbing";
import { GLYPHS, type InstrumentKind } from "./FestivalBackdrop";

const unfold: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const HEADLINE_WORDS = "A rave where the drop is a".split(" ");

/* Per-card showcase treatment, keyed by the fact's icon id. */
const SHOWCASE: Record<
  (typeof VIBE_FACTS)[number]["icon"],
  { sprite: InstrumentKind; clip: string; glow: string }
> = {
  music: { sprite: "mridanga", clip: "kirtan", glow: "#D98A4A" }, // warm saffron
  sparkle: { sprite: "kartals", clip: "rave", glow: "#7A5C9E" }, // deep purple
  food: { sprite: "bansuri", clip: "prasadam", glow: "#E5C08D" }, // warm sand
  handshake: { sprite: "harmonium", clip: "invited", glow: "#C08CA6" }, // soft rose
};

/* ------------------------------------------------------------------ */
/*  Masked looping media window with a floating instrument glyph       */
/* ------------------------------------------------------------------ */
function ShowcaseMedia({ sprite, clip, glow }: { sprite: InstrumentKind; clip: string; glow: string }) {
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
    <div className="relative aspect-[16/9] overflow-hidden">
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
        <source src={`/videos/vibe-${clip}.mp4`} type="video/mp4" />
        <source src="/videos/hero-loop.webm" type="video/webm" />
      </video>
      {/* accent tint + dark mask so the glyph and copy stay legible */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(80% 90% at 50% 30%, ${glow}30, transparent 70%), linear-gradient(180deg, rgba(26,22,35,0.25), rgba(26,22,35,0.65))`,
        }}
        aria-hidden
      />
      {/* instrument visual, floating gently in the haze */}
      <span
        className="bc-float pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ "--t": "7s" } as React.CSSProperties}
        aria-hidden
      >
        <InstrumentVisual sprite={sprite} glow={glow} />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Instrument visual — uploaded image with line-art fallback          */
/*                                                                     */
/*  Tries /instruments/<sprite>.png → .webp → .jpg (see                */
/*  public/instruments/README.md). The glyph renders immediately and   */
/*  hands over to the image once one loads; if none exists, the glyph  */
/*  simply stays.                                                      */
/* ------------------------------------------------------------------ */
const IMG_EXTS = ["png", "webp", "jpg"] as const;

function InstrumentVisual({ sprite, glow }: { sprite: InstrumentKind; glow: string }) {
  const [extIdx, setExtIdx] = useState(0);
  const [imgReady, setImgReady] = useState(false);

  return (
    <>
      {!imgReady && (
        <svg
          viewBox="0 0 48 48"
          width="88"
          height="88"
          fill="none"
          stroke={glow}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 14px ${glow}66)` }}
        >
          {GLYPHS[sprite]}
        </svg>
      )}
      {extIdx < IMG_EXTS.length && (
        <Image
          src={`/instruments/${sprite}.${IMG_EXTS[extIdx]}`}
          alt=""
          fill
          sizes="320px"
          className={`object-contain p-7 transition-opacity duration-500 ${imgReady ? "opacity-100" : "opacity-0"}`}
          style={{ filter: `drop-shadow(0 8px 20px rgba(16,12,20,0.55)) drop-shadow(0 0 18px ${glow}40)` }}
          onLoad={() => setImgReady(true)}
          onError={() => setExtIdx((i) => i + 1)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Magnetic wrapper — tilts and pulls the card toward the cursor      */
/* ------------------------------------------------------------------ */
function MagneticCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 160, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), spring);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), spring);
  const x = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), spring);
  const y = useSpring(useTransform(my, [-0.5, 0.5], [-6, 6]), spring);

  if (reduce) return <div className="h-full">{children}</div>;

  return (
    <motion.div
      ref={ref}
      className="h-full"
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX, rotateY, x, y, transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

export default function TheVibe() {
  const reduce = useReducedMotion();
  return (
    <section id="vibe" className="relative mx-auto max-w-5xl scroll-mt-20 px-6 py-20 sm:py-28">
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* manifesto — unfolds word-by-word, then line-by-line on scroll */}
        <motion.div
          variants={unfold}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p variants={rise} className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
            The Vibe
          </motion.p>
          <h2 className="mt-4 leading-[1.2] text-club-ink">
            <span className="block font-sans text-[22px] font-bold uppercase tracking-[0.08em] sm:text-[28px]">
              {HEADLINE_WORDS.map((word, i) => (
                <Fragment key={i}>
                  <motion.span variants={rise} className="inline-block">
                    {word}
                  </motion.span>
                  {i < HEADLINE_WORDS.length - 1 ? " " : null}
                </Fragment>
              ))}
            </span>
            <motion.span variants={rise} className="bc2-display block italic text-[34px] sm:text-[46px]" style={{ fontWeight: 500 }}>
              mantra
            </motion.span>
          </h2>
          <motion.p variants={rise} className="mt-6 text-[15.5px] leading-[1.8]" style={{ color: "var(--bc2-ink-dim)" }}>
            Bhajan clubbing takes the centuries-old practice of devotional call-and-response singing and puts it on a
            concert rig with a serious sound system. The lyrics stay sacred. The energy goes
            vertical. Nobody drinks, everybody dances, and by the last chorus a room of strangers is one voice.
          </motion.p>
          <motion.p variants={rise} className="mt-4 text-[15.5px] leading-[1.8]" style={{ color: "var(--bc2-ink-dim)" }}>
            Born in Mumbai, now filling halls from Delhi to Kathmandu — and this summer, Jersey City gets its first night.
          </motion.p>
        </motion.div>

        {/* instrument showcase — magnetic, media-rich glass tiles */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {VIBE_FACTS.map((fact, i) => {
            const sc = SHOWCASE[fact.icon];
            return (
              <motion.div
                key={fact.title}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
              >
                <MagneticCard>
                  <div className="group relative h-full">
                    {/* ambient light spill — bleeds past the card on hover */}
                    <span
                      className="pointer-events-none absolute -inset-5 rounded-[30px] opacity-0 blur-2xl transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                      style={{ background: `radial-gradient(60% 60% at 50% 50%, ${sc.glow}59, transparent 75%)` }}
                      aria-hidden
                    />
                    <div className="relative h-full overflow-hidden rounded-[22px] border border-white/10 bg-white/5 backdrop-blur-lg transition-colors duration-500 ease-in-out group-hover:bg-white/10">
                      <ShowcaseMedia sprite={sc.sprite} clip={sc.clip} glow={sc.glow} />
                      <div className="p-5">
                        <h3 className="text-[15px] font-bold text-club-ink">{fact.title}</h3>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
                          {fact.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                </MagneticCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
