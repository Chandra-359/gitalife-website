"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** Floating particle positions (deterministic for SSR) */
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: `${10 + (i * 47) % 80}%`,
  y: `${5 + (i * 31) % 85}%`,
  size: 2 + (i % 4),
  delay: (i * 0.3) % 3,
  duration: 4 + (i % 3) * 2,
}));

export default function HeroSection() {
  const [showIntro, setShowIntro] = useState(false);
  const [introExiting, setIntroExiting] = useState(false);

  useEffect(() => {
    // Show animated intro only on first visit
    const hasVisited = sessionStorage.getItem("gitalife-visited");
    if (!hasVisited) {
      setShowIntro(true);
    }
  }, []);

  const handleEnter = () => {
    setIntroExiting(true);
    setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem("gitalife-visited", "true");
    }, 1200);
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* ---- Background gradient ---- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #FFF9F0 0%, #FFF3E0 30%, #FFECD2 60%, #FFE0B2 100%)",
        }}
      />

      {/* ---- Decorative saffron glow ---- */}
      <div
        className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle, rgba(232, 117, 26, 0.08) 0%, rgba(212, 168, 67, 0.04) 40%, transparent 70%)",
        }}
      />

      {/* ---- Hero content ---- */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        {/* Lotus decoration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            className="mx-auto"
          >
            <circle cx="32" cy="32" r="30" stroke="#E8751A" strokeWidth="0.8" opacity="0.3" />
            <path
              d="M32 14c-3 5-8 11-8 16a8 8 0 0 0 16 0c0-5-5-11-8-16Z"
              fill="#E8751A"
              opacity="0.8"
            />
            <path
              d="M32 20c-1.8 3-4.5 7-4.5 10a4.5 4.5 0 0 0 9 0c0-3-2.7-7-4.5-10Z"
              fill="#D4A843"
              opacity="0.6"
            />
          </svg>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="mx-auto max-w-4xl font-serif text-4xl font-bold leading-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Discover the Timeless Wisdom of the{" "}
          <span className="text-[#E8751A]">Bhagavad Gita</span>
          {" "}&mdash; Right Here in NYC
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          Weekly programs, retreats, and a community that feels like family.
          Whether you&apos;re a curious beginner or a seasoned practitioner &mdash;
          there&apos;s a place for you.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
        >
          <a
            href="#contact"
            className="rounded-full bg-[#E8751A] px-8 py-4 text-base font-semibold text-white shadow-[0_0_20px_rgba(232,117,26,0.3)] transition-all hover:bg-[#d4680f] hover:shadow-[0_0_30px_rgba(232,117,26,0.4)]"
          >
            Get Connected
          </a>
          <a
            href="#programs"
            className="rounded-full border-2 border-[#1A5C5E] px-8 py-4 text-base font-semibold text-[#1A5C5E] transition-all hover:bg-[#1A5C5E] hover:text-white"
          >
            Explore Our Programs
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 2, duration: 0.5 },
            y: { delay: 2, duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="#1A5C5E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            />
          </svg>
        </motion.div>
      </div>

      {/* ---- Animated intro overlay (first visit only) ---- */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: "#0a0a1a" }}
            initial={{ opacity: 1 }}
            animate={introExiting ? { opacity: 0 } : { opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            {/* Warm gradient backdrop */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 60%, rgba(232, 117, 26, 0.08) 0%, rgba(212, 168, 67, 0.04) 40%, transparent 70%)",
              }}
            />

            {/* Floating golden particles */}
            {PARTICLES.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  background: "rgba(212, 168, 67, 0.5)",
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.7, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Lotus mandala */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="relative mb-8"
            >
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <motion.circle
                  cx="60" cy="60" r="55"
                  stroke="#E8751A" strokeWidth="0.8" opacity="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                />
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  const cx = 60 + Math.cos(angle) * 20;
                  const cy = 60 + Math.sin(angle) * 20;
                  return (
                    <motion.ellipse
                      key={i}
                      cx={cx} cy={cy} rx="12" ry="6"
                      fill="#E8751A" opacity="0.15"
                      transform={`rotate(${i * 45}, ${cx}, ${cy})`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.15 }}
                      transition={{ duration: 0.6, delay: 1 + i * 0.1, ease: "easeOut" }}
                    />
                  );
                })}
                <motion.path
                  d="M60 30c-4 8-12 16-12 24a12 12 0 0 0 24 0c0-8-8-16-12-24Z"
                  fill="#E8751A"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.9 }}
                  transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "60px 48px" }}
                />
                <motion.path
                  d="M60 38c-2.5 5-7 10-7 15a7 7 0 0 0 14 0c0-5-4.5-10-7-15Z"
                  fill="#FFD700"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.7 }}
                  transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
                  style={{ transformOrigin: "60px 48px" }}
                />
              </svg>
              <div
                className="absolute inset-0 -z-10 blur-2xl"
                style={{
                  background: "radial-gradient(circle, rgba(232, 117, 26, 0.3) 0%, transparent 60%)",
                }}
              />
            </motion.div>

            {/* Brand text */}
            <motion.h1
              className="relative mb-3 text-center text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Gita Life <span className="text-[#E8751A]">NYC</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="relative mb-10 max-w-md px-6 text-center text-base text-white/50 sm:text-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
            >
              Spreading the light of Bhagavad Gita wisdom across the city
            </motion.p>

            {/* CTA */}
            <motion.button
              onClick={handleEnter}
              className="relative overflow-hidden rounded-full border border-[#E8751A]/30 bg-[#E8751A]/10 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-[#E8751A] backdrop-blur-sm transition-colors hover:bg-[#E8751A]/20"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.4, ease: "easeOut" }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(232, 117, 26, 0.3)" }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.span
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(232,117,26,0.15) 50%, transparent 60%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, delay: 3, ease: "easeInOut" }}
              />
              Enter Gita Life
            </motion.button>

            <div
              className="absolute bottom-0 left-0 right-0 h-32"
              style={{ background: "linear-gradient(to top, #0a0a1a, transparent)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
