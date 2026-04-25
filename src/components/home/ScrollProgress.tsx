"use client";

/**
 * ScrollProgress — a thin saffron→gold→lotus progress bar pinned to the top
 * of the viewport that fills as the user scrolls the page.
 *
 * Hidden when `prefers-reduced-motion` is on.
 */

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.3,
  });

  if (reduce) return null;

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden />;
}
