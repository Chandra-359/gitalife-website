"use client";

/**
 * HeroIntro — Cinematic landing overlay that plays on first visit
 *
 * Sequence:
 *  1. Dark screen with warm gradient + noise texture
 *  2. Golden particles float and drift
 *  3. Lotus mandala draws in (SVG path animation)
 *  4. "Gita Life NYC" brand text — split-character reveal with gradient
 *  5. Tagline fades in with blur-to-sharp transition
 *  6. "Explore the Map" CTA pulses with glow
 *  7. Entire overlay dissolves, revealing the map beneath
 *
 * Uses Framer Motion for all animations — no CSS keyframes.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedText from "./AnimatedText";

interface HeroIntroProps {
  visible: boolean;
  onEnter: () => void;
}

/** Floating particle positions (pre-computed for deterministic SSR) */
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: `${5 + (i * 37) % 90}%`,
  y: `${3 + (i * 29) % 92}%`,
  size: 1.5 + (i % 5),
  delay: (i * 0.25) % 4,
  duration: 5 + (i % 4) * 2,
  drift: ((i % 3) - 1) * 15, // horizontal drift: -15, 0, or 15
}));

/** Decorative floating rings */
const RINGS = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  size: 150 + i * 120,
  delay: 0.5 + i * 0.4,
  duration: 20 + i * 5,
  opacity: 0.03 - i * 0.005,
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
          className="noise-overlay absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#0a0a1a" }}
          initial={{ opacity: 1 }}
          animate={exiting ? { opacity: 0, scale: 1.05 } : { opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* ---- Layered gradient backdrop ---- */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 55%, rgba(232, 117, 26, 0.1) 0%, rgba(212, 168, 67, 0.05) 35%, transparent 65%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 70%, rgba(212, 168, 67, 0.04) 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 70% 30%, rgba(232, 117, 26, 0.03) 0%, transparent 50%)",
            }}
          />

          {/* ---- Decorative rotating rings ---- */}
          {RINGS.map((ring) => (
            <motion.div
              key={ring.id}
              className="absolute rounded-full border"
              style={{
                width: ring.size,
                height: ring.size,
                borderColor: `rgba(212, 168, 67, ${ring.opacity})`,
                left: "50%",
                top: "50%",
                marginLeft: -ring.size / 2,
                marginTop: -ring.size / 2,
              }}
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 360, opacity: 1 }}
              transition={{
                rotate: {
                  duration: ring.duration,
                  repeat: Infinity,
                  ease: "linear",
                },
                opacity: {
                  duration: 2,
                  delay: ring.delay,
                },
              }}
            />
          ))}

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
                background:
                  p.id % 3 === 0
                    ? "rgba(232, 117, 26, 0.6)"
                    : "rgba(212, 168, 67, 0.5)",
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, p.drift, 0],
                opacity: [0.15, 0.8, 0.15],
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
                stroke="url(#ringGradient)"
                strokeWidth="0.8"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 2.5, delay: 0.4, ease: "easeOut" }}
              />
              <motion.circle
                cx="60"
                cy="60"
                r="48"
                stroke="url(#ringGradient2)"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.25 }}
                transition={{ duration: 2.5, delay: 0.7, ease: "easeOut" }}
              />
              {/* Inner decorative circle */}
              <motion.circle
                cx="60"
                cy="60"
                r="40"
                stroke="#D4A843"
                strokeWidth="0.3"
                strokeDasharray="2 6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.15 }}
                transition={{ duration: 2, delay: 1, ease: "easeOut" }}
              />

              {/* Lotus petals — 12 petals for richer mandala */}
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const cx = 60 + Math.cos(angle) * 22;
                const cy = 60 + Math.sin(angle) * 22;
                return (
                  <motion.ellipse
                    key={i}
                    cx={cx}
                    cy={cy}
                    rx="13"
                    ry="5.5"
                    fill={i % 2 === 0 ? "#E8751A" : "#D4A843"}
                    opacity="0.12"
                    transform={`rotate(${i * 30}, ${cx}, ${cy})`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: i % 2 === 0 ? 0.12 : 0.08 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.8 + i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                );
              })}

              {/* === BLAZING FIRE === */}

              {/* Fire gradients */}
              <defs>
                {/* Ring gradients */}
                <linearGradient id="ringGradient" x1="0" y1="0" x2="120" y2="120">
                  <stop offset="0%" stopColor="#E8751A" />
                  <stop offset="100%" stopColor="#D4A843" />
                </linearGradient>
                <linearGradient id="ringGradient2" x1="120" y1="0" x2="0" y2="120">
                  <stop offset="0%" stopColor="#D4A843" />
                  <stop offset="100%" stopColor="#E8751A" />
                </linearGradient>
                {/* Fire gradients */}
                <radialGradient id="heroFlameOuter" cx="50%" cy="75%" r="55%">
                  <stop offset="0%" stopColor="#E8751A" />
                  <stop offset="60%" stopColor="#E8751A" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#8B2500" stopOpacity="0.3" />
                </radialGradient>
                <radialGradient id="heroFlameMid" cx="50%" cy="70%" r="50%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="#E8751A" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#E8751A" stopOpacity="0.5" />
                </radialGradient>
                <radialGradient id="heroFlameInner" cx="50%" cy="65%" r="45%">
                  <stop offset="0%" stopColor="#FFF8DC" />
                  <stop offset="40%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" stopOpacity="0.7" />
                </radialGradient>
              </defs>

              {/* Outer fire — large turbulent base */}
              <motion.path
                d="M60 24c-5 9-16 18-16 30a16 16 0 0 0 32 0c0-12-11-21-16-30Z"
                fill="url(#heroFlameOuter)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 0.9,
                  scaleY: [1, 1.08, 0.93, 1.05, 0.96, 1],
                  scaleX: [1, 0.95, 1.04, 0.97, 1.03, 1],
                  rotate: [0, -2, 1.5, -1, 1.8, 0],
                }}
                transition={{
                  scale: { duration: 1.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 1.2, delay: 1.2 },
                  scaleY: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
                  scaleX: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
                  rotate: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
                }}
                style={{ transformOrigin: "60px 50px" }}
              />

              {/* Wispy tendril — left */}
              <motion.path
                d="M52 38c-2 4-4 8-3 12c1 3 3 3 4 1"
                stroke="#E8751A"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.3, 0.15, 0.25, 0],
                  d: [
                    "M52 38c-2 4-4 8-3 12c1 3 3 3 4 1",
                    "M50 36c-3 5-5 9-4 13c1 3 4 3 5 1",
                    "M52 38c-2 4-4 8-3 12c1 3 3 3 4 1",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              />

              {/* Wispy tendril — right */}
              <motion.path
                d="M68 38c2 4 4 8 3 12c-1 3-3 3-4 1"
                stroke="#E8751A"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.25, 0.1, 0.2, 0],
                  d: [
                    "M68 38c2 4 4 8 3 12c-1 3-3 3-4 1",
                    "M70 36c3 5 5 9 4 13c-1 3-4 3-5 1",
                    "M68 38c2 4 4 8 3 12c-1 3-3 3-4 1",
                  ],
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
              />

              {/* Mid fire — brighter body */}
              <motion.path
                d="M60 30c-3 6-10 13-10 22a10 10 0 0 0 20 0c0-9-7-16-10-22Z"
                fill="url(#heroFlameMid)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 0.85,
                  scaleY: [1, 1.12, 0.88, 1.08, 0.93, 1],
                  scaleX: [1, 0.93, 1.06, 0.95, 1.04, 1],
                }}
                transition={{
                  scale: { duration: 1, delay: 1.4, ease: "easeOut" },
                  opacity: { duration: 1, delay: 1.4 },
                  scaleY: { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 1.6 },
                  scaleX: { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 1.6 },
                }}
                style={{ transformOrigin: "60px 48px" }}
              />

              {/* Inner fire — hot yellow-white */}
              <motion.path
                d="M60 36c-2 4-6 9-6 14a6 6 0 0 0 12 0c0-5-4-10-6-14Z"
                fill="url(#heroFlameInner)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 0.9,
                  scaleY: [1, 1.15, 0.85, 1.1, 0.9, 1],
                  scaleX: [1, 0.9, 1.08, 0.93, 1.05, 1],
                }}
                transition={{
                  scale: { duration: 0.8, delay: 1.6, ease: "easeOut" },
                  opacity: { duration: 0.8, delay: 1.6 },
                  scaleY: { duration: 1, repeat: Infinity, ease: "easeInOut", delay: 1.8 },
                  scaleX: { duration: 1, repeat: Infinity, ease: "easeInOut", delay: 1.8 },
                }}
                style={{ transformOrigin: "60px 48px" }}
              />

              {/* White-hot core — rapid throb */}
              <motion.ellipse
                cx="60"
                cy="50"
                rx="3.5"
                ry="5.5"
                fill="#FFF8E1"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.9, 0.6, 0.95, 0.7, 0.85],
                  scale: [1, 1.2, 0.85, 1.15, 0.9, 1],
                }}
                transition={{
                  duration: 1.2,
                  delay: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "60px 50px" }}
              />

              {/* Flickering flame tip */}
              <motion.circle
                cx="60"
                cy="28"
                r="1.5"
                fill="#FFF"
                initial={{ opacity: 0 }}
                animate={{
                  cy: [28, 25, 29, 26, 28],
                  opacity: [0, 0.6, 0.2, 0.5, 0],
                  r: [1.5, 2.2, 1, 1.8, 1.5],
                }}
                transition={{ duration: 1, delay: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Rising sparks */}
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.circle
                  key={`hero-spark-${i}`}
                  cx={60 + ((i * 7) % 5) - 2}
                  cy={30}
                  r={1 + (i % 3) * 0.4}
                  fill={i % 2 === 0 ? "#FFD700" : "#E8751A"}
                  initial={{ opacity: 0 }}
                  animate={{
                    cy: [30, 15 - i * 3],
                    cx: [60 + ((i * 7) % 5) - 2, 60 + ((i * 13) % 9) - 4],
                    opacity: [0, 0.8, 0],
                    r: [1 + (i % 3) * 0.4, 0.3],
                  }}
                  transition={{
                    duration: 1.5 + i * 0.3,
                    repeat: Infinity,
                    delay: 2.5 + i * 0.4,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Diya base */}
              <motion.ellipse
                cx="60"
                cy="56"
                rx="9"
                ry="3"
                fill="#E8751A"
                opacity="0.45"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                style={{ transformOrigin: "60px 56px" }}
              />
              <motion.ellipse
                cx="60"
                cy="55.5"
                rx="6"
                ry="1.8"
                fill="#FFD700"
                opacity="0.15"
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: 1,
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  scaleX: { duration: 0.5, delay: 1.4 },
                  opacity: { duration: 2, delay: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                style={{ transformOrigin: "60px 55.5px" }}
              />

            </svg>

            {/* Glow behind the lotus — larger and warmer */}
            <div
              className="absolute inset-0 -z-10 scale-150 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(232, 117, 26, 0.35) 0%, rgba(212, 168, 67, 0.15) 40%, transparent 65%)",
              }}
            />

            {/* Secondary glow ring */}
            <motion.div
              className="absolute inset-0 -z-10 scale-200 blur-2xl"
              animate={{
                opacity: [0.15, 0.3, 0.15],
                scale: [1.8, 2.1, 1.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "radial-gradient(circle, rgba(232, 117, 26, 0.15) 0%, transparent 50%)",
              }}
            />
          </motion.div>

          {/* ---- Brand text with character reveal ---- */}
          <motion.h1
            className="relative mb-2 text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <AnimatedText
              text="Gita Life"
              className="text-white"
              delay={1.0}
            />{" "}
            <AnimatedText
              text="NYC"
              className="text-gradient-saffron"
              delay={1.3}
            />
          </motion.h1>

          {/* ---- Decorative divider line ---- */}
          <motion.div
            className="mb-4 h-px w-24"
            style={{
              background: "linear-gradient(90deg, transparent, #D4A843, transparent)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.5 }}
            transition={{ duration: 1, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* ---- Tagline with blur reveal ---- */}
          <motion.p
            className="relative mb-12 max-w-lg px-6 text-center text-base tracking-wide text-white/60 sm:text-lg"
            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
          >
            Spreading the light of Bhagavad Gita wisdom across the city
          </motion.p>

          {/* ---- CTA Button with enhanced glow ---- */}
          <motion.button
            onClick={handleEnter}
            className="btn-glow-pulse relative overflow-hidden rounded-full border border-[#E8751A]/40 bg-[#E8751A]/10 px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#E8751A] backdrop-blur-sm transition-colors hover:bg-[#E8751A]/20"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 2.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{
              scale: 1.06,
              boxShadow: "0 0 40px rgba(232, 117, 26, 0.4), 0 0 80px rgba(232, 117, 26, 0.15)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Shimmer sweep */}
            <motion.span
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "linear-gradient(105deg, transparent 35%, rgba(255,215,0,0.15) 50%, transparent 65%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 3,
                ease: "easeInOut",
              }}
            />
            Explore the Map
          </motion.button>

          {/* ---- Scroll hint ---- */}
          <motion.div
            className="absolute bottom-8 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 3.5, duration: 1 }}
          >
            <motion.div
              className="h-6 w-px"
              style={{ background: "linear-gradient(to bottom, #D4A843, transparent)" }}
              animate={{ scaleY: [1, 0.5, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* ---- Edge vignette ---- */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, transparent 50%, #0a0a1a 100%)",
            }}
          />

          {/* ---- Bottom gradient fade ---- */}
          <div
            className="absolute bottom-0 left-0 right-0 h-40"
            style={{
              background: "linear-gradient(to top, #0a0a1a, transparent)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
