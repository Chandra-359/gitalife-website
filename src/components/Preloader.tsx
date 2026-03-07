"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"loading" | "curtain" | "done">("loading");
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Phase 1: 0→100% counter with smooth easing
  useEffect(() => {
    const obj = { val: 0 };

    const tl = gsap.timeline();

    // Counter from 0 to 100
    tl.to(obj, {
      val: 100,
      duration: 2.6,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(obj.val));
        }
      },
    });

    // Fade out the counter content before curtain
    tl.to(
      contentRef.current,
      {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: "power4.out",
      },
      "-=0.3"
    );

    // After counter completes, trigger curtain
    tl.call(() => setPhase("curtain"));

    return () => {
      tl.kill();
    };
  }, []);

  // Phase 2: Vertical curtain reveal — slides up
  useEffect(() => {
    if (phase !== "curtain" || !curtainRef.current) return;

    gsap.to(curtainRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: "power4.inOut",
      onComplete: () => {
        setPhase("done");
        onComplete();
      },
    });
  }, [phase, onComplete]);

  if (phase === "done") return null;

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-[100] bg-[#0a0a0a]"
    >
      <div
        ref={containerRef}
        className="flex h-full w-full items-center justify-center"
      >
        <div ref={contentRef} className="relative text-center">
          {/* Brand name — small, understated */}
          <p className="mb-6 text-xs font-medium tracking-[0.3em] uppercase text-white/30">
            GITA LIFE NYC
          </p>

          {/* Big percentage counter */}
          <div className="flex items-baseline justify-center">
            <span
              ref={counterRef}
              className="text-[8rem] font-bold leading-none tracking-[-0.04em] text-white sm:text-[12rem] lg:text-[16rem]"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              0
            </span>
            <span
              className="ml-1 text-2xl font-light text-white/30 sm:text-4xl"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              %
            </span>
          </div>

          {/* Progress bar underneath */}
          <div className="mx-auto mt-8 h-[1px] w-48 overflow-hidden bg-white/10">
            <div className="preloader-bar h-full w-full origin-left bg-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
