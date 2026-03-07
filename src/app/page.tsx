"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TextReveal from "@/components/TextReveal";
import Stats from "@/components/Stats";

const BookShowcase = dynamic(() => import("@/components/BookShowcase"), {
  ssr: false,
});
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
      <SmoothScroll>
        <div
          className={`transition-opacity duration-700 ${
            preloaderDone ? "opacity-100" : "opacity-0"
          }`}
        >
          <Navigation />
          <Hero />
          <TextReveal />
          <BookShowcase />
          <Stats />
          <Programs />
          <Testimonials />
          <Team />
          <FinalCTA />
          <Footer />
        </div>
      </SmoothScroll>
    </main>
  );
}
