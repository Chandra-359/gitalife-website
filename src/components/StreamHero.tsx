"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Program } from "@/data/programs";
import { getCategoryColor, getCategoryIcon } from "@/data/programs";

interface StreamHeroProps {
  programs: Program[];
  onSelectProgram: (program: Program) => void;
  onRsvp: (program: Program) => void;
}

export default function StreamHero({ programs, onSelectProgram, onRsvp }: StreamHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = programs.length > 0 ? programs[activeIndex % programs.length] : null;

  // Auto-rotate every 8 seconds
  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % programs.length);
  }, [programs.length]);

  useEffect(() => {
    if (programs.length <= 1) return;
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [next, programs.length]);

  if (!featured) return null;

  const { bg, glow } = getCategoryColor(featured.category);
  const icon = getCategoryIcon(featured.category);

  return (
    <div className="relative w-full h-[70vh] min-h-[480px] max-h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={featured.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background image */}
          {featured.imageUrl ? (
            <img
              src={featured.imageUrl}
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 30% 40%, ${bg}30 0%, transparent 60%), linear-gradient(160deg, #0F1B4D 0%, #0a0a1a 50%, ${bg}15 100%)`,
              }}
            >
              {/* Large decorative icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[180px] opacity-[0.04]">{icon}</span>
              </div>
            </div>
          )}

          {/* Cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a1a]/95 via-[#0a0a1a]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-[#0a0a1a]/30" />
          <div
            className="absolute bottom-0 left-0 right-0 h-40"
            style={{
              background: "linear-gradient(to top, #0a0a1a 0%, transparent 100%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content — left-aligned like Netflix */}
      <div className="absolute inset-0 flex items-end pb-16 md:pb-20">
        <div className="px-6 md:px-12 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={featured.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Category + Type badges */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: `${bg}cc` }}
                >
                  <span className="text-[13px]">{icon}</span>
                  {featured.category}
                </span>
                {featured.featured && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-[#D4A843] to-[#E8751A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1l2.24 4.54 5.01.73-3.63 3.53.86 4.99L8 12.27l-4.48 2.52.86-4.99L.75 6.27l5.01-.73L8 1z" />
                    </svg>
                    Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-3">
                {featured.title}
              </h1>

              {/* Subtitle */}
              {featured.subtitle && (
                <p className="text-base md:text-lg text-white/60 italic mb-3 font-serif">
                  &ldquo;{featured.subtitle}&rdquo;
                </p>
              )}

              {/* Meta info row */}
              <div className="flex flex-wrap items-center gap-3 mb-5 text-[13px] text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-white/40">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2 7h12" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  Every {featured.dayOfWeek}
                </span>
                {featured.time && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="inline-flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-white/40">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      {featured.time}
                    </span>
                  </>
                )}
                {featured.duration && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{featured.duration}</span>
                  </>
                )}
                {featured.venueName && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="inline-flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-white/40">
                        <path d="M8 1C5.24 1 3 3.13 3 5.75 3 9.5 8 15 8 15s5-5.5 5-9.25C13 3.13 10.76 1 8 1Z" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      {featured.venueName}
                    </span>
                  </>
                )}
              </div>

              {/* Description (truncated) */}
              <p className="text-sm md:text-[15px] text-white/50 leading-relaxed line-clamp-3 mb-6 max-w-lg">
                {featured.description}
              </p>

              {/* CTA buttons — Netflix style */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onRsvp(featured)}
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[14px] font-bold text-white shadow-xl transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
                    boxShadow: `0 4px 24px ${glow}`,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  RSVP Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectProgram(featured)}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 px-6 py-3 text-[14px] font-bold text-white hover:bg-white/20 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  More Info
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination dots — bottom right */}
      {programs.length > 1 && (
        <div className="absolute bottom-6 right-6 md:right-12 flex items-center gap-2">
          {programs.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="relative h-1 rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 24 : 8,
                backgroundColor: i === activeIndex ? bg : "rgba(255,255,255,0.25)",
              }}
              aria-label={`Show program ${i + 1}`}
            >
              {i === activeIndex && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: bg }}
                  layoutId="hero-dot"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
