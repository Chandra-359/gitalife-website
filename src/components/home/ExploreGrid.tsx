"use client";

/**
 * ExploreGrid — Airbnb-style icon category grid.
 * 8 tiles, each linking to a dedicated sub-page (some stubbed, will be built in Phase 2).
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { EXPLORE_CATEGORIES } from "@/data/home";
import { C, Icon, colorFor } from "./icons";

export default function ExploreGrid() {
  return (
    <section id="explore" className="relative py-20 px-6" style={{ background: "white" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.gold }}
          >
            <Icon name="lotus" size={14} />
            Explore
          </span>
          <h2
            className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
            style={{ color: C.krishnaBlue }}
          >
            How to get involved
          </h2>
          <p className="mt-3 max-w-md mx-auto text-[14px] text-gray-500">
            Daily practice, weekly classes, seva opportunities, and more
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {EXPLORE_CATEGORIES.map((cat, i) => {
            const color = colorFor(cat.color);
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link
                  href={cat.href}
                  className="group relative flex flex-col items-start gap-3 rounded-2xl p-5 h-full transition-all hover:-translate-y-1"
                  style={{
                    background: C.cream,
                    border: `1px solid ${C.gold}20`,
                  }}
                >
                  {/* Hover border glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 30% 0%, ${color}15, transparent 60%)`,
                    }}
                  />

                  <div
                    className="relative flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{
                      background: `${color}12`,
                      color: color,
                      border: `1px solid ${color}20`,
                    }}
                  >
                    <Icon name={cat.icon} size={20} />
                  </div>

                  <div className="relative">
                    <h3
                      className="text-[15px] font-semibold"
                      style={{ color: C.krishnaBlue }}
                    >
                      {cat.title}
                    </h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                      {cat.blurb}
                    </p>
                  </div>

                  <span
                    className="relative mt-auto inline-flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: color }}
                  >
                    Explore
                    <Icon name="arrowRight" size={11} />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
