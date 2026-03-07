"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote:
      "I walked into a Monday Youth Forum not knowing what to expect. A year later, the Gita has completely transformed how I see challenges in my life.",
    name: "Priya S.",
    program: "Monday Youth Forum",
  },
  {
    quote:
      "The retreats are where the magic happens. I made lifelong friends and found answers to questions I didn't even know I had.",
    name: "Alex R.",
    program: "Retreats",
  },
  {
    quote:
      "As a woman, I always felt a bit out of place in spiritual settings. The girls' program changed that completely — it's like a family.",
    name: "Meera K.",
    program: "Girls' Preaching",
  },
  {
    quote:
      "Coming from a non-Indian background, I was nervous. But Gita Life welcomed me with open arms. The philosophy is universal.",
    name: "Jordan T.",
    program: "University Program",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const quoteRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const animateTo = (index: number) => {
    if (isAnimating || index === current) return;
    setIsAnimating(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrent(index);
        setIsAnimating(false);
      },
    });

    tl.to(quoteRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
    });

    tl.call(() => setCurrent(index));

    tl.to(quoteRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % testimonials.length;
        if (quoteRef.current) {
          gsap.fromTo(
            quoteRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
          );
        }
        return next;
      });
    }, 6000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const t = testimonials[current];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative flex min-h-screen items-center justify-center bg-void px-6 py-24"
    >
      {/* Large decorative quote mark */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-serif text-[20rem] leading-none text-saffron/5 sm:text-[30rem]">
        &ldquo;
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="label-saffron mb-16">
          What People Say
        </p>

        <div ref={quoteRef}>
          <blockquote className="font-serif text-2xl leading-relaxed font-light text-offwhite/90 sm:text-3xl lg:text-4xl lg:leading-relaxed">
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          <div className="mt-10">
            <p className="font-sans text-lg font-medium text-offwhite">{t.name}</p>
            <p className="label-saffron mt-2">{t.program}</p>
          </div>
        </div>

        {/* Dots */}
        <div className="mt-16 flex items-center justify-center gap-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => animateTo(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-8 bg-saffron"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
