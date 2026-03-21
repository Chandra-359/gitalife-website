"use client";

/**
 * HeroIntro — Cinematic landing overlay that plays on first visit
 *
 * Sequence:
 *  1. Dark screen with subtle warm particles
 *  2. Lotus mandala draws in (SVG path animation)
 *  3. "Gita Life NYC" brand text scales up
 *  4. Tagline fades in below
 *  5. "Explore the Map" CTA pulses
 *  6. Entire overlay dissolves, revealing the map beneath
 *
 * Uses Framer Motion for all animations — no CSS keyframes.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroIntroProps {
  visible: boolean;
  onEnter: () => void;
}

/** Floating particle positions (pre-computed for deterministic SSR) */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: `${10 + (i * 47) % 80}%`,
  y: `${5 + (i * 31) % 85}%`,
  size: 2 + (i % 4),
  delay: (i * 0.3) % 3,
  duration: 4 + (i % 3) * 2,
}));

export default function HeroIntro({ visible, onEnter }: HeroIntroProps) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    // Let exit animation play, then unmount
    setTimeout(onEnter, 1200);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#0a0a1a" }}
          initial={{ opacity: 1 }}
          animate={exiting ? { opacity: 0 } : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {/* ---- Warm gradient backdrop ---- */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, rgba(232, 117, 26, 0.08) 0%, rgba(212, 168, 67, 0.04) 40%, transparent 70%)",
            }}
          />

          {/* ---- Floating golden particles ---- */}
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

          {/* ---- Lotus mandala SVG ---- */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              duration: 1.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.3,
            }}
            className="relative mb-8"
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer ring */}
              <motion.circle
                cx="60"
                cy="60"
                r="55"
                stroke="#E8751A"
                strokeWidth="0.8"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
              />
              <motion.circle
                cx="60"
                cy="60"
                r="48"
                stroke="#D4A843"
                strokeWidth="0.5"
                opacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
              />

              {/* Lotus petals — 8 petals arranged radially */}
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const cx = 60 + Math.cos(angle) * 20;
                const cy = 60 + Math.sin(angle) * 20;
                return (
                  <motion.ellipse
                    key={i}
                    cx={cx}
                    cy={cy}
                    rx="12"
                    ry="6"
                    fill="#E8751A"
                    opacity="0.15"
                    transform={`rotate(${i * 45}, ${cx}, ${cy})`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    transition={{ duration: 0.6, delay: 1 + i * 0.1, ease: "easeOut" }}
                  />
                );
              })}

              {/* Center diya flame */}
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
              <motion.ellipse
                cx="60"
                cy="52"
                rx="3"
                ry="4"
                fill="#FFF8E1"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0.7, 0.9] }}
                transition={{ duration: 2, delay: 1.8, repeat: Infinity }}
              />

              {/* Diya base */}
              <motion.ellipse
                cx="60"
                cy="56"
                rx="8"
                ry="2.5"
                fill="#E8751A"
                opacity="0.4"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                style={{ transformOrigin: "60px 56px" }}
              />
            </svg>

            {/* Glow behind the lotus */}
            <div
              className="absolute inset-0 -z-10 blur-2xl"
              style={{
                background: "radial-gradient(circle, rgba(232, 117, 26, 0.3) 0%, transparent 60%)",
              }}
            />
          </motion.div>

          {/* ---- Brand text ---- */}
          <motion.h1
            className="relative mb-3 text-center text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Gita Life{" "}
            <span className="text-[#E8751A]">NYC</span>
          </motion.h1>

          {/* ---- Tagline ---- */}
          <motion.p
            className="relative mb-10 max-w-md px-6 text-center text-base text-white/50 sm:text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
          >
            Spreading the light of Bhagavad Gita wisdom across the city
          </motion.p>

          {/* ---- CTA Button ---- */}
          <motion.button
            onClick={handleEnter}
            className="relative overflow-hidden rounded-full border border-[#E8751A]/30 bg-[#E8751A]/10 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-[#E8751A] backdrop-blur-sm transition-colors hover:bg-[#E8751A]/20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.4, ease: "easeOut" }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(232, 117, 26, 0.3)" }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Shimmer sweep */}
            <motion.span
              className="absolute inset-0 -z-10"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(232,117,26,0.15) 50%, transparent 60%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, delay: 3, ease: "easeInOut" }}
            />
            Explore the Map
          </motion.button>

          {/* ---- Bottom gradient fade ---- */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{
              background: "linear-gradient(to top, #0a0a1a, transparent)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
