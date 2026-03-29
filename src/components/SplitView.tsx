"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Program } from "@/data/programs";
import MapScene from "@/components/MapScene";
import ProgramCard from "@/components/ProgramCard";

const GITA_QUOTES = [
  { text: "You have the right to work, but never to the fruit of work.", ref: "BG 2.47" },
  { text: "The soul is neither born, and nor does it die.", ref: "BG 2.20" },
  { text: "When meditation is mastered, the mind is unwavering like the flame of a candle in a windless place.", ref: "BG 6.19" },
  { text: "Change is the law of the universe.", ref: "BG 4.7" },
  { text: "A person can rise through the efforts of their own mind.", ref: "BG 6.5" },
];

interface SplitViewProps {
  programs: Program[];
}

export default function SplitView({ programs }: SplitViewProps) {
  const [hoveredProgramId, setHoveredProgramId] = useState<string | null>(null);
  const [isMobileMapView, setIsMobileMapView] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % GITA_QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      {/* Left panel — scrollable program list */}
      {/* Mobile: hidden when map is active. Desktop: always visible. */}
      <div
        className={`relative w-full md:w-1/2 h-full overflow-y-auto bg-gradient-to-b from-[#FFF9F0] to-[#FFF3E0] ${
          isMobileMapView ? "hidden md:block" : ""
        }`}
      >
        <div className="px-5 py-6 pb-24 md:pb-6">
          {/* ---- Welcome header with rotating Gita quote ---- */}
          <div className="mb-6 text-center">
            {/* Lotus icon */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 28 28"
              fill="none"
              className="mx-auto mb-2 opacity-70"
            >
              <circle cx="14" cy="14" r="13" stroke="#E8751A" strokeWidth="1.2" opacity="0.4" />
              <path
                d="M14 6c-2 3-5 6-5 9a5 5 0 0 0 10 0c0-3-3-6-5-9Z"
                fill="#E8751A"
                opacity="0.75"
              />
              <path
                d="M14 10c-1.2 2-3 4-3 5.8a3 3 0 0 0 6 0c0-1.8-1.8-3.8-3-5.8Z"
                fill="#D4A843"
                opacity="0.6"
              />
            </svg>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Discover Gita Wisdom
            </h2>

            {/* Rotating quote */}
            <div className="h-12 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-[13px] leading-relaxed text-[#8B6914] italic max-w-xs mx-auto"
                >
                  &ldquo;{GITA_QUOTES[quoteIndex].text}&rdquo;
                  <span className="not-italic text-[11px] text-[#B8860B]/60 ml-1.5">
                    — {GITA_QUOTES[quoteIndex].ref}
                  </span>
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Decorative divider with lotus center */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#E8751A]/20" />
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-40">
                <path d="M6 1c-1 1.5-2.5 3-2.5 4.5a2.5 2.5 0 0 0 5 0C8.5 4 7 2.5 6 1Z" fill="#E8751A" />
              </svg>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#E8751A]/20" />
            </div>
          </div>

          {/* Programs heading */}
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-gray-800">
              Upcoming Programs
            </h3>
            <span className="text-[12px] text-gray-400">
              {programs.length} events
            </span>
          </div>

          {/* Program cards */}
          <div className="space-y-3">
            {programs.map((program, index) => (
              <ProgramCard
                key={program.id}
                program={program}
                index={index}
                isHovered={hoveredProgramId === program.id}
                onMouseEnter={() => setHoveredProgramId(program.id)}
                onMouseLeave={() => setHoveredProgramId(null)}
              />
            ))}
          </div>
        </div>

        {/* Bottom scroll fade */}
        <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FFF3E0] to-transparent" />
      </div>

      {/* Right panel — map */}
      {/* Mobile: hidden when list is active. Desktop: always visible. */}
      <div
        className={`w-full md:w-1/2 h-full relative overflow-hidden ${
          isMobileMapView ? "" : "hidden md:block"
        }`}
      >
        <MapScene programs={programs} hoveredProgramId={hoveredProgramId} />
      </div>

      {/* Mobile FAB — toggles between list and map view */}
      <button
        onClick={() => setIsMobileMapView((v) => !v)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-gray-900 shadow-lg shadow-black/15 border border-gray-200 active:scale-95 transition-transform"
      >
        {isMobileMapView ? (
          <>
            {/* List icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Show List
          </>
        ) : (
          <>
            {/* Map icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Show Map
          </>
        )}
      </button>
    </div>
  );
}
