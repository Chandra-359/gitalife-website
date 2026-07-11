"use client";

/**
 * TheVibe — short manifesto on the kirtan × club fusion, with the four
 * vibe facts as frosted glass tiles.
 */

import { motion } from "framer-motion";
import { Icon } from "@/components/home/icons";
import { VIBE_FACTS } from "@/data/bajanClubbing";

const ACCENT: Record<string, string> = {
  gold: "#FFB25C",
  saffron: "#FF7A1A",
  peacock: "#4D9FFF",
  lotus: "#E86BB7",
};

export default function TheVibe() {
  return (
    <section id="vibe" className="relative mx-auto max-w-5xl scroll-mt-20 px-6 py-20 sm:py-28">
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* manifesto */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
            The Vibe
          </p>
          <h2 className="bc2-display mt-4 text-[30px] leading-[1.05] text-white sm:text-[40px]">
            A rave where the{" "}
            <span className="bc2-headline-grad">drop is a mantra</span>
          </h2>
          <p className="mt-6 text-[15.5px] leading-[1.8]" style={{ color: "var(--bc2-ink-dim)" }}>
            Bhajan clubbing takes the centuries-old practice of devotional call-and-response singing and puts it on a
            concert rig — smoke, lasers, LED walls, a serious sound system. The lyrics stay sacred. The energy goes
            vertical. Nobody drinks, everybody dances, and by the last chorus a room of strangers is one voice.
          </p>
          <p className="mt-4 text-[15.5px] leading-[1.8]" style={{ color: "var(--bc2-ink-dim)" }}>
            Born in Mumbai, now filling halls from Delhi to Kathmandu — and this summer, Jersey City gets its first night.
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
                className="bc2-glass bc2-glass-hover bc2-edge-top p-5"
                style={{ "--bc2-edge": accent, "--bc2-hover-glow": `${accent}55` } as React.CSSProperties}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${accent}1f`, border: `1px solid ${accent}45`, color: accent }}
                >
                  <Icon name={fact.icon} size={18} />
                </span>
                <h3 className="mt-3 text-[15px] font-bold text-white">{fact.title}</h3>
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
