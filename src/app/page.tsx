/**
 * Home page — Landing page for Gita Life NYC
 *
 * A proper marketing/landing page with hero, about, stats,
 * program categories, testimonials, team, and footer sections.
 *
 * The interactive map + program list lives at /programs.
 */

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import WhatIsGitaLife from "@/components/home/WhatIsGitaLife";
import ImpactStats from "@/components/home/ImpactStats";
import OurPrograms from "@/components/home/OurPrograms";
import Testimonials from "@/components/home/Testimonials";
import MeetTheTeam from "@/components/home/MeetTheTeam";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="bg-[#FFF9F0]">
      <Navbar />
      <HeroSection />
      <WhatIsGitaLife />
      <ImpactStats />
      <OurPrograms />
      <Testimonials />
      <MeetTheTeam />
      <Footer />
    </main>
  );
}
