"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Smooth staggered text reveal with clip-path mask
      const lines = textRef.current?.querySelectorAll(".hero-line");
      if (lines) {
        gsap.fromTo(
          lines,
          {
            clipPath: "inset(100% 0% 0% 0%)",
            y: 40,
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            duration: 1.4,
            stagger: 0.12,
            ease: "power3.out",
            delay: 0.2,
          }
        );
      }

      // CTA elements fade in smoothly
      gsap.fromTo(
        ".hero-cta",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power2.out", delay: 1 }
      );

      // Scroll indicator
      gsap.fromTo(
        ".scroll-indicator",
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.out", delay: 2 }
      );

      // Parallax on scroll — text rises, video zooms, overlay darkens
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      tl.to(textRef.current, { y: -150, opacity: 0, ease: "none" }, 0);
      tl.to(videoRef.current, { scale: 1.2, ease: "none" }, 0);
      tl.to(overlayRef.current, { opacity: 0.85, ease: "none" }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen items-center justify-center overflow-hidden"
    >
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        poster="/hero-poster.jpg"
      >
        {/* Replace with actual video */}
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"
      />

      {/* Content */}
      <div
        ref={textRef}
        className="relative z-10 px-6 text-center"
        style={{ perspective: "1000px" }}
      >
        <div>
          <h1 className="font-serif text-5xl font-bold leading-[0.95] tracking-[-0.02em] text-white sm:text-7xl lg:text-8xl xl:text-9xl">
            <span className="hero-line block overflow-hidden"><span className="block">DISCOVER</span></span>
            <span className="hero-line block overflow-hidden text-gradient-saffron"><span className="block">THE GITA.</span></span>
            <span className="hero-line block overflow-hidden"><span className="block">TRANSFORM</span></span>
            <span className="hero-line block overflow-hidden text-gradient-saffron"><span className="block">YOUR LIFE.</span></span>
          </h1>
        </div>

        <p className="hero-cta mx-auto mt-6 max-w-md text-lg text-white/60 sm:text-xl">
          Weekly programs, retreats, and a community that feels like family —
          right here in NYC.
        </p>

        <div className="hero-cta mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/get-connected"
            className="glow-pulse rounded-full bg-saffron px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-saffron-light"
          >
            Get Connected
          </Link>
          <a
            href="#programs"
            className="rounded-full border border-white/20 px-8 py-4 text-lg font-medium text-white/80 transition-all duration-300 hover:border-white/40 hover:text-white"
          >
            Explore Programs
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/40">
        <span className="text-xs tracking-widest uppercase">
          Scroll to explore
        </span>
        <svg
          className="scroll-bounce h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
