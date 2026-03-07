"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 500, suffix: "+", label: "Students Reached", accent: "text-saffron" },
  { value: 10, suffix: "+", label: "Weekly Programs", accent: "text-sage" },
  { value: 20, suffix: "+", label: "Retreats Hosted", accent: "text-gold" },
  { value: 5, suffix: "+", label: "NYC Locations", accent: "text-lotus" },
];

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      stats.forEach((stat, i) => {
        const el = numberRefs.current[i];
        if (!el) return;

        const obj = { val: 0 };

        gsap.to(obj, {
          val: stat.value,
          duration: 2.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val));
          },
          onComplete: () => {
            el.textContent = String(stat.value);
          },
        });
      });

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
      className="section-warm relative py-32"
    >
      {/* Top divider */}
      <div className="section-divider absolute top-0 left-0 w-full" />

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-12 px-6 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="text-center">
            <div className="flex items-baseline justify-center">
              <span
                ref={(el) => { numberRefs.current[i] = el; }}
                className="font-serif text-6xl font-bold text-offwhite sm:text-7xl lg:text-8xl"
              >
                0
              </span>
              <span className={`ml-1 text-3xl font-light sm:text-4xl ${stat.accent}`}>
                {stat.suffix}
              </span>
            </div>
            <p className="label mt-3">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom divider */}
      <div className="section-divider absolute bottom-0 left-0 w-full" />
    </section>
  );
}
