"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
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
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-6">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
            What People Are Saying
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#E8751A] to-[#D4A843]" />
        </motion.div>

        {/* Testimonial carousel */}
        <div className="relative">
          {/* Quote icon */}
          <div className="mb-6 text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="mx-auto opacity-20"
            >
              <path
                d="M14 28c-3.3 0-6-2.7-6-6s2.7-6 6-6c0-5.5 4.5-10 10-10v4c-3.3 0-6 2.7-6 6h6v12H14ZM34 28c-3.3 0-6-2.7-6-6s2.7-6 6-6c0-5.5 4.5-10 10-10v4c-3.3 0-6 2.7-6 6h6v12H34Z"
                fill="#E8751A"
              />
            </svg>
          </div>

          <div className="relative min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center"
              >
                <p className="font-serif text-xl leading-relaxed text-gray-800 italic sm:text-2xl">
                  &ldquo;{TESTIMONIALS[current].quote}&rdquo;
                </p>
                <div className="mt-6">
                  <p className="text-base font-semibold text-gray-900">
                    {TESTIMONIALS[current].name}
                  </p>
                  <p className="text-sm text-[#E8751A]">
                    {TESTIMONIALS[current].program}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              onClick={prev}
              className="rounded-full border border-gray-200 p-2 text-gray-400 transition-colors hover:border-[#E8751A] hover:text-[#E8751A]"
              aria-label="Previous testimonial"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12 4l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === current
                      ? "w-8 bg-[#E8751A]"
                      : "w-2.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="rounded-full border border-gray-200 p-2 text-gray-400 transition-colors hover:border-[#E8751A] hover:text-[#E8751A]"
              aria-label="Next testimonial"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M8 4l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
