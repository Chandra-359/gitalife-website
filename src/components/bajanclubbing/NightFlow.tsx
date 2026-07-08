"use client";

/**
 * NightFlow — vertical run-of-show timeline with a glowing rail.
 * Reads like the back of a club flyer: time · act · one-liner.
 */

import { motion } from "framer-motion";
import { C } from "@/components/home/icons";
import { NIGHT_FLOW, type AccentToken } from "@/data/bajanClubbing";

const DOT: Record<AccentToken, string> = {
  gold: C.gold,
  saffron: C.saffron,
  peacock: C.peacockLight,
  lotus: C.lotusPink,
};

export default function NightFlow() {
  return (
    <section className="relative mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="eyebrow" style={{ color: C.goldLight }}>
          Run of Show
        </p>
        <h2 className="mt-3 text-3xl text-white sm:text-4xl" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
          How the night <em style={{ color: C.goldLight }}>builds</em>
        </h2>
      </motion.div>

      <div className="relative mt-12">
        {/* Glowing rail */}
        <span
          className="absolute bottom-2 left-[29px] top-2 w-px sm:left-[37px]"
          style={{ background: `linear-gradient(180deg, ${C.gold}00, ${C.gold}59 12%, ${C.saffron}59 55%, ${C.lotusPink}40 88%, transparent)` }}
          aria-hidden
        />

        <ol className="space-y-7">
          {NIGHT_FLOW.map((stop, i) => (
            <motion.li
              key={stop.time}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative flex items-start gap-5 sm:gap-7"
            >
              {/* Time chip on the rail */}
              <span
                className="relative z-10 flex w-[58px] shrink-0 items-center justify-center rounded-full py-1.5 text-[12px] font-bold tabular-nums sm:w-[74px] sm:text-[13px]"
                style={{
                  background: "rgba(8,14,42,0.92)",
                  border: `1px solid ${DOT[stop.accent]}59`,
                  color: C.goldLight,
                  boxShadow: `0 0 18px -4px ${DOT[stop.accent]}66`,
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                }}
              >
                {stop.time}
              </span>

              <div className="min-w-0 pt-0.5">
                <h3 className="text-[17px] font-semibold leading-snug text-white" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
                  {stop.title}
                </h3>
                <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "rgba(251,245,230,0.62)" }}>
                  {stop.detail}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
