// @ts-nocheck
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GitaBook from "./GitaBook3D";

gsap.registerPlugin(ScrollTrigger);

export default function BookShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const headingRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll-driven book rotation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });

      // Staggered text reveal
      const headingLines = headingRef.current?.querySelectorAll(".book-heading-line > span");
      if (headingLines) {
        gsap.fromTo(
          headingLines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Subtitle fade
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: subtitleRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[120vh] bg-[#0a0a0a] py-24 lg:py-32"
    >
      {/* Layout: side-by-side on desktop, stacked on mobile */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row lg:gap-16">
        {/* Left — 3D Book Canvas */}
        <div className="relative h-[60vh] w-full lg:h-[80vh] lg:w-1/2">
          <Canvas
            camera={{ position: [0, 0, 6], fov: 40 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
          >
            <Suspense fallback={null}>
              {/* Lighting — dramatic, cinematic */}
              <ambientLight intensity={0.3} />
              <directionalLight
                position={[5, 5, 5]}
                intensity={1.5}
                color="#FFF5E6"
                castShadow
              />
              <directionalLight
                position={[-3, 2, -2]}
                intensity={0.4}
                color="#D4A843"
              />
              <pointLight position={[0, -3, 3]} intensity={0.3} color="#E8751A" />

              <GitaBook scrollProgress={scrollProgress} />

              <ContactShadows
                position={[0, -1.8, 0]}
                opacity={0.4}
                scale={8}
                blur={2.5}
                far={4}
              />

              {/* Allow user to drag-spin the book */}
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={false}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.8}
              />

              <Environment preset="city" />
            </Suspense>
          </Canvas>

          {/* Radial glow behind the book */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(232,117,26,0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Right — Text content */}
        <div className="flex flex-col items-start lg:w-1/2">
          <p className="mb-4 text-xs font-medium tracking-[0.3em] uppercase text-saffron/60">
            The Sacred Text
          </p>

          <div ref={headingRef}>
            <h2 className="font-serif text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
              <span className="book-heading-line block overflow-hidden">
                <span className="block">Bhagavad Gita</span>
              </span>
              <span className="book-heading-line block overflow-hidden">
                <span className="block text-gradient-saffron">As It Is</span>
              </span>
            </h2>
          </div>

          <p
            ref={subtitleRef}
            className="mt-6 max-w-md text-base leading-relaxed text-white/40 sm:text-lg"
          >
            The definitive guide to life&apos;s deepest questions — translated with
            original Sanskrit text, transliteration, word-for-word meanings, and
            elaborate purports by His Divine Grace A.C. Bhaktivedanta Swami
            Prabhupāda.
          </p>

          <div className="mt-4 flex items-center gap-6 text-white/20">
            <span className="text-sm font-light">18 Chapters</span>
            <span className="text-white/10">|</span>
            <span className="text-sm font-light">700 Verses</span>
            <span className="text-white/10">|</span>
            <span className="text-sm font-light">5,000+ Years</span>
          </div>

          {/* Interaction hint */}
          <p className="mt-10 text-xs tracking-wide text-white/20">
            ← Drag to spin the book
          </p>
        </div>
      </div>
    </section>
  );
}
