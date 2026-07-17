"use client";

/**
 * TheVibe — teach-first "What is kirtan?" section: two short prose
 * paragraphs (INTRO.body) explaining the practice before anything is
 * sold, with the four vibe facts as quiet warm panels alongside.
 */

import { motion } from "framer-motion";
import { Icon } from "@/components/home/icons";
import { INTRO, VIBE_FACTS } from "@/data/bhajanClubbing";

const ACCENT: Record<string, string> = {
  gold: "#EDD698",
  saffron: "#E8873C",
  peacock: "#00917A",
  lotus: "#C84682",
};

export default function TheVibe() {
  return (
    <section id="vibe" className="relative mx-auto max-w-5xl scroll-mt-20 px-6 py-20 sm:py-28">
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* teach-first prose */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="bc3-eyebrow">What is kirtan?</p>
          <h2 className="bc3-display mt-4 text-[30px] leading-[1.1] text-white sm:text-[40px]">
            A rave where the <span className="bc3-headline-warm">drop is a mantra</span>
          </h2>
          {INTRO.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mt-5 max-w-prose text-[15.5px] leading-[1.8]" style={{ color: "var(--bc3-ink-dim)" }}>
              {paragraph}
            </p>
          ))}
          <p className="mt-5 text-[13px]" style={{ color: "var(--bc3-ink-faint)" }}>
            New to all of this?{" "}
            <a href="#faq" className="font-semibold underline decoration-[rgba(201,162,72,0.5)] underline-offset-4 transition-colors hover:text-white" style={{ color: "var(--bc3-gold)" }}>
              The FAQ has you covered.
            </a>
          </p>
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
                className="bc3-panel bc3-panel-hover bc3-edge-top p-5"
                style={{ "--bc3-edge": accent } as React.CSSProperties}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${accent}1a`, border: `1px solid ${accent}40`, color: accent }}
                >
                  <Icon name={fact.icon} size={18} />
                </span>
                <h3 className="mt-3 text-[15px] font-bold text-white">{fact.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--bc3-ink-dim)" }}>
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
