"use client";

/**
 * TheVibe — the event manifesto.
 *
 * The typography unfolds on scroll: heading words rise word-by-word,
 * then the serif line and paragraphs, on one staggered viewport
 * trigger.
 */

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const unfold: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const HEADLINE_WORDS = "A rave where the drop is a".split(" ");

export default function TheVibe() {
  const reduce = useReducedMotion();
  return (
    <section id="vibe" className="relative mx-auto max-w-3xl scroll-mt-20 px-6 py-20 sm:py-28">
      {/* manifesto — unfolds word-by-word, then line-by-line on scroll */}
      <motion.div
        variants={unfold}
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.p variants={rise} className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
          The Vibe
        </motion.p>
        <h2 className="mt-4 leading-[1.2] text-club-ink">
          <span className="block font-sans text-[22px] font-bold uppercase tracking-[0.08em] sm:text-[28px]">
            {HEADLINE_WORDS.map((word, i) => (
              <Fragment key={i}>
                <motion.span variants={rise} className="inline-block">
                  {word}
                </motion.span>
                {i < HEADLINE_WORDS.length - 1 ? " " : null}
              </Fragment>
            ))}
          </span>
          <motion.span variants={rise} className="bc2-display block italic text-[34px] sm:text-[46px]" style={{ fontWeight: 500 }}>
            mantra
          </motion.span>
        </h2>
        <motion.p variants={rise} className="mt-6 text-[15.5px] leading-[1.8]" style={{ color: "var(--bc2-ink-dim)" }}>
          Bhajan clubbing takes the centuries-old practice of devotional call-and-response singing and puts it on a
          concert rig with a serious sound system. The lyrics stay sacred. The energy goes
          vertical. Everybody dances, and by the last chorus a room of strangers is one voice.
        </motion.p>
        <motion.p variants={rise} className="mt-4 text-[15.5px] leading-[1.8]" style={{ color: "var(--bc2-ink-dim)" }}>
          Inspired by ISKCON NYC&apos;s Times Square harinam — where the holy name stops Midtown in its tracks every week — and this summer, Jersey City gets its first night.
        </motion.p>
      </motion.div>
    </section>
  );
}
