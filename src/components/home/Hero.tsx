"use client";

/**
 * Hero — simple, mobile-first hero section.
 * Static layout, no animations. Title, subtitle, two CTAs, optional image.
 */

import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "@/data/home";
import PaperTextureBg from "@/components/PaperTextureBg";

interface HeroProps {
  slides: HeroSlide[];
}

function getHeroImage(slides: HeroSlide[]): string | null {
  for (const slide of slides) {
    if (slide.visual.type === "photo" || slide.visual.type === "framed") {
      return slide.visual.imageUrl;
    }
  }
  return null;
}

export default function Hero({ slides }: HeroProps) {
  // Show the first slide's content as the primary hero. Carousel/animation removed.
  const slide = slides[0];
  const image = getHeroImage(slides);

  return (
    <section
      className="surface-sacred relative w-full overflow-hidden px-5 pt-24 pb-14 sm:px-8 sm:pt-36 sm:pb-24"
      aria-label="Welcome to Gita Life NYC"
    >
      <PaperTextureBg />
      {/* Soft gold radial glow for depth without breaking the paper feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 0%, rgba(237,214,152,0.18), transparent 70%), radial-gradient(50% 60% at 100% 100%, rgba(217,105,26,0.16), transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="grid items-center gap-8 sm:gap-10 md:grid-cols-2 md:gap-14">
          {/* Image — shown above the copy on mobile, beside it on desktop */}
          {image && (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[260px] overflow-hidden rounded-[22px] shadow-[0_24px_60px_-22px_rgba(0,0,0,0.65)] ring-1 ring-white/10 sm:max-w-sm md:order-last md:max-w-none">
              <Image
                src={image}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 60vw, 50vw"
              />
            </div>
          )}

          {/* Text */}
          <div className="text-center md:text-left">
            <span className="pill-chip pill-chip-gold mb-5 sm:mb-6">
              {slide.eyebrow}
            </span>

            <h1 className="display-xl text-white">
              {slide.heading}
            </h1>

            <p className="mt-5 max-w-xl mx-auto text-base leading-relaxed text-white/85 sm:text-lg md:mx-0">
              {slide.subheading}
            </p>

            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3">
              <Link
                href={slide.primaryCtaHref}
                className="btn-primary-gradient inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
              >
                {slide.primaryCtaLabel}
              </Link>
              {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
                <Link
                  href={slide.secondaryCtaHref}
                  className="btn-ghost-light inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
                >
                  {slide.secondaryCtaLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
