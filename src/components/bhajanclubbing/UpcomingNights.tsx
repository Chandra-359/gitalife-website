"use client";

/**
 * UpcomingNights — small tour-dates strip that sits directly above the
 * ticket flow, the way artist sites list dates: volume · date · city ·
 * status. Scales to future volumes via UPCOMING in
 * src/data/bhajanClubbing.ts (a "tba" row renders without a live badge).
 */

import { motion } from "framer-motion";
import { UPCOMING } from "@/data/bhajanClubbing";

export default function UpcomingNights() {
  return (
    <div className="relative mx-auto max-w-4xl px-6 pt-16 sm:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <p className="bc3-eyebrow">Upcoming nights</p>
      </motion.div>

      <div className="mt-7 space-y-3">
        {UPCOMING.map((night, i) => (
          <motion.div
            key={`${night.volume}-${night.dateLabel}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="bc3-panel flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-7"
          >
            <span className="bc3-display text-[17px] text-white sm:text-[19px]">{night.volume}</span>
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--bc3-ink-dim)" }}>
              {night.dateLabel}
            </span>
            <span className="text-[13.5px]" style={{ color: "var(--bc3-ink-dim)" }}>
              {night.city}
            </span>
            {night.status === "on-sale" ? (
              <a
                href="#tickets"
                className="rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em]"
                style={{ background: "rgba(217,105,26,0.14)", border: "1px solid rgba(217,105,26,0.45)", color: "#F2B95C" }}
              >
                On sale below
              </a>
            ) : (
              <span
                className="rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em]"
                style={{ background: "rgba(251,245,230,0.05)", border: "1px solid rgba(251,245,230,0.16)", color: "var(--bc3-ink-faint)" }}
              >
                Announced soon
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
