"use client";

/**
 * ResetViewButton — "Overview" pill that flies the camera back to HOME_VIEW
 *
 * Z-INDEX: z-30 (same tier as ProgramPanel, below Navbar z-40)
 *
 * Positioned top-left, pushed down (top-20) so it sits below the Navbar.
 * Fades in when a program is selected; fades out otherwise.
 */

import { motion, AnimatePresence } from "framer-motion";

interface ResetViewButtonProps {
  visible: boolean;
  onClick: () => void;
}

export default function ResetViewButton({ visible, onClick }: ResetViewButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={onClick}
          aria-label="Reset map to overview"
          className="absolute left-5 top-20 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-[#0e0e24]/80 px-4 py-2.5 text-sm font-medium text-white/90 shadow-lg backdrop-blur-md transition-colors hover:border-[#E8751A]/40 hover:bg-[#0e0e24] hover:text-white"
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ type: "spring", damping: 22, stiffness: 250 }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 24px rgba(232, 117, 26, 0.2)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Return arrow icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5L8 11.5M8 1.5L4 5.5M8 1.5L12 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 10.5C3 12.5 5.2 14.5 8 14.5C10.8 14.5 13 12.5 13 10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Overview
        </motion.button>
      )}
    </AnimatePresence>
  );
}
