"use client";

/**
 * HomePage — The new hub-and-rails homepage.
 *
 * Scroll narrative (matches the approved wireframe, refreshed for the
 * 2026 cinematic redesign):
 *   1. ScrollProgress (pinned top — the saffron→gold→lotus bar)
 *   2. Navbar
 *   3. Hero (cinematic, parallax, Sanskrit + petals)
 *   4. TodayStrip (verse of the day, japa, reading)
 *   5. Ornament divider
 *   6. WeekRail (this week's classes & harinam)
 *   7. FeaturedEvent (monthly festival / quarterly retreat)
 *   8. ExploreGrid (8 category tiles → sub-pages)
 *   9. ImpactSection (big numbers on sacred indigo)
 *  10. YoutubeWall (videos, wired to @gitalifenyc via Elfsight)
 *  11. InstagramWall (gallery, wired to @gitalifenyc via Elfsight)
 *  12. ConnectFooter (testimonials + subscribe + footer)
 *
 * Each section is its own component under src/components/home/.
 * Content is driven by src/data/home.ts and src/data/verses.ts.
 */

import type { Program } from "@/data/programs";
import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import TodayStrip from "@/components/home/TodayStrip";
import WeekRail from "@/components/home/WeekRail";
import FeaturedEvent from "@/components/home/FeaturedEvent";
import ExploreGrid from "@/components/home/ExploreGrid";
import ImpactSection from "@/components/home/ImpactSection";
import YoutubeWall from "@/components/home/YoutubeWall";
import InstagramWall from "@/components/home/InstagramWall";
import ConnectFooter from "@/components/home/ConnectFooter";
import ScrollProgress from "@/components/home/ScrollProgress";
import { HERO_SLIDES } from "@/data/home";

interface HomePageProps {
  programs: Program[];
}

/** Hand-inked ornamental divider between sections on parchment surfaces. */
function OrnamentDivider() {
  return (
    <div
      className="ornament-ink"
      style={{ background: "var(--bg-parchment)" }}
      aria-hidden
    />
  );
}

export default function HomePage({ programs }: HomePageProps) {
  const testimonials = programs
    .filter((p) => p.testimonial && p.testimonialAuthor)
    .slice(0, 3);

  return (
    <div className="min-h-screen surface-parchment">
      <ScrollProgress />
      <Navbar isHomepage />
      <Hero slides={HERO_SLIDES} />
      <TodayStrip />
      <OrnamentDivider />
      <WeekRail />
      <FeaturedEvent />
      <ExploreGrid />
      <ImpactSection />
      <YoutubeWall />
      <InstagramWall />
      <ConnectFooter testimonials={testimonials} />
    </div>
  );
}
