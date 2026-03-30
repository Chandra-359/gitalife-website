"use client";

/**
 * Home page — Landing page for Gita Life NYC
 *
 * A marketing/landing page with scroll-driven lotus bloom,
 * parallax depth layers, and seven content sections.
 *
 * The interactive map + program list lives at /programs.
 */

import { useScroll } from "framer-motion";
import Navbar from "@/components/Navbar";
import ScrollLotus from "@/components/home/ScrollLotus";
import ParallaxBackground from "@/components/home/ParallaxBackground";
import HeroSection from "@/components/home/HeroSection";
import WhatIsGitaLife from "@/components/home/WhatIsGitaLife";
import ImpactStats from "@/components/home/ImpactStats";
import OurPrograms from "@/components/home/OurPrograms";
import Testimonials from "@/components/home/Testimonials";
import MeetTheTeam from "@/components/home/MeetTheTeam";
import Footer from "@/components/home/Footer";

export default function Home() {
  const { scrollYProgress, scrollY } = useScroll();

  return (
    <main className="relative bg-[#FFF9F0]">
      <ParallaxBackground scrollY={scrollY} />
      <ScrollLotus scrollYProgress={scrollYProgress} />
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
