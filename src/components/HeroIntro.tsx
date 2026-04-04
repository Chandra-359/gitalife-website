"use client";

/**
 * HeroIntro — Cinematic landing overlay that plays on first visit
 *
 * Enhanced with richer particle effects, mandala animation,
 * and a more dramatic entrance sequence.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroIntroProps {
  visible: boolean;
  onEnter: () => void;
}

/** Floating particle positions (pre-computed for deterministic SSR) */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: `${5 + (i * 41) % 90}%`,
  y: `${3 + (i * 29) % 90}%`,
  size: 2 + (i % 5),
  delay: (i * 0.25) % 3,
  duration: 3 + (i % 4) * 2,
  color: i % 3 === 0 ? "rgba(232, 117, 26, 0.5)" : i % 3 === 1 ? "rgba(212, 168, 67, 0.4)" : "rgba(255, 215, 0, 0.3)",
}));

/** Decorative mandala ring dots */
const RING_DOTS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 * Math.PI) / 180;
  return {
    id: i,
    cx: 60 + Math.cos(angle) * 42,
    cy: 60 + Math.sin(angle) * 42,
    delay: 1.5 + i * 0.08,
  };
});

export default function HeroIntro({ visible, onEnter }: HeroIntroProps) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
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
          {/* ---- Layered gradient backdrop ---- */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 50% 40%, rgba(232, 117, 26, 0.1) 0%, transparent 50%)",
          }} />
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 30% 70%, rgba(212, 168, 67, 0.06) 0%, transparent 40%)",
          }} />
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 70% 60%, rgba(233, 69, 96, 0.04) 0%, transparent 40%)",
          }} />

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
                background: p.color,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, p.id % 2 === 0 ? 10 : -10, 0],
                opacity: [0.1, 0.8, 0.1],
                scale: [1, 1.8, 1],
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
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              duration: 2,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2,
            }}
            className="relative mb-10"
          >
            <svg
              width="140"
              height="140"
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

              {/* Decorative ring dots */}
              {RING_DOTS.map((dot) => (
                <motion.circle
                  key={dot.id}
                  cx={dot.cx}
                  cy={dot.cy}
                  r="1.5"
                  fill="#D4A843"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  transition={{ duration: 0.4, delay: dot.delay }}
                />
              ))}

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
              className="absolute inset-0 -z-10 blur-3xl"
              style={{
                background: "radial-gradient(circle, rgba(232, 117, 26, 0.35) 0%, transparent 60%)",
              }}
            />

            {/* Rotating outer glow ring */}
            <motion.div
              className="absolute inset-[-20px] -z-10 rounded-full border border-[#E8751A]/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                borderStyle: "dashed",
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
            className="relative mb-4 max-w-md px-6 text-center text-base text-white/50 sm:text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
          >
            Spreading the light of Bhagavad Gita wisdom across the city
          </motion.p>

          {/* ---- Stats row ---- */}
          <motion.div
            className="relative flex items-center gap-6 mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.1, ease: "easeOut" }}
          >
            {[
              { value: "5+", label: "Programs" },
              { value: "NYC", label: "Locations" },
              { value: "Free", label: "Always" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-lg font-bold text-[#E8751A]">{stat.value}</p>
                <p className="text-[11px] text-white/30 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* ---- CTA Button ---- */}
          <motion.button
            onClick={handleEnter}
            className="relative overflow-hidden rounded-full border border-[#E8751A]/30 bg-[#E8751A]/10 px-10 py-4 text-sm font-semibold uppercase tracking-widest text-[#E8751A] backdrop-blur-sm transition-colors hover:bg-[#E8751A]/20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.6, ease: "easeOut" }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(232, 117, 26, 0.3)" }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Shimmer sweep */}
            <motion.span
              className="absolute inset-0 -z-10"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(232,117,26,0.15) 50%, transparent 60%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, delay: 3.5, ease: "easeInOut" }}
            />
            <span className="flex items-center gap-2">
              Explore Programs
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </motion.button>

          {/* ---- Scroll hint ---- */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5, duration: 1 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-[10px] uppercase tracking-widest text-white/20">Scroll</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/20">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </motion.div>
          </motion.div>

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
