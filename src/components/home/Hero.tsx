"use client";

/**
 * Hero — cinematic, scroll-stopping experience.
 *
 * Three slide presentations (see HeroVisual):
 *   ornament → gradient + mandala SVG (no photo). Editorial / identity.
 *   framed   → photo in a matted frame, split-layout with text.
 *   photo    → full-bleed photo with heavy gradient mask. Editorial "this Friday".
 *
 * Shared across all three:
 *   - deep-indigo gradient shell with subtle film-grain texture
 *   - drifting lotus petals (pure CSS, reduced-motion aware)
 *   - mouse-follow warm aura
 *   - scroll parallax on text
 *   - consistent CTA pair, slide indicators, and scroll cue
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import type { HeroSlide, HeroVisual } from "@/data/home";
import { C, Icon } from "./icons";

interface HeroProps {
  slides: HeroSlide[];
}

// Petal positions pre-computed so they stagger without React state noise.
const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7 + (i % 3) * 4) % 100}%`,
  delay: `${(i * 1.3) % 12}s`,
  duration: `${14 + (i % 5) * 2}s`,
  driftX: `${(i % 2 ? 1 : -1) * (30 + (i * 7) % 90)}px`,
  size: 8 + (i % 4) * 3,
  opacity: 0.35 + (i % 3) * 0.12,
}));

function accentHex(accent: "saffron" | "gold" | "peacock" | "lotus" = "gold"): string {
  switch (accent) {
    case "saffron": return C.saffron;
    case "peacock": return C.peacock;
    case "lotus":   return C.lotusPink;
    case "gold":
    default:        return C.gold;
  }
}

/* ================================================================== */
/*  MandalaSVG — large ornamental background glyph (ornament visual)   */
/* ================================================================== */
function MandalaSVG({ stroke }: { stroke: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className="w-full h-full"
      fill="none"
      stroke={stroke}
      strokeWidth="0.9"
      aria-hidden
    >
      <g opacity="0.55">
        {/* Outer ring */}
        <circle cx="300" cy="300" r="280" />
        <circle cx="300" cy="300" r="260" strokeDasharray="2 6" />
        {/* Inner concentric rings */}
        <circle cx="300" cy="300" r="200" />
        <circle cx="300" cy="300" r="150" />
        <circle cx="300" cy="300" r="110" />
        <circle cx="300" cy="300" r="60" />
        {/* 16 lotus petals (rotated rhombic paths) */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 360) / 16;
          return (
            <path
              key={i}
              d="M300 90 C 320 160 320 240 300 300 C 280 240 280 160 300 90 Z"
              transform={`rotate(${a} 300 300)`}
              strokeWidth="0.8"
              opacity="0.7"
            />
          );
        })}
        {/* 8 spokes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 360) / 8;
          return (
            <line
              key={i}
              x1="300" y1="20" x2="300" y2="580"
              transform={`rotate(${a} 300 300)`}
              opacity="0.35"
            />
          );
        })}
        {/* Om bindu */}
        <circle cx="300" cy="300" r="6" fill={stroke} stroke="none" opacity="0.85" />
      </g>
    </svg>
  );
}

/* ================================================================== */
/*  OrnamentVisual — no photo, layered gradients + mandala             */
/* ================================================================== */
function OrnamentVisual({ accent }: { accent: "saffron" | "gold" | "peacock" | "lotus" | undefined }) {
  const stroke = accentHex(accent);
  return (
    <div className="absolute inset-0 z-0">
      {/* Soft dawn gradient layers */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 120%, ${C.saffron}40 0%, transparent 55%),
            radial-gradient(ellipse at 50% 30%, ${C.gold}22 0%, transparent 60%),
            linear-gradient(175deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 60%, #14235E 100%)
          `,
        }}
      />
      {/* Slow-rotating mandala */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "min(92vh, 1100px)", aspectRatio: "1 / 1" }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
        >
          <MandalaSVG stroke={`${stroke}AA`} />
        </motion.div>
      </motion.div>
      {/* Secondary counter-rotating mandala for depth */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
        style={{ width: "min(70vh, 800px)", aspectRatio: "1 / 1", opacity: 0.35 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
      >
        <MandalaSVG stroke={`${C.goldLight}55`} />
      </motion.div>
    </div>
  );
}

/* ================================================================== */
/*  PhotoVisual — full-bleed photo with heavy gradient mask            */
/* ================================================================== */
function PhotoVisual({
  imageUrl,
  imageFocal,
  reduce,
}: {
  imageUrl: string;
  imageFocal?: string;
  reduce: boolean;
}) {
  return (
    <div className="absolute inset-0 z-0">
      <div className={reduce ? "absolute inset-0" : "absolute inset-0 animate-ken-burns"}>
        <Image
          src={imageUrl}
          alt=""
          aria-hidden
          fill
          priority
          className="object-cover"
          style={{ objectPosition: imageFocal ?? "center 35%" }}
          sizes="100vw"
        />
      </div>
      {/* Side + bottom vignette so awkward crops read as intentional */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 20%, ${C.krishnaDeep}55 70%, ${C.krishnaDeep}CC 100%),
            linear-gradient(90deg, ${C.krishnaDeep}A6 0%, transparent 25%, transparent 75%, ${C.krishnaDeep}A6 100%),
            linear-gradient(180deg, ${C.krishnaDeep}A6 0%, ${C.krishnaDeep}33 35%, ${C.krishnaDeep}DD 85%, ${C.krishnaDeep} 100%)
          `,
        }}
      />
    </div>
  );
}

