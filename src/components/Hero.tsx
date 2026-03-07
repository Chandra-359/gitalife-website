"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroParticles = dynamic(() => import("@/components/HeroParticles"), {
  ssr: false,
});

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Entrance choreography ──

      // 1. Video scale-in from 1.15 to 1.05 (cinematic zoom settle)
      gsap.fromTo(
        videoRef.current,
        { scale: 1.15 },
        { scale: 1.05, duration: 2.4, ease: "power3.out", delay: 0.2 }
      );

      // 2. Overlay brightens (fades from 90% to normal)
      gsap.fromTo(
        overlayRef.current,
        { opacity: 1 },
        { opacity: 0.55, duration: 2.2, ease: "power2.out", delay: 0.3 }
      );

      // 3. Staggered clip-mask reveal — each line slides up
      const innerSpans = textRef.current?.querySelectorAll(".hero-line > span");
      if (innerSpans) {
        gsap.fromTo(
          innerSpans,
          { yPercent: 120, rotateX: 30 },
          {
            yPercent: 0,
            rotateX: 0,
            duration: 1.6,
            stagger: 0.12,
            ease: "power4.out",
            delay: 0.4,
          }
        );
      }

      // 4. Horizontal divider draws in from center
      gsap.fromTo(
        dividerRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "power4.inOut", delay: 1.0 }
      );

      // 5. Subtitle + CTA — staggered fade up
      gsap.fromTo(
        ".hero-cta",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          stagger: 0.15,
          ease: "power4.out",
          delay: 1.1,
        }
      );

      // 6. Scroll indicator — late entrance
      gsap.fromTo(
        ".scroll-indicator",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1.5, ease: "power4.out", delay: 2.2 }
      );

      // ── Scroll parallax ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      // Text rises and fades faster than video (depth separation)
      tl.to(textRef.current, { y: -180, opacity: 0, ease: "none" }, 0);
      // Video scales down — Locomotive-style receding
      tl.to(videoRef.current, { scale: 0.88, ease: "none" }, 0);
      // Overlay darkens on scroll
      tl.to(overlayRef.current, { opacity: 0.95, ease: "none" }, 0);
      // Divider fades
      tl.to(dividerRef.current, { opacity: 0, y: -60, ease: "none" }, 0);
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
        className="absolute inset-0 h-full w-full scale-[1.15] object-cover"
        poster="/hero-poster.jpg"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"
      />

      {/* Particle field — behind text, above video */}
      <HeroParticles />

      {/* Film grain overlay */}
      <div className="hero-grain pointer-events-none absolute inset-0 z-[2] opacity-[0.03]" />

      {/* Content */}
      <div ref={textRef} className="relative z-10 px-6 text-center">
        <div style={{ perspective: "800px" }}>
          <h1 className="text-5xl text-offwhite sm:text-7xl lg:text-8xl xl:text-9xl">
            <span className="hero-line block overflow-hidden">
              <span className="block will-change-transform">DISCOVER</span>
            </span>
            <span className="hero-line block overflow-hidden">
              <span className="block will-change-transform text-gradient-saffron text-glow-saffron">
                THE GITA.
              </span>
            </span>
            <span className="hero-line block overflow-hidden">
              <span className="block will-change-transform">TRANSFORM</span>
            </span>
            <span className="hero-line block overflow-hidden">
              <span className="block will-change-transform text-gradient-saffron text-glow-saffron">
                YOUR LIFE.
              </span>
            </span>
          </h1>
        </div>

        {/* Animated horizontal divider */}
        <div
          ref={dividerRef}
          className="mx-auto mt-6 h-px w-48 origin-center bg-gradient-to-r from-transparent via-saffron/60 to-transparent"
          style={{ transform: "scaleX(0)" }}
        />

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
        <span className="label">Scroll to explore</span>
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
