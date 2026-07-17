"use client";

/**
 * PrasadamFeast — dedicated section advertising the free packed prasadam
 * from Sri Sri Radha Govinda Temple. Sits between the details grid and
 * the ticket flow so it's the last thing guests read before buying.
 * Copy lives in PRASADAM (src/data/bhajanClubbing.ts).
 */

import { motion } from "framer-motion";
import { Icon } from "@/components/home/icons";
import { PRASADAM } from "@/data/bhajanClubbing";

export default function PrasadamFeast() {
  return (
    <section id="prasadam" className="relative mx-auto max-w-4xl scroll-mt-20 px-6 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="bc3-panel bc3-edge-top relative overflow-hidden p-8 text-center sm:p-12"
        style={{ "--bc3-edge": "#EDD698" } as React.CSSProperties}
      >
        {/* warm glow behind the card content */}
        <div
          className="bc3-glow left-1/2 top-0 h-[260px] w-[520px] -translate-x-1/2"
          style={{ "--glow": "rgba(201,162,72,0.14)" } as React.CSSProperties}
          aria-hidden
        />

        <span
          className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(201,162,72,0.12)", border: "1px solid var(--bc3-line)", color: "var(--bc3-gold-hi)" }}
        >
          <Icon name="food" size={26} />
        </span>

        <p className="bc3-eyebrow relative mt-5">From {PRASADAM.temple}</p>
        <h2 className="bc3-display relative mt-4 text-[28px] leading-[1.1] text-white sm:text-[38px]">
          Free <span className="bc3-headline-warm">prasadam</span> for every guest
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-[14.5px] leading-relaxed" style={{ color: "var(--bc3-ink-dim)" }}>
          {PRASADAM.detail}
        </p>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {PRASADAM.points.map((point) => (
            <span
              key={point}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold"
              style={{
                background: "rgba(251,245,230,0.05)",
                border: "1px solid var(--bc3-line)",
                color: "var(--bc3-ink)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--bc3-gold)" }} aria-hidden />
              {point}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
