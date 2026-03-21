"use client";

/**
 * VedicBorder — Ornamental Vedic manuscript border frame
 *
 * Inspired by ancient Indian manuscript margins with:
 *  - Lotus vine patterns along edges
 *  - Corner medallions with Yuga symbols
 *  - Sudarshana Chakra compass rose (top-center)
 *  - Aged parchment edge glow
 *
 * This overlay sits above the map (z-[6]) but below UI controls.
 * It's purely decorative and pointer-events-none.
 */

import { motion } from "framer-motion";

interface VedicBorderProps {
  visible: boolean;
}

export default function VedicBorder({ visible }: VedicBorderProps) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[6]"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 2, delay: 0.5 }}
    >
      {/* ---- SVG border frame ---- */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Aged gold gradient for borders */}
          <linearGradient id="vedic-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D4A843" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#E8751A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D4A843" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="vedic-gold-h" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4A843" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#E8751A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D4A843" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="vedic-gold-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4A843" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#E8751A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D4A843" stopOpacity="0.15" />
          </linearGradient>

          {/* Pattern: repeating lotus vine for borders */}
          <pattern id="lotus-vine-h" x="0" y="0" width="120" height="24" patternUnits="userSpaceOnUse">
            {/* Vine stem */}
            <path
              d="M0 12 Q30 4, 60 12 T120 12"
              stroke="#D4A843"
              strokeWidth="0.8"
              fill="none"
              opacity="0.5"
            />
            {/* Small lotus buds along the vine */}
            <ellipse cx="30" cy="8" rx="6" ry="4" fill="#E8751A" opacity="0.15" />
            <ellipse cx="90" cy="16" rx="6" ry="4" fill="#D4A843" opacity="0.15" />
            {/* Tiny leaves */}
            <path d="M15 12 Q20 6, 25 12" stroke="#D4A843" strokeWidth="0.5" fill="none" opacity="0.3" />
            <path d="M75 12 Q80 18, 85 12" stroke="#D4A843" strokeWidth="0.5" fill="none" opacity="0.3" />
          </pattern>

          <pattern id="lotus-vine-v" x="0" y="0" width="24" height="120" patternUnits="userSpaceOnUse">
            <path
              d="M12 0 Q4 30, 12 60 T12 120"
              stroke="#D4A843"
              strokeWidth="0.8"
              fill="none"
              opacity="0.5"
            />
            <ellipse cx="8" cy="30" rx="4" ry="6" fill="#E8751A" opacity="0.15" />
            <ellipse cx="16" cy="90" rx="4" ry="6" fill="#D4A843" opacity="0.15" />
          </pattern>

          {/* Glow filter */}
          <filter id="vedic-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ============================================================ */}
        {/*  OUTER BORDER LINES                                          */}
        {/* ============================================================ */}

        {/* Outer frame line */}
        <rect
          x="16" y="16"
          width="1888" height="1048"
          rx="4"
          fill="none"
          stroke="url(#vedic-gold)"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Inner frame line */}
        <rect
          x="28" y="28"
          width="1864" height="1024"
          rx="3"
          fill="none"
          stroke="url(#vedic-gold)"
          strokeWidth="0.8"
          opacity="0.25"
        />

        {/* ============================================================ */}
        {/*  LOTUS VINE BORDERS                                           */}
        {/* ============================================================ */}

        {/* Top vine band */}
        <rect x="60" y="8" width="1800" height="24" fill="url(#lotus-vine-h)" opacity="0.7" />
        {/* Bottom vine band */}
        <rect x="60" y="1048" width="1800" height="24" fill="url(#lotus-vine-h)" opacity="0.7" />
        {/* Left vine band */}
        <rect x="8" y="60" width="24" height="960" fill="url(#lotus-vine-v)" opacity="0.7" />
        {/* Right vine band */}
        <rect x="1888" y="60" width="24" height="960" fill="url(#lotus-vine-v)" opacity="0.7" />

        {/* ============================================================ */}
        {/*  CORNER MEDALLIONS — Yuga symbols                             */}
        {/* ============================================================ */}

        {/* Top-left: Satya Yuga — full lotus (truth/dharma) */}
        <g transform="translate(40, 40)" opacity="0.5" filter="url(#vedic-glow)">
          <circle cx="0" cy="0" r="18" fill="none" stroke="#D4A843" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="12" fill="none" stroke="#D4A843" strokeWidth="0.5" />
          {/* 4-petal lotus for Satya */}
          {[0, 90, 180, 270].map((angle) => (
            <ellipse
              key={angle}
              cx="0" cy="-10"
              rx="4" ry="8"
              fill="#D4A843"
              opacity="0.3"
              transform={`rotate(${angle}, 0, 0)`}
            />
          ))}
          <circle cx="0" cy="0" r="3" fill="#D4A843" opacity="0.4" />
        </g>

        {/* Top-right: Treta Yuga — bow (Rama's bow) */}
        <g transform="translate(1880, 40)" opacity="0.5" filter="url(#vedic-glow)">
          <circle cx="0" cy="0" r="18" fill="none" stroke="#E8751A" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="12" fill="none" stroke="#E8751A" strokeWidth="0.5" />
          {/* Bow shape */}
          <path
            d="M-8 8 Q0 -12, 8 8"
            stroke="#E8751A"
            strokeWidth="1.2"
            fill="none"
            opacity="0.5"
          />
          {/* Bowstring */}
          <line x1="-8" y1="8" x2="8" y2="8" stroke="#E8751A" strokeWidth="0.6" opacity="0.4" />
          {/* Arrow */}
          <line x1="0" y1="8" x2="0" y2="-8" stroke="#E8751A" strokeWidth="0.8" opacity="0.4" />
          <path d="M-2 -6 L0 -10 L2 -6" fill="#E8751A" opacity="0.5" />
        </g>

        {/* Bottom-left: Dvapara Yuga — mace (Bhima's gada) */}
        <g transform="translate(40, 1040)" opacity="0.5" filter="url(#vedic-glow)">
          <circle cx="0" cy="0" r="18" fill="none" stroke="#D4A843" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="12" fill="none" stroke="#D4A843" strokeWidth="0.5" />
          {/* Mace/gada shape */}
          <line x1="0" y1="8" x2="0" y2="-4" stroke="#D4A843" strokeWidth="1.5" opacity="0.5" />
          <circle cx="0" cy="-6" r="4" fill="none" stroke="#D4A843" strokeWidth="1" opacity="0.4" />
          <circle cx="0" cy="-6" r="2" fill="#D4A843" opacity="0.3" />
        </g>

        {/* Bottom-right: Kali Yuga — flame (purification fire) */}
        <g transform="translate(1880, 1040)" opacity="0.5" filter="url(#vedic-glow)">
          <circle cx="0" cy="0" r="18" fill="none" stroke="#E8751A" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="12" fill="none" stroke="#E8751A" strokeWidth="0.5" />
          {/* Flame */}
          <path
            d="M0 -10 C-3 -4, -5 0, -4 4 Q-2 8, 0 6 Q2 8, 4 4 C5 0, 3 -4, 0 -10Z"
            fill="#E8751A"
            opacity="0.4"
          />
          <path
            d="M0 -6 C-1.5 -2, -2.5 1, -2 3 Q-1 5, 0 4 Q1 5, 2 3 C2.5 1, 1.5 -2, 0 -6Z"
            fill="#FFD700"
            opacity="0.3"
          />
        </g>

        {/* ============================================================ */}
        {/*  TOP-CENTER: Sudarshana Chakra compass rose                   */}
        {/* ============================================================ */}
        <g transform="translate(960, 36)" opacity="0.45" filter="url(#vedic-glow)">
          {/* Outer serrated wheel */}
          <circle cx="0" cy="0" r="16" fill="none" stroke="#D4A843" strokeWidth="0.8" />
          {/* Spokes — 16 pointed */}
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i * 22.5 * Math.PI) / 180;
            const inner = 6;
            const outer = i % 2 === 0 ? 15 : 12;
            return (
              <line
                key={i}
                x1={Math.cos(a) * inner}
                y1={Math.sin(a) * inner}
                x2={Math.cos(a) * outer}
                y2={Math.sin(a) * outer}
                stroke="#D4A843"
                strokeWidth={i % 2 === 0 ? "1" : "0.5"}
                opacity={i % 2 === 0 ? "0.5" : "0.3"}
              />
            );
          })}
          {/* Inner hub */}
          <circle cx="0" cy="0" r="5" fill="none" stroke="#E8751A" strokeWidth="0.8" opacity="0.4" />
          <circle cx="0" cy="0" r="2" fill="#D4A843" opacity="0.4" />
          {/* Cardinal labels */}
          <text x="0" y="-20" textAnchor="middle" fill="#D4A843" fontSize="5" opacity="0.4" fontFamily="serif">उ</text>
          <text x="0" y="24" textAnchor="middle" fill="#D4A843" fontSize="5" opacity="0.4" fontFamily="serif">द</text>
          <text x="-22" y="2" textAnchor="middle" fill="#D4A843" fontSize="5" opacity="0.4" fontFamily="serif">प</text>
          <text x="22" y="2" textAnchor="middle" fill="#D4A843" fontSize="5" opacity="0.4" fontFamily="serif">पू</text>
        </g>
      </svg>

      {/* ---- Parchment edge glow (warm vignette replacement) ---- */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom, rgba(139, 105, 20, 0.12) 0%, transparent 8%),
            linear-gradient(to top, rgba(139, 105, 20, 0.15) 0%, transparent 10%),
            linear-gradient(to right, rgba(139, 105, 20, 0.1) 0%, transparent 6%),
            linear-gradient(to left, rgba(139, 105, 20, 0.1) 0%, transparent 6%)
          `,
        }}
      />

      {/* ---- Inner parchment texture — very subtle ---- */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 80%, rgba(212, 168, 67, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(232, 117, 26, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(212, 168, 67, 0.02) 0%, transparent 70%)
          `,
        }}
      />
    </motion.div>
  );
}
