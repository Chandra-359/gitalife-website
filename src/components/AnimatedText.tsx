"use client";

/**
 * AnimatedText — Split-text character reveal animation
 *
 * Each character animates in individually with staggered timing,
 * creating a premium "typewriter meets fade" effect.
 */

import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  /** Duration per character */
  charDuration?: number;
  /** Stagger between characters */
  stagger?: number;
  /** Tag to render */
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

const containerVariants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: {
      staggerChildren: 0.03,
      delayChildren: delay,
    },
  }),
};

const charVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 150,
    },
  },
};

export default function AnimatedText({
  text,
  className = "",
  delay = 0,
  as: Tag = "span",
}: AnimatedTextProps) {
  // Split into words, then characters, preserving spaces
  const words = text.split(" ");

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      aria-label={text}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap">
          {word.split("").map((char, charIdx) => (
            <motion.span
              key={`${wordIdx}-${charIdx}`}
              variants={charVariants}
              className="inline-block"
              style={{ willChange: "transform, opacity, filter" }}
            >
              {char}
            </motion.span>
          ))}
          {/* Space between words */}
          {wordIdx < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </motion.span>
  );
}
