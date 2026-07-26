"use client";

/**
 * HomePage — Simple, mobile-first homepage.
 *
 * Sections (ordered for a first-time seeker → registration funnel):
 *   1. Navbar
 *   2. Hero (philosophy-first invitation)
 *   3. BigQuestions (the questions a curious visitor is already asking)
 *   4. WeekRail (this week's classes — the registration ask)
 *   5. UpcomingPrograms (Luma events)
 *   6. TodayStrip (verse + japa + reading — for returning practitioners)
 *   7. ExploreGrid (categories)
 *   8. ImpactSection (stats)
 *   9. YoutubeWall + InstagramWall
 *  10. ConnectFooter (testimonials + subscribe + footer)
 */

import type { Program } from "@/data/programs";
import type { LumaEvent } from "@/lib/luma";
import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import BigQuestions from "@/components/home/BigQuestions";
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
    <div className="min-h-screen">
      <Navbar isHomepage />
      <Hero slides={HERO_SLIDES} />
      <BigQuestions />
      <WeekRail events={events} />
      <UpcomingPrograms events={events} />
      <TodayStrip />
      <ExploreGrid />
      <ImpactSection />
      <YoutubeWall />
      <InstagramWall />
      <ConnectFooter testimonials={testimonials} />
    </div>
  );
}
