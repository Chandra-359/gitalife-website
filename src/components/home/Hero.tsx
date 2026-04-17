"use client";

/**
 * Hero — rotating featured slide.
 *
 * Auto-advances every ~7 seconds unless the user pauses it or interacts.
 * Falls back gracefully to a single static slide if only one is provided.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { HeroSlide } from "@/data/home";
import { C, Icon } from "./icons";

interface HeroProps {
  slides: HeroSlide[];
}

export default function Hero({ slides }: HeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const slide = slides[index];

  return (
    <section
      className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image (animates on slide change) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.imageUrl + index}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.imageUrl}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${C.krishnaDeep}E6 0%, ${C.krishnaDeep}80 45%, ${C.krishnaDeep}CC 80%, ${C.cream} 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(212,168,67,0.12) 0%, transparent 60%)",
        }}
      />

      {/* Top ornamental border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.saffron}, ${C.gold}, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.heading + index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Eyebrow */}
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] mb-6"
              style={{
                background: "rgba(212,168,67,0.12)",
                border: `1px solid ${C.gold}30`,
                color: C.goldLight,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.gold }} />
              {slide.eyebrow}
            </span>

            {/* Heading */}
            <h1 className="text-center text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-white font-serif max-w-3xl">
              {slide.heading}
            </h1>

            {/* Subheading */}
            <p
              className="mt-6 max-w-xl text-center text-base sm:text-lg leading-relaxed"
              style={{ color: "rgba(255,251,242,0.78)" }}
            >
              {slide.subheading}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
              <Link
                href={slide.primaryCtaHref}
                className="group rounded-full px-7 py-3.5 text-[14px] font-semibold uppercase tracking-wider text-white transition-all flex items-center gap-2 hover:scale-[1.03]"
                style={{
                  background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                  boxShadow: `0 0 30px rgba(212,168,67,0.35)`,
                }}
              >
                {slide.primaryCtaLabel}
                <Icon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
                <Link
                  href={slide.secondaryCtaHref}
                  className="rounded-full px-7 py-3.5 text-[14px] font-semibold transition-all hover:bg-white/10"
                  style={{
                    border: `1px solid rgba(240,214,138,0.35)`,
                    color: "rgba(255,251,242,0.85)",
                  }}
                >
                  {slide.secondaryCtaLabel}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        {slides.length > 1 && (
          <div className="flex items-center gap-2 mt-12">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 32 : 8,
                  background: i === index ? C.gold : "rgba(240,214,138,0.3)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom fade to page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-[5] pointer-events-none"
        style={{ background: `linear-gradient(to top, ${C.cream}, transparent)` }}
      />
    </section>
  );
}
