"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"loading" | "curtain" | "done">("loading");
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obj = { val: 0 };

    const tl = gsap.timeline();

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

    tl.call(() => setPhase("curtain"));

    return () => {
      tl.kill();
    };
  }, []);

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
      className="fixed inset-0 z-[100]"
      style={{
        background: `
          radial-gradient(ellipse at 50% 50%, rgba(232,117,26,0.06) 0%, transparent 50%),
          var(--color-void)
        `,
      }}
    >
      <div
        ref={containerRef}
        className="flex h-full w-full items-center justify-center"
      >
        <div ref={contentRef} className="relative text-center">
          {/* Brand name */}
          <p className="label mb-6">GITA LIFE NYC</p>

          {/* Big percentage counter */}
          <div className="flex items-baseline justify-center">
            <span
              ref={counterRef}
              className="font-sans text-[8rem] font-bold leading-none tracking-[-0.04em] text-offwhite sm:text-[12rem] lg:text-[16rem]"
            >
              0
            </span>
            <span className="ml-1 font-sans text-2xl font-light text-saffron/40 sm:text-4xl">
              %
            </span>
          </div>

          {/* Progress bar */}
          <div className="mx-auto mt-8 h-[1px] w-48 overflow-hidden bg-white/[0.06]">
            <div className="preloader-bar h-full w-full origin-left bg-gradient-to-r from-saffron/40 to-saffron" />
          </div>
        </div>
      </div>
    </div>
  );
}
