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
        className="bc2-glass bc2-edge-top relative overflow-hidden p-8 text-center sm:p-12"
        style={{ "--bc2-edge": "#E5C08D" } as React.CSSProperties}
      >
        {/* warm glow behind the card content */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[520px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(229,192,141,0.16), transparent 65%)", filter: "blur(30px)" }}
          aria-hidden
        />

        <span
          className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(229,192,141,0.12)", border: "1px solid rgba(229,192,141,0.4)", color: "var(--bc2-amber)" }}
        >
          <Icon name="food" size={26} />
        </span>

        <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
          From {PRASADAM.temple}
        </p>
        <h2 className="bc2-display relative mt-4 text-[28px] leading-[1.1] text-club-ink sm:text-[38px]">
          Free <span className="bc2-headline-grad">prasadam</span> for every guest
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-[14.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
          {PRASADAM.detail}
        </p>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {PRASADAM.points.map((point) => (
            <span
              key={point}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold"
              style={{
                background: "rgba(244,240,235,0.06)",
                border: "1px solid rgba(229,192,141,0.32)",
                color: "var(--bc2-ink)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--bc2-amber)", boxShadow: "0 0 8px rgba(229,192,141,0.9)" }} aria-hidden />
              {point}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
