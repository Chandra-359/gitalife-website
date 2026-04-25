"use client";

/**
 * ImpactSection — charity:water-inspired big-number storytelling.
 * Four large stats with punchy copy, leading to the full impact page.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { IMPACT_STATS } from "@/data/home";
import { C, Icon } from "./icons";

export default function ImpactSection() {
  return (
    <section
      id="impact"
      className="relative py-24 px-6 overflow-hidden surface-sacred texture-grain isolate"
    >
      {/* Decorative ornamental borders */}
      <div className="absolute top-0 left-0 right-0 ornament-border-thick" />
      <div className="absolute bottom-0 left-0 right-0 ornament-border-thick" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.goldLight }}
          >
            <Icon name="trophy" size={14} />
            Our Impact
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-bold font-serif text-white">
            What the last year has looked like
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-[14px]" style={{ color: "rgba(255,251,242,0.65)" }}>
            Real numbers from our community &mdash; books shared, meals served, classes held,
            retreats offered
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {IMPACT_STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative"
            >
              <p
                className="text-6xl sm:text-7xl font-bold font-serif leading-[0.95] tracking-tight text-gradient-warm-glow"
              >
                {stat.number}
              </p>
              <p
                className="mt-3 text-[13px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: C.gold }}
              >
                {stat.label}
              </p>
              <p
                className="mt-2 text-[13px] leading-[1.65]"
                style={{ color: "rgba(255,251,242,0.55)" }}
              >
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            href="/impact"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-[13px] font-semibold transition-all hover:scale-[1.03]"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${C.gold}35`,
              color: C.goldLight,
            }}
          >
            See the full impact story
            <Icon name="arrowRight" size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
