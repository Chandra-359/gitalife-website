"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
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

/* ------------------------------------------------------------------ */
/*  Bottom Sheet snap points (mobile only)                             */
/* ------------------------------------------------------------------ */
const SHEET_PEEK = 180;    // Collapsed: shows ~1 card row
const SHEET_MID = 0.5;     // Fraction of viewport: half screen
const SHEET_FULL = 0.85;   // Fraction of viewport: near full

interface SplitViewProps {
  programs: Program[];
}

export default function SplitView({ programs }: SplitViewProps) {
  const [hoveredProgramId, setHoveredProgramId] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const cardScrollRef = useRef<HTMLDivElement>(null);

  // Bottom sheet height (in px from bottom of viewport)
  const sheetHeight = useMotionValue(SHEET_PEEK);
  const sheetOpacity = useTransform(sheetHeight, [SHEET_PEEK, 400], [0, 1]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % GITA_QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectProgram = useCallback((program: Program) => {
    setSelectedProgram(program);
    // On mobile, expand sheet to full when selecting detail
    if (window.innerWidth < 768) {
      animate(sheetHeight, window.innerHeight * SHEET_FULL, {
        type: "spring",
        damping: 30,
        stiffness: 300,
      });
    }
  }, [sheetHeight]);

  const handleBack = useCallback(() => {
    setSelectedProgram(null);
    // On mobile, snap sheet back to mid
    if (window.innerWidth < 768) {
      animate(sheetHeight, window.innerHeight * SHEET_MID, {
        type: "spring",
        damping: 30,
        stiffness: 300,
      });
    }
  }, [sheetHeight]);

  // Handle bottom sheet drag end — snap to nearest point
  const handleSheetDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const vh = window.innerHeight;
      const currentHeight = sheetHeight.get();
      const velocity = -info.velocity.y; // positive = dragging up

      // Snap points in pixels
      const peekPx = SHEET_PEEK;
      const midPx = vh * SHEET_MID;
      const fullPx = vh * SHEET_FULL;

      let target: number;

      if (velocity > 500) {
        // Fast swipe up → go to next snap
        target = currentHeight < midPx ? midPx : fullPx;
      } else if (velocity < -500) {
        // Fast swipe down → go to previous snap
        target = currentHeight > midPx ? midPx : peekPx;
      } else {
        // Slow drag → snap to nearest
        const dists = [
          { point: peekPx, dist: Math.abs(currentHeight - peekPx) },
          { point: midPx, dist: Math.abs(currentHeight - midPx) },
          { point: fullPx, dist: Math.abs(currentHeight - fullPx) },
        ];
        dists.sort((a, b) => a.dist - b.dist);
        target = dists[0].point;
      }

      animate(sheetHeight, target, {
        type: "spring",
        damping: 30,
        stiffness: 300,
      });
    },
    [sheetHeight],
  );

  // Scroll to selected program card in horizontal scroll
  const scrollToCard = useCallback((programId: string) => {
    if (!cardScrollRef.current) return;
    const card = cardScrollRef.current.querySelector(`[data-program-id="${programId}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
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

      {/* ============================================================ */}
      {/*  DESKTOP: Left panel — card list OR detail view               */}
      {/* ============================================================ */}
      <div className="relative w-full md:w-1/2 h-full shrink-0 overflow-hidden hidden md:block">
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
              <div className="px-5 py-6 pb-6">
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

      {/* ============================================================ */}
      {/*  MAP — Full width on mobile, right half on desktop            */}
      {/* ============================================================ */}
      <div className="absolute inset-0 md:relative md:inset-auto md:w-1/2 md:h-full overflow-hidden z-0 md:z-auto">
        <MapScene
          programs={programs}
          hoveredProgramId={hoveredProgramId}
          selectedProgramId={selectedProgram?.id ?? null}
          onSelectProgram={(program) => {
            handleSelectProgram(program);
            if (isMobile) scrollToCard(program.id);
          }}
        />
      </div>

      {/* ============================================================ */}
      {/*  MOBILE: Bottom Sheet                                         */}
      {/* ============================================================ */}
      {isMobile && (
        <motion.div
          ref={sheetRef}
          className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
          style={{ height: sheetHeight }}
        >
          {/* Drag handle area */}
          <motion.div
            className="absolute top-0 left-0 right-0 cursor-grab active:cursor-grabbing touch-none"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDrag={(_, info) => {
              const newHeight = sheetHeight.get() - info.delta.y;
              const vh = window.innerHeight;
              const clamped = Math.max(SHEET_PEEK, Math.min(newHeight, vh * SHEET_FULL));
              sheetHeight.set(clamped);
            }}
            onDragEnd={handleSheetDragEnd}
          >
            {/* Visual sheet background with rounded top */}
            <div className="relative">
              <div className="absolute inset-x-0 top-0 h-[calc(100vh)] bg-[#FFF9F0] rounded-t-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.12)] border-t border-[#E8751A]/10" />

              {/* Drag handle */}
              <div className="relative flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* Sheet header */}
              <div className="relative px-5 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-gray-800">
                    {selectedProgram ? selectedProgram.title : "Upcoming Programs"}
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    {upcomingCount} event{upcomingCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sheet content */}
          <div
            className="absolute top-16 left-0 right-0 bottom-0 overflow-hidden bg-[#FFF9F0] rounded-t-3xl"
          >
            <AnimatePresence mode="wait">
              {selectedProgram ? (
                /* ---- Mobile detail view ---- */
                <motion.div
                  key="mobile-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full overflow-y-auto custom-scrollbar"
                >
                  <ProgramDetail program={selectedProgram} onBack={handleBack} />
                </motion.div>
              ) : (
                /* ---- Mobile card list ---- */
                <motion.div
                  key="mobile-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full overflow-y-auto custom-scrollbar"
                >
                  {/* Horizontal card carousel (visible at peek height) */}
                  <div
                    ref={cardScrollRef}
                    className="flex gap-3 px-5 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                  >
                    {programs.map((program, index) => (
                      <div
                        key={program.id}
                        data-program-id={program.id}
                        className="shrink-0 w-[85vw] max-w-[340px] snap-center"
                      >
                        <ProgramCard
                          program={program}
                          index={index}
                          isHovered={hoveredProgramId === program.id}
                          onMouseEnter={() => setHoveredProgramId(program.id)}
                          onMouseLeave={() => setHoveredProgramId(null)}
                          onClick={() => handleSelectProgram(program)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Full list below (visible when sheet expanded) */}
                  <motion.div
                    style={{ opacity: sheetOpacity }}
                    className="px-5 pb-8 space-y-3"
                  >
                    {/* Rotating quote */}
                    <div className="py-3 text-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={quoteIndex}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.4 }}
                        >
                          <p className="text-[12px] leading-relaxed text-[#8B6914] italic">
                            &ldquo;{GITA_QUOTES[quoteIndex].text}&rdquo;
                          </p>
                          <span className="text-[10px] text-[#B8860B]/50 font-medium">
                            — {GITA_QUOTES[quoteIndex].ref}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E8751A]/20 to-transparent" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">All Programs</span>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#E8751A]/20 to-transparent" />
                    </div>

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
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
