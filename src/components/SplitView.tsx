"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import type { Program } from "@/data/programs";
import MapScene from "@/components/MapScene";
import ProgramCard from "@/components/ProgramCard";
import ProgramDetail from "@/components/ProgramDetail";

const GITA_QUOTES = [
  { text: "You have the right to work, but never to the fruit of work.", ref: "BG 2.47" },
  { text: "The soul is neither born, and nor does it die.", ref: "BG 2.20" },
  { text: "When meditation is mastered, the mind is unwavering like the flame of a candle in a windless place.", ref: "BG 6.19" },
  { text: "Change is the law of the universe.", ref: "BG 4.7" },
  { text: "A person can rise through the efforts of their own mind.", ref: "BG 6.5" },
];

/* Decorative floating particles for the left panel background */
const BG_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${12 + (i * 53) % 76}%`,
  top: `${8 + (i * 37) % 80}%`,
  size: 3 + (i % 3) * 2,
  delay: i * 0.8,
  duration: 8 + (i % 4) * 3,
}));

/* Animation variants for list ↔ detail transition */
const listVariants = {
  enter: { x: -40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
};

const detailVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: 40, opacity: 0 },
};

interface SplitViewProps {
  programs: Program[];
}

export default function SplitView({ programs }: SplitViewProps) {
  const [hoveredProgramId, setHoveredProgramId] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isMobileMapView, setIsMobileMapView] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % GITA_QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectProgram = useCallback((program: Program) => {
    setSelectedProgram(program);
    setIsMobileMapView(false);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedProgram(null);
  }, []);

  // Count upcoming programs
  const upcomingCount = programs.filter(p => new Date(p.date) > new Date()).length;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "16px",
            background: "#1a1a2e",
            color: "#fff",
            fontSize: "14px",
            padding: "12px 20px",
          },
        }}
      />

      {/* Left panel — card list OR detail view */}
      <div
        className={`relative w-full md:w-1/2 h-full shrink-0 overflow-hidden ${
          isMobileMapView ? "hidden md:block" : "z-10 md:z-auto"
        }`}
      >
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            background: "linear-gradient(135deg, #FFF9F0 0%, #FFF3E0 30%, #FFF8F0 60%, #FFF5E6 100%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Floating decorative particles */}
        {BG_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: "rgba(232, 117, 26, 0.12)",
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.15, 0.4, 0.15],
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

        <AnimatePresence mode="wait">
          {selectedProgram ? (
            /* ---- Detail view ---- */
            <motion.div
              key="detail"
              variants={detailVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="h-full relative z-10"
            >
              <ProgramDetail program={selectedProgram} onBack={handleBack} />
            </motion.div>
          ) : (
            /* ---- Card list view ---- */
            <motion.div
              key="list"
              variants={listVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="h-full overflow-y-auto custom-scrollbar relative z-10"
            >
              <div className="px-5 py-6 pb-24 md:pb-6">
                {/* ---- Welcome header ---- */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-8 text-center"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Discover <span className="text-gradient-saffron">Gita Wisdom</span>
                  </h2>
                  <p className="text-[13px] text-gray-500 mb-3">
                    Join transformative programs across NYC
                  </p>

                  {/* Rotating quote */}
                  <div className="h-14 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={quoteIndex}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                      >
                        <p className="text-[13px] leading-relaxed text-[#8B6914] italic max-w-sm mx-auto">
                          &ldquo;{GITA_QUOTES[quoteIndex].text}&rdquo;
                        </p>
                        <span className="text-[11px] text-[#B8860B]/50 font-medium">
                          — {GITA_QUOTES[quoteIndex].ref}
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Decorative divider */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E8751A]/20 to-transparent" />
                  </div>
                </motion.div>

                {/* Programs heading with count */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between mb-5"
                >
                  <div>
                    <h3 className="text-[16px] font-bold text-gray-800">
                      Upcoming Programs
                    </h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {upcomingCount} {upcomingCount === 1 ? "event" : "events"} waiting for you
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 rounded-full bg-[#E8751A]/10 px-3 py-1.5 text-[11px] font-semibold text-[#E8751A]"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#E8751A] opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E8751A]" />
                    </span>
                    Live
                  </motion.div>
                </motion.div>

                {/* Program cards */}
                <div className="space-y-3.5">
                  {programs.map((program, index) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      index={index}
                      isHovered={hoveredProgramId === program.id}
                      onMouseEnter={() => setHoveredProgramId(program.id)}
                      onMouseLeave={() => setHoveredProgramId(null)}
                      onClick={() => handleSelectProgram(program)}
                    />
                  ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <p className="text-[12px] text-gray-400">
                    Click any program to learn more and RSVP
                  </p>
                </motion.div>
              </div>

              {/* Bottom scroll fade */}
              <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFF3E0] via-[#FFF3E0]/80 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right panel — map */}
      <div
        className={`absolute inset-0 md:relative md:inset-auto md:w-1/2 md:h-full overflow-hidden ${
          isMobileMapView
            ? "z-20 md:z-auto"
            : "z-0 pointer-events-none md:pointer-events-auto md:z-auto"
        }`}
      >
        <MapScene
          programs={programs}
          hoveredProgramId={hoveredProgramId}
          selectedProgramId={selectedProgram?.id ?? null}
          onSelectProgram={handleSelectProgram}
        />
      </div>

      {/* Mobile FAB — toggles between list and map view */}
      {!selectedProgram && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", damping: 20 }}
          onClick={() => setIsMobileMapView((v) => !v)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center gap-2.5 rounded-full bg-white/95 backdrop-blur-xl px-6 py-3.5 text-sm font-semibold text-gray-900 shadow-xl shadow-black/10 border border-white/50 active:scale-95 transition-transform"
        >
          {isMobileMapView ? (
            <>
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
        </motion.button>
      )}
    </div>
  );
}
