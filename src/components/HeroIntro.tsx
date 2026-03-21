"use client";

/**
 * HeroIntro — Vedic cinematic landing overlay
 *
 * Redesigned with Treta Yuga / ancient Indian aesthetic:
 *  1. Dark earth background with golden particle field
 *  2. Sri Yantra mandala draws in (sacred geometry)
 *  3. "Gita Life NYC" in decorative Vedic-inspired typography
 *  4. Sanskrit shloka subtitle
 *  5. "Enter the Sacred Map" CTA with ornamental borders
 *  6. Dissolves to reveal the Vedic map
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroIntroProps {
  visible: boolean;
  onEnter: () => void;
}

/** Sacred golden particles — like embers from a yajna */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: `${8 + (i * 43) % 84}%`,
  y: `${3 + (i * 29) % 88}%`,
  size: 2 + (i % 5),
  delay: (i * 0.25) % 3,
  duration: 3.5 + (i % 4) * 1.5,
}));

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
          style={{ background: "#1a150e" }}
          initial={{ opacity: 1 }}
          animate={exiting ? { opacity: 0 } : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {/* ---- Warm sacred gradient backdrop ---- */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 50% 50%, rgba(212, 168, 67, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 70%, rgba(232, 117, 26, 0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 30% 30%, rgba(139, 105, 20, 0.04) 0%, transparent 40%),
                radial-gradient(ellipse at 70% 30%, rgba(139, 105, 20, 0.04) 0%, transparent 40%)
              `,
            }}
          />

          {/* ---- Ancient texture overlay ---- */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(212, 168, 67, 0.1) 50px, transparent 51px),
                repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(212, 168, 67, 0.1) 50px, transparent 51px)
              `,
            }}
          />

          {/* ---- Sacred ember particles ---- */}
          {PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                background: `radial-gradient(circle, rgba(212, 168, 67, 0.8) 0%, rgba(232, 117, 26, 0.4) 60%, transparent 100%)`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.15, 0.6, 0.15],
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

          {/* ---- Sri Yantra mandala SVG ---- */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              duration: 2,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.3,
            }}
            className="relative mb-8"
          >
            <svg
              width="140"
              height="140"
              viewBox="0 0 140 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer sacred circle */}
              <motion.circle
                cx="70" cy="70" r="65"
                stroke="#D4A843"
                strokeWidth="0.8"
                opacity="0.35"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
              />
              <motion.circle
                cx="70" cy="70" r="60"
                stroke="#E8751A"
                strokeWidth="0.5"
                opacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
              />

              {/* Upward triangle — Shiva */}
              <motion.polygon
                points="70,15 115,100 25,100"
                stroke="#D4A843"
                strokeWidth="0.8"
                fill="none"
                opacity="0.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
              />

              {/* Downward triangle — Shakti */}
              <motion.polygon
                points="70,125 25,40 115,40"
                stroke="#E8751A"
                strokeWidth="0.8"
                fill="none"
                opacity="0.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                transition={{ duration: 1.5, delay: 1.3, ease: "easeOut" }}
              />

              {/* 8 lotus petals — arranged radially */}
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const cx = 70 + Math.cos(angle) * 28;
                const cy = 70 + Math.sin(angle) * 28;
                return (
                  <motion.ellipse
                    key={i}
                    cx={cx}
                    cy={cy}
                    rx="14"
                    ry="7"
                    fill="#E8751A"
                    opacity="0.1"
                    transform={`rotate(${i * 45}, ${cx}, ${cy})`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.1 }}
                    transition={{ duration: 0.6, delay: 1.2 + i * 0.08, ease: "easeOut" }}
                  />
                );
              })}

              {/* Center — Sacred fire (agni) */}
              <motion.path
                d="M70 35c-5 10-14 18-14 27a14 14 0 0 0 28 0c0-9-9-17-14-27Z"
                fill="#E8751A"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.85 }}
                transition={{ duration: 1.2, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "70px 55px" }}
              />
              <motion.path
                d="M70 44c-3 6-8 11-8 16a8 8 0 0 0 16 0c0-5-5-10-8-16Z"
                fill="#FFD700"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.7 }}
                transition={{ duration: 0.8, delay: 1.7, ease: "easeOut" }}
                style={{ transformOrigin: "70px 55px" }}
              />
              {/* Bindu — sacred center */}
              <motion.ellipse
                cx="70" cy="58"
                rx="3.5" ry="4.5"
                fill="#FFF8E1"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0.7, 0.9] }}
                transition={{ duration: 2, delay: 2, repeat: Infinity }}
              />

              {/* Altar base */}
              <motion.g
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 1.6 }}
                style={{ transformOrigin: "70px 65px" }}
              >
                <rect x="58" y="63" width="24" height="3" rx="0.5" fill="#E8751A" opacity="0.35" />
                <rect x="61" y="65.5" width="18" height="2" rx="0.5" fill="#D4A843" opacity="0.2" />
              </motion.g>

              {/* Decorative dots on outer circle */}
              {Array.from({ length: 16 }, (_, i) => {
                const angle = (i * 22.5 * Math.PI) / 180;
                return (
                  <motion.circle
                    key={`dot-${i}`}
                    cx={70 + Math.cos(angle) * 60}
                    cy={70 + Math.sin(angle) * 60}
                    r={i % 4 === 0 ? 1.5 : 0.8}
                    fill="#D4A843"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: i % 4 === 0 ? 0.4 : 0.2 }}
                    transition={{ delay: 1.5 + i * 0.05 }}
                  />
                );
              })}
            </svg>

            {/* Warm glow behind mandala */}
            <div
              className="absolute inset-0 -z-10 blur-3xl"
              style={{
                background: "radial-gradient(circle, rgba(212, 168, 67, 0.25) 0%, rgba(232, 117, 26, 0.1) 40%, transparent 60%)",
              }}
            />
          </motion.div>

          {/* ---- Decorative divider ---- */}
          <motion.div
            className="mb-4 flex items-center gap-3"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.4, scaleX: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4A843]" />
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="#D4A843" opacity="0.6" />
            </svg>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4A843]" />
          </motion.div>

          {/* ---- Brand text — Vedic styled ---- */}
          <motion.h1
            className="relative mb-2 text-center text-4xl font-bold tracking-wide text-[#FFF8E1] sm:text-5xl md:text-6xl"
            style={{
              textShadow: "0 0 40px rgba(212, 168, 67, 0.3), 0 0 80px rgba(232, 117, 26, 0.1)",
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Gita Life{" "}
            <span className="text-[#D4A843]">NYC</span>
          </motion.h1>

          {/* ---- Sanskrit-inspired tagline ---- */}
          <motion.p
            className="relative mb-2 text-center text-sm tracking-[0.3em] text-[#D4A843]/50"
            style={{ fontFamily: "serif" }}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
          >
            ॐ ज्ञानदीपेन भास्वता
          </motion.p>

          <motion.p
            className="relative mb-10 max-w-md px-6 text-center text-base text-[#FFF8E1]/40 sm:text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.9, ease: "easeOut" }}
          >
            Spreading the light of Bhagavad Gita wisdom across the city
          </motion.p>

          {/* ---- CTA Button — ornamental Vedic style ---- */}
          <motion.button
            onClick={handleEnter}
            className="relative overflow-hidden rounded-sm border border-[#D4A843]/40 bg-[#D4A843]/10 px-10 py-3.5 text-sm font-semibold uppercase tracking-[0.25em] text-[#D4A843] backdrop-blur-sm transition-colors hover:bg-[#D4A843]/20"
            style={{
              borderImage: "linear-gradient(135deg, #D4A843, #E8751A, #D4A843) 1",
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.4, ease: "easeOut" }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(212, 168, 67, 0.25)" }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Shimmer sweep */}
            <motion.span
              className="absolute inset-0 -z-10"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(212,168,67,0.12) 50%, transparent 60%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, delay: 3, ease: "easeInOut" }}
            />
            Enter the Sacred Map
          </motion.button>

          {/* ---- Bottom ornamental divider ---- */}
          <motion.div
            className="absolute bottom-8 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 2.8 }}
          >
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#D4A843]" />
            <span className="text-[10px] tracking-[0.4em] text-[#D4A843]" style={{ fontFamily: "serif" }}>
              सत्यं शिवं सुन्दरम्
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#D4A843]" />
          </motion.div>

          {/* ---- Bottom gradient fade ---- */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{
              background: "linear-gradient(to top, #1a150e, transparent)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
