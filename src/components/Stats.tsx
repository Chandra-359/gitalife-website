"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 500, suffix: "+", label: "Students Reached" },
  { value: 10, suffix: "+", label: "Weekly Programs" },
  { value: 20, suffix: "+", label: "Retreats Hosted" },
  { value: 5, suffix: "+", label: "NYC Locations" },
];

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      stats.forEach((stat, i) => {
        const el = numberRefs.current[i];
        if (!el) return;

        // Number scramble effect
        const obj = { val: 0 };
        const scrambleChars = "0123456789";

        gsap.to(obj, {
          val: stat.value,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            const progress = obj.val / stat.value;
            if (progress < 0.7) {
              // Scramble phase
              let scrambled = "";
              const digits = String(stat.value).length;
              for (let d = 0; d < digits; d++) {
                scrambled +=
                  scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
              }
              el.textContent = scrambled;
            } else {
              // Settle into final value
              el.textContent = String(Math.round(obj.val));
            }
          },
          onComplete: () => {
            el.textContent = String(stat.value);
          },
        });
      });

      // Fade in the section
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0a0a0a] py-24"
    >
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-saffron/30 to-transparent" />

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-12 px-6 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="text-center">
            <div className="flex items-baseline justify-center">
              <span
                ref={(el) => { numberRefs.current[i] = el; }}
                className="font-serif text-6xl font-bold text-white sm:text-7xl lg:text-8xl"
              >
                0
              </span>
              <span className="ml-1 text-3xl font-light text-saffron sm:text-4xl">
                {stat.suffix}
              </span>
            </div>
            <p className="mt-3 text-sm tracking-widest uppercase text-white/40">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
