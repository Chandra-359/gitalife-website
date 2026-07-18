"use client";

/**
 * TheVibe — short manifesto on the kirtan × club fusion, with the four
 * vibe facts as frosted glass tiles. The manifesto typography unfolds
 * on scroll: heading words rise word-by-word, then the serif line and
 * paragraphs follow, all driven by one staggered viewport trigger.
 */

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Icon } from "@/components/home/icons";
import { VIBE_FACTS } from "@/data/bhajanClubbing";

const unfold: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const HEADLINE_WORDS = "A rave where the drop is a".split(" ");

/* Warm accents only — every icon ties back into the hero aura
   (muted saffron / soft rose / warm sand). */
const ACCENT: Record<string, string> = {
  gold: "#E5C08D",
  saffron: "#D98A4A",
  peacock: "#D89E8A",
  lotus: "#C08CA6",
};

export default function TheVibe() {
  const reduce = useReducedMotion();
  return (
    <section id="vibe" className="relative mx-auto max-w-5xl scroll-mt-20 px-6 py-20 sm:py-28">
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
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
            vertical. Nobody drinks, everybody dances, and by the last chorus a room of strangers is one voice.
          </motion.p>
          <motion.p variants={rise} className="mt-4 text-[15.5px] leading-[1.8]" style={{ color: "var(--bc2-ink-dim)" }}>
            Born in Mumbai, now filling halls from Delhi to Kathmandu — and this summer, Jersey City gets its first night.
          </motion.p>
        </motion.div>

        {/* vibe tiles */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {VIBE_FACTS.map((fact, i) => {
            const accent = ACCENT[fact.accent];
            return (
              <motion.div
                key={fact.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="rounded-[22px] border border-white/10 bg-white/5 p-5 backdrop-blur-lg transition-all duration-500 ease-in-out hover:-translate-y-[3px] hover:bg-white/10"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${accent}1f`, border: `1px solid ${accent}45`, color: accent }}
                >
                  <Icon name={fact.icon} size={18} />
                </span>
                <h3 className="mt-3 text-[15px] font-bold text-club-ink">{fact.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
                  {fact.detail}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
