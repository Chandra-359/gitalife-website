"use client";

/**
 * HomePage — The new hub-and-rails homepage.
 *
 * Structure (matches the approved wireframe):
 *   1. Navbar
 *   2. Hero (rotating featured slide)
 *   3. TodayStrip (verse of the day, japa, reading)
 *   4. WeekRail (this week's classes & harinam)
 *   5. FeaturedEvent (monthly festival / quarterly retreat)
 *   6. ExploreGrid (8 category tiles → sub-pages)
 *   7. ImpactSection (big numbers, charity:water mood)
 *   8. InstagramWall (gallery, wired to @gitalifenyc)
 *   9. ConnectFooter (testimonials + subscribe + footer)
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
import InstagramWall from "@/components/home/InstagramWall";
import ConnectFooter from "@/components/home/ConnectFooter";
import { HERO_SLIDES } from "@/data/home";

interface HomePageProps {
  programs: Program[];
}

export default function HomePage({ programs }: HomePageProps) {
  const testimonials = programs
    .filter((p) => p.testimonial && p.testimonialAuthor)
    .slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: "#FFFBF2" }}>
      <Navbar isHomepage />
      <Hero slides={HERO_SLIDES} />
      <TodayStrip />
      <WeekRail />
      <FeaturedEvent />
      <ExploreGrid />
      <ImpactSection />
      <InstagramWall />
      <ConnectFooter testimonials={testimonials} />
    </div>
  );
}