/* ================================================================== */
/*  FramedVisual — matted poster frame on one side of a split layout   */
/* ================================================================== */
function FramedVisual({
  imageUrl,
  imageFocal,
}: {
  imageUrl: string;
  imageFocal?: string;
}) {
  // Uses a thin gold double-stroke with a warm mat so the artwork reads at
  // its true aspect, never stretched. Rendered at a fixed aspect ratio.
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[440px] mx-auto"
    >
      {/* Soft glow behind frame */}
      <div
        className="absolute -inset-8 rounded-[32px] -z-10 opacity-80 blur-2xl"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${C.saffron}55, ${C.gold}22 40%, transparent 70%)`,
        }}
      />
      {/* Outer gold stroke */}
      <div
        className="rounded-[24px] p-2"
        style={{
          background: `linear-gradient(145deg, ${C.gold}, ${C.goldLight} 45%, ${C.saffron} 100%)`,
          boxShadow:
            "0 30px 60px -20px rgba(8,14,42,0.65), 0 10px 20px -10px rgba(212,168,67,0.45)",
        }}
      >
        {/* Warm mat */}
        <div
          className="rounded-[18px] p-3"
          style={{
            background:
              "linear-gradient(160deg, #FFF8E7 0%, #F6E9CA 100%)",
          }}
        >
          {/* Art window */}
          <div className="relative aspect-[4/5] w-full rounded-[10px] overflow-hidden">
            <Image
              src={imageUrl}
              alt=""
              aria-hidden
              fill
              priority
              className="object-cover"
              style={{ objectPosition: imageFocal ?? "center" }}
              sizes="(max-width: 768px) 80vw, 440px"
            />
            {/* Subtle inner shadow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow:
                  "inset 0 0 40px rgba(15,27,77,0.25), inset 0 0 0 1px rgba(15,27,77,0.08)",
              }}
            />
          </div>
          {/* Plaque */}
          <div className="mt-3 flex items-center justify-center gap-2 text-center">
            <span
              className="h-px w-8"
              style={{ background: `${C.krishnaBlue}40` }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: C.krishnaBlue }}
            >
              Gita Life NYC
            </span>
            <span
              className="h-px w-8"
              style={{ background: `${C.krishnaBlue}40` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Hero (main component)                                              */
/* ================================================================== */
export default function Hero({ slides }: HeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.6, 0]);

  const [mouse, setMouse] = useState({ x: 50, y: 40 });
  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  useEffect(() => {
    if (paused || reduce || slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(id);
  }, [paused, reduce, slides.length]);

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  // Keyboard arrows navigate slides while the hero is hovered / focused.
  useEffect(() => {
    if (slides.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    const el = sectionRef.current;
    el?.addEventListener("keydown", onKey);
    return () => el?.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  const slide = slides[index];
  const v: HeroVisual = slide.visual;
  const isFramed = v.type === "framed";
  const frameSide: "left" | "right" = isFramed ? (v.side ?? "right") : "right";

  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      className="relative min-h-[92vh] flex items-center overflow-hidden isolate outline-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onMouseMove={onMouseMove}
      aria-label="Gita Life NYC — featured"
      aria-roledescription="carousel"
    >
      {/* ---- Per-slide visual background ---- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${v.type}-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          {v.type === "ornament" && <OrnamentVisual accent={v.accent} />}
          {v.type === "photo" && (
            <PhotoVisual
              imageUrl={v.imageUrl}
              imageFocal={v.imageFocal}
              reduce={!!reduce}
            />
          )}
          {v.type === "framed" && (
            <div className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 50% 120%, ${C.saffron}30 0%, transparent 55%),
                  linear-gradient(175deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 70%, #14235E 100%)
                `,
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ---- Mouse-follow warm aura ---- */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none transition-opacity"
        style={{
          background: `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, rgba(232,117,26,0.16), rgba(212,168,67,0.08) 35%, transparent 65%)`,
        }}
        aria-hidden
      />

      {/* ---- Top ornamental border ---- */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.saffron}, ${C.gold}, transparent)`,
        }}
      />

      {/* ---- Drifting lotus petals (shared across all slide types) ---- */}
      {!reduce && (
        <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden" aria-hidden>
          {PETALS.map((p, i) => (
            <span
              key={i}
              className="absolute top-0 animate-petal"
              style={
                {
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  opacity: p.opacity,
                  ["--drift-x" as string]: p.driftX,
                  ["--drift-dur" as string]: p.duration,
                  ["--drift-delay" as string]: p.delay,
                } as React.CSSProperties
              }
            >
              <svg viewBox="0 0 20 20" className="w-full h-full" fill="none">
                <path
                  d="M10 2 C14 6 14 14 10 18 C6 14 6 6 10 2 Z"
                  fill="url(#petal-grad)"
                />
                <defs>
                  <linearGradient id="petal-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F0D68A" />
                    <stop offset="100%" stopColor="#E8751A" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          ))}
        </div>
      )}

      {/* ---- Content layer ---- */}
      <motion.div
        className="relative z-10 w-full mx-auto px-6 max-w-6xl"
        style={{ y: textY, opacity: textOpacity }}
      >
        <div
          className={`grid items-center gap-10 ${
            isFramed ? "md:grid-cols-[1fr_minmax(0,440px)]" : "grid-cols-1"
          }`}
        >
          {/* Text column */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.heading + index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col ${
                isFramed
                  ? "items-center md:items-start text-center md:text-left"
                  : "items-center text-center mx-auto max-w-4xl"
              } ${isFramed && frameSide === "left" ? "md:order-2" : ""}`}
            >
              {/* Eyebrow pill */}
              <span className="pill-chip pill-chip-gold mb-7">
                <span
                  className="h-1.5 w-1.5 rounded-full animate-glow-pulse"
                  style={{ background: C.gold }}
                />
                {slide.eyebrow}
              </span>

              {/* Optional Sanskrit identity line */}
              {slide.sanskrit && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.15 }}
                  className="sanskrit mb-3 text-lg sm:text-2xl leading-[1.5] max-w-2xl"
                  style={{ color: "rgba(240,214,138,0.9)" }}
                  lang="sa"
                >
                  {slide.sanskrit}
                </motion.p>
              )}
              {slide.sanskritMeaning && (
                <p
                  className="mb-6 text-[12px] sm:text-[13px] font-medium italic max-w-xl"
                  style={{ color: "rgba(240,214,138,0.55)", letterSpacing: "0.02em" }}
                >
                  — {slide.sanskritMeaning}
                </p>
              )}

              {/* Main headline */}
              <h1 className={`display-xl text-gradient-warm-glow ${
                isFramed ? "max-w-2xl" : "max-w-4xl"
              }`}>
                {slide.heading}
              </h1>

              {/* Subheading */}
              <p
                className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed"
                style={{ color: "rgba(255,251,242,0.78)" }}
              >
                {slide.subheading}
              </p>

              {/* CTAs */}
              <div className={`flex flex-wrap items-center gap-3 mt-9 ${
                isFramed ? "justify-center md:justify-start" : "justify-center"
              }`}>
                <Link
                  href={slide.primaryCtaHref}
                  className="btn-primary-gradient group rounded-full px-8 py-4 text-[13px] font-bold uppercase tracking-[0.12em] flex items-center gap-2"
                >
                  {slide.primaryCtaLabel}
                  <Icon
                    name="arrowRight"
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
                  <Link
                    href={slide.secondaryCtaHref}
                    className="btn-ghost-light rounded-full px-7 py-4 text-[13px] font-semibold uppercase tracking-[0.12em]"
                  >
                    {slide.secondaryCtaLabel}
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Framed-art column (only for framed visual) */}
          {isFramed && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`frame-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className={frameSide === "left" ? "md:order-1" : ""}
              >
                <FramedVisual imageUrl={v.imageUrl} imageFocal={v.imageFocal} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Slide indicators */}
        {slides.length > 1 && (
          <div
            className="flex items-center justify-center gap-2 mt-12"
            role="tablist"
            aria-label="Hero slides"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={i === index}
                role="tab"
                className="group h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 36 : 10,
                  background: i === index ? C.gold : "rgba(240,214,138,0.3)",
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ---- Prev / next arrow buttons ---- */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="group absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            style={{
              background: "rgba(255,251,242,0.08)",
              border: `1px solid ${C.gold}40`,
              color: C.goldLight,
            }}
          >
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            >
              <path d="M10 3 L5 8 L10 13" />
            </svg>
          </button>

          <button
            onClick={goNext}
            aria-label="Next slide"
            className="group absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            style={{
              background: "rgba(255,251,242,0.08)",
              border: `1px solid ${C.gold}40`,
              color: C.goldLight,
            }}
          >
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              <path d="M6 3 L11 8 L6 13" />
            </svg>
          </button>
        </>
      )}

      {/* ---- Scroll cue ---- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: "rgba(240,214,138,0.55)" }}
        >
          Scroll
        </span>
        <span
          className="flex h-8 w-5 items-start justify-center rounded-full pt-1.5 animate-scroll-cue"
          style={{ border: "1px solid rgba(240,214,138,0.35)" }}
        >
          <span
            className="h-1.5 w-0.5 rounded-full"
            style={{ background: C.goldLight }}
          />
        </span>
      </div>

      {/* ---- Bottom fade to page background ---- */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-[5] pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${C.cream}, transparent)`,
        }}
      />
    </section>
  );
}
