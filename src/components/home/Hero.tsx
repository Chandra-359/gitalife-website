"use client";

/**
 * Hero — simple, mobile-first hero section.
 * Static layout, no animations. Title, subtitle, two CTAs, optional image.
 */

import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "@/data/home";

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
      className="relative w-full px-5 pt-20 pb-12 sm:px-8 sm:pt-32 sm:pb-20"
      style={{ background: "var(--krishna-blue-deep)" }}
      aria-label="Welcome to Gita Life NYC"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-6 sm:gap-8 md:grid-cols-2 md:gap-12">
          {/* Image — shown above the copy on mobile, beside it on desktop */}
          {image && (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] sm:max-w-sm md:order-last md:max-w-none md:shadow-none">
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
            <span className="pill-chip pill-chip-gold mb-4 sm:mb-5">
              {slide.eyebrow}
            </span>

            <h1 className="display-xl text-white">
              {slide.heading}
            </h1>

            <p className="mt-4 text-base leading-relaxed sm:text-lg text-white/80 max-w-xl mx-auto md:mx-0">
              {slide.subheading}
            </p>

            <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3">
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
