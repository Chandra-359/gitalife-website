"use client";

import { useState } from "react";
import Preloader from "@/components/Preloader";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TextReveal from "@/components/TextReveal";
import Stats from "@/components/Stats";
import Programs from "@/components/Programs";
import Testimonials from "@/components/Testimonials";
import Team from "@/components/Team";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <main>
      <Preloader onComplete={() => setPreloaderDone(true)} />
      <div
        className={`transition-opacity duration-700 ${
          preloaderDone ? "opacity-100" : "opacity-0"
        }`}
      >
        <Navigation />
        <Hero />
        <TextReveal />
        <Stats />
        <Programs />
        <Testimonials />
        <Team />
        <FinalCTA />
        <Footer />
      </div>
    </main>
  );
}
