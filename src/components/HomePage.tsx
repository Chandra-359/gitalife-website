"use client";

/**
 * HomePage — Simple, mobile-first homepage.
 *
 * Sections:
 *   1. Navbar
 *   2. Hero
 *   3. TodayStrip (verse + japa + reading)
 *   4. WeekRail (this week's classes)
 *   5. UpcomingPrograms (Luma events)
 *   6. ExploreGrid (categories)
 *   7. ImpactSection (stats)
 *   8. YoutubeWall + InstagramWall
 *   9. ConnectFooter (testimonials + subscribe + footer)
 */

import type { Program } from "@/data/programs";
import type { LumaEvent } from "@/lib/luma";
import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import TodayStrip from "@/components/home/TodayStrip";
import WeekRail from "@/components/home/WeekRail";
import UpcomingPrograms from "@/components/home/UpcomingPrograms";
import ExploreGrid from "@/components/home/ExploreGrid";
import ImpactSection from "@/components/home/ImpactSection";
import YoutubeWall from "@/components/home/YoutubeWall";
import InstagramWall from "@/components/home/InstagramWall";
import ConnectFooter from "@/components/home/ConnectFooter";
import { HERO_SLIDES } from "@/data/home";

interface HomePageProps {
  programs: Program[];
  events: LumaEvent[];
}

export default function HomePage({ programs, events }: HomePageProps) {
  const testimonials = programs
    .filter((p) => p.testimonial && p.testimonialAuthor)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Navbar isHomepage />
      <Hero slides={HERO_SLIDES} />
      <TodayStrip />
      <WeekRail />
      <UpcomingPrograms events={events} />
      <ExploreGrid />
      <ImpactSection />
      <YoutubeWall />
      <InstagramWall />
      <ConnectFooter testimonials={testimonials} />
    </div>
  );
}
