"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const HIGHLIGHTS = [
  { icon: "📖", label: "Gita Study Groups" },
  { icon: "🎵", label: "Kirtan Nights" },
  { icon: "⛰️", label: "Weekend Retreats" },
  { icon: "🎉", label: "Youth Festivals" },
  { icon: "🏠", label: "Home Programs" },
  { icon: "🧘", label: "Meditation" },
];

export default function OurPrograms() {
  return (
    <section
      id="programs"
      className="relative z-[3] overflow-hidden py-24 sm:py-32"
      style={{
        background:
          "linear-gradient(135deg, #0f3460 0%, #1a1a2e 40%, #16213e 70%, #0a0a1a 100%)",
      }}
    >
      {/* Decorative glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(232, 117, 26, 0.1) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Find Your{" "}
            <span className="bg-gradient-to-r from-[#E8751A] to-[#D4A843] bg-clip-text text-transparent">
              Path
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
            From campus study groups to weekend retreats in the mountains,
            there&apos;s a program designed for wherever you are on your journey.
          </p>
        </motion.div>

        {/* Program type pills */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-3"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {HIGHLIGHTS.map((item, i) => (
            <motion.span
              key={item.label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease: "easeOut" }}
              whileHover={{
                borderColor: "rgba(232, 117, 26, 0.4)",
                backgroundColor: "rgba(232, 117, 26, 0.1)",
              }}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          <Link
            href="/programs"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#E8751A] px-10 py-5 text-lg font-semibold text-white shadow-[0_0_40px_rgba(232,117,26,0.4)] transition-all hover:shadow-[0_0_60px_rgba(232,117,26,0.6)]"
          >
            <span className="relative z-10">Explore Programs & Map</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="relative z-10 transition-transform group-hover:translate-x-1"
            >
              <path
                d="M4 10h12M12 6l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <motion.span
              className="absolute inset-0 -z-0"
              style={{
                background:
                  "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1, ease: "easeInOut" }}
            />
          </Link>
          <p className="mt-4 text-sm text-white/40">
            View upcoming events on our interactive map
          </p>
        </motion.div>
      </div>

      {/* Bottom gradient transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to top, #FFF9F0, transparent)" }}
      />
    </section>
  );
}
