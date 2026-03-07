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
      // Staggered clip-mask reveal — each line slides up from behind its mask
      const lineWrappers = textRef.current?.querySelectorAll(".hero-line");
      if (lineWrappers) {
        const innerSpans = textRef.current?.querySelectorAll(".hero-line > span");
        if (innerSpans) {
          gsap.fromTo(
            innerSpans,
            {
              yPercent: 110,
            },
            {
              yPercent: 0,
              duration: 1.4,
              stagger: 0.1,
              ease: "power4.out",
              delay: 0.1,
            }
          );
        }
      }

      // CTA elements — smooth fade up
      gsap.fromTo(
        ".hero-cta",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.9 }
      );

      // Scroll indicator
      gsap.fromTo(
        ".scroll-indicator",
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power4.out", delay: 1.8 }
      );

      // Parallax on scroll — text fades, video scales DOWN (premium feel)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      tl.to(textRef.current, { y: -120, opacity: 0, ease: "none" }, 0);
      // Scale DOWN from 1 to 0.9 — the Locomotive-style "receding" parallax
      tl.to(videoRef.current, { scale: 0.9, ease: "none" }, 0);
      tl.to(overlayRef.current, { opacity: 0.9, ease: "none" }, 0);
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
        className="absolute inset-0 h-full w-full scale-[1.05] object-cover"
        poster="/hero-poster.jpg"
      >
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
      >
        <div>
          <h1 className="text-5xl text-offwhite sm:text-7xl lg:text-8xl xl:text-9xl">
            <span className="hero-line block overflow-hidden">
              <span className="block will-change-transform">DISCOVER</span>
            </span>
            <span className="hero-line block overflow-hidden">
              <span className="block will-change-transform text-gradient-saffron">THE GITA.</span>
            </span>
            <span className="hero-line block overflow-hidden">
              <span className="block will-change-transform">TRANSFORM</span>
            </span>
            <span className="hero-line block overflow-hidden">
              <span className="block will-change-transform text-gradient-saffron">YOUR LIFE.</span>
            </span>
          </h1>
        </div>

        <p className="hero-cta mx-auto mt-6 max-w-md font-sans text-lg font-light text-offwhite/40 sm:text-xl">
          Weekly programs, retreats, and a community that feels like family —
          right here in NYC.
        </p>

        <div className="hero-cta mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/get-connected"
            className="glow-pulse glow-saffron rounded-full bg-saffron px-8 py-4 font-sans text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-saffron-light"
          >
            Get Connected
          </Link>
          <a
            href="#programs"
            className="rounded-full border border-white/10 px-8 py-4 font-sans text-lg font-medium text-offwhite/60 transition-all duration-300 hover:border-white/30 hover:text-offwhite"
          >
            Explore Programs
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-offwhite/30">
        <span className="label">
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
