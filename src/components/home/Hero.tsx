"use client";

/**
 * Hero — cinematic, scroll-stopping experience.
 *
 * Design notes (references: Paramount+ landing, Pangea splash):
 *   - Full-bleed background with Ken Burns slow zoom
 *   - Warm deep-indigo gradient stack for high CTA contrast
 *   - Drifting lotus petals (pure CSS, reduced-motion aware)
 *   - Mouse-follow radial glow for depth
 *   - Optional Sanskrit + transliteration for identity slides
 *   - Playfair display-xl headline with warm-glow gradient
 *   - Primary gradient pill CTA + ghost secondary
 *   - Parallax on scroll (heading lifts, image settles)
 *   - Bottom scroll cue
 *   - Auto-advance (7s) pauses on hover / focus / prefers-reduced-motion
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
import type { HeroSlide } from "@/data/home";
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

export default function Hero({ slides }: HeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax: text and image respond subtly to scroll position.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.6, 0]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  // Mouse-follow radial glow
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

  const slide = slides[index];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden isolate"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onMouseMove={onMouseMove}
      aria-label="Gita Life NYC — featured"
    >
      {/* ---- Background image with Ken Burns slow zoom + scroll parallax ---- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.imageUrl + index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
          style={{ y: imageY, scale: imageScale }}
        >
          <div className={reduce ? "absolute inset-0" : "absolute inset-0 animate-ken-burns"}>
            <Image
              src={slide.imageUrl}
              alt=""
              aria-hidden
              fill
              priority
              className="object-cover"
              style={{ objectPosition: slide.imageFocal ?? "center 35%" }}
              sizes="100vw"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ---- Gradient stack (Paramount+ style: light top → dark bottom) ---- */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `linear-gradient(180deg,
            ${C.krishnaDeep}A8 0%,
            ${C.krishnaDeep}55 35%,
            ${C.krishnaDeep}D9 75%,
            ${C.krishnaDeep} 100%)`,
        }}
      />

      {/* ---- Mouse-follow warm aura ---- */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none transition-opacity"
        style={{
          background: `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, rgba(232,117,26,0.18), rgba(212,168,67,0.08) 35%, transparent 65%)`,
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

      {/* ---- Drifting lotus petals (pure CSS) ---- */}
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

      {/* ---- Content ---- */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-6 max-w-4xl text-center"
        style={{ y: textY, opacity: textOpacity }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.heading + index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
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
            <h1 className="display-xl text-gradient-warm-glow max-w-4xl">
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
            <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
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

        {/* Slide indicators */}
        {slides.length > 1 && (
          <div className="flex items-center gap-2 mt-12" role="tablist" aria-label="Hero slides">
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
