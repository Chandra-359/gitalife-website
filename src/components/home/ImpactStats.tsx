"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: 500, suffix: "+", label: "Students Reached", icon: "🎓" },
  { value: 10, suffix: "+", label: "Weekly Programs", icon: "📅" },
  { value: 5, suffix: "+", label: "NYC Locations", icon: "📍" },
  { value: 20, suffix: "+", label: "Retreats Hosted", icon: "⛰️" },
];

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function ImpactStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative z-[3] overflow-hidden bg-[#1A5C5E] py-20 sm:py-24">
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(232, 117, 26, 0.3) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 50%, rgba(212, 168, 67, 0.2) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.h3
          className="mb-10 text-center font-serif text-2xl font-bold text-white/90 sm:text-3xl"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Our Impact
        </motion.h3>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
            >
              <span className="text-2xl">{stat.icon}</span>
              <div className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  inView={inView}
                />
              </div>
              <p className="mt-1 text-sm font-medium text-white/60">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
