"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface LineConfig {
  text: string;
  className: string;
  delay: number;
}

const lines: LineConfig[] = [
  {
    text: "GITA LIFE",
    className: "font-serif text-5xl font-bold text-white sm:text-7xl lg:text-8xl tracking-tight",
    delay: 0.3,
  },
  {
    text: "NYC",
    className: "font-serif text-5xl font-bold sm:text-7xl lg:text-8xl tracking-tight text-gradient-saffron",
    delay: 0.5,
  },
  {
    text: "Discover the Gita. Transform Your Life.",
    className: "text-base text-white/40 sm:text-lg lg:text-xl font-light tracking-wide",
    delay: 0.9,
  },
];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"reveal" | "fadeout" | "done">("reveal");
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Hold briefly, then fade out
          gsap.delayedCall(0.6, () => setPhase("fadeout"));
        },
      });

      // Animate the thin progress line across the bottom
      if (progressRef.current) {
        tl.fromTo(
          progressRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 2.2, ease: "power2.inOut" },
          0
        );
      }

      // Reveal each line with a smooth clip-path + translateY
      linesRef.current.forEach((el, i) => {
        if (!el) return;
        const line = lines[i];

        tl.fromTo(
          el,
          {
            clipPath: "inset(100% 0% 0% 0%)",
            y: 30,
            opacity: 0,
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
          },
          line.delay
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (phase === "fadeout") {
      const timer = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  if (phase === "done") return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a] transition-opacity duration-[800ms] ease-out ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="px-6 text-center">
        {lines.map((line, i) => (
          <div
            key={i}
            ref={(el) => {
              linesRef.current[i] = el;
            }}
            className={`${line.className} ${i === 2 ? "mt-5" : ""}`}
            style={{ clipPath: "inset(100% 0% 0% 0%)", opacity: 0 }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Thin progress line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full">
        <div
          ref={progressRef}
          className="h-full w-full origin-left bg-gradient-to-r from-saffron/80 to-gold/60"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
