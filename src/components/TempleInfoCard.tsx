"use client";

/**
 * TempleInfoCard — Info card for ISKCON New York temple
 *
 * Shown after the intro camera lands at the temple.
 * Contains temple info + a CTA to explore all program locations.
 *
 * RESPONSIVE:
 *  Desktop: positioned bottom-left, fixed width
 *  Mobile: full-width bottom sheet
 */

import { motion, AnimatePresence } from "framer-motion";

const panelVariants = {
  hidden: { y: 60, opacity: 0, scale: 0.95, filter: "blur(8px)" },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      damping: 26,
      stiffness: 220,
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
  exit: {
    y: 40,
    opacity: 0,
    scale: 0.97,
    filter: "blur(4px)",
    transition: { duration: 0.25 },
  },
};

const childVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, damping: 22, stiffness: 200 },
  },
};

interface TempleInfoCardProps {
  visible: boolean;
  onExplorePrograms: () => void;
}

export default function TempleInfoCard({ visible, onExplorePrograms }: TempleInfoCardProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={
            "absolute z-30 flex flex-col overflow-hidden rounded-2xl " +
            "border border-white/[0.08] bg-[#0c0c20]/75 shadow-2xl backdrop-blur-xl " +
            /* Desktop */
            "md:bottom-8 md:left-6 md:w-[380px] " +
            /* Mobile */
            "max-md:inset-x-3 max-md:bottom-4 max-md:top-auto"
          }
        >
          {/* ---- Header with gradient ---- */}
          <motion.div
            variants={childVariants}
            className="relative h-28 w-full shrink-0 overflow-hidden md:h-32"
          >
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, rgba(212, 168, 67, 0.25) 0%, rgba(232, 117, 26, 0.1) 50%, #0c0c20 100%)",
              }}
            />
            {/* Dot grid */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Krishna icon */}
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #D4A843, #E8751A)",
                  boxShadow: "0 0 14px rgba(212, 168, 67, 0.5)",
                }}
              >
                🙏
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90"
                style={{ background: "rgba(212, 168, 67, 0.3)" }}
              >
                Home Base
              </span>
            </div>

            {/* Decorative Om */}
            <span className="absolute right-4 top-3 text-2xl text-white/[0.06]">
              ॐ
            </span>
          </motion.div>

          {/* ---- Content ---- */}
          <div className="flex flex-col gap-3 p-5">
            <motion.h2
              variants={childVariants}
              className="text-lg font-bold leading-tight text-white md:text-xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ISKCON New York
            </motion.h2>

            <motion.div
              variants={childVariants}
              className="flex items-center gap-2 text-sm text-white/50"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M8 1C5 1 2.5 3.5 2.5 6.5C2.5 10.5 8 15 8 15s5.5-4.5 5.5-8.5C13.5 3.5 11 1 8 1Z" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="8" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              305 Schermerhorn St, Brooklyn, NY 11217
            </motion.div>

            <motion.p
              variants={childVariants}
              className="text-sm leading-relaxed text-white/65"
            >
              The heart of Gita Life NYC. Founded in 1966 by His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda, ISKCON New York is where the Hare Krishna movement began in the Western world.
            </motion.p>

            {/* Divider */}
            <motion.div
              variants={childVariants}
              className="h-px w-full bg-white/[0.06]"
            />

            {/* Explore Programs CTA */}
            <motion.button
              variants={childVariants}
              onClick={onExplorePrograms}
              className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl py-3 px-4 text-sm font-semibold text-white transition-colors"
              style={{
                background: "linear-gradient(135deg, #E8751A, #D4A843)",
                boxShadow: "0 4px 24px rgba(232, 117, 26, 0.3)",
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 6px 32px rgba(232, 117, 26, 0.45), 0 0 60px rgba(232, 117, 26, 0.15)" }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button shimmer */}
              <motion.span
                className="absolute inset-0 -z-10"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1, ease: "easeInOut" }}
              />
              <span className="uppercase tracking-wider">Explore Programs</span>
              <motion.svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="transition-transform group-hover:translate-x-1"
                whileHover={{ x: 3 }}
              >
                <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
