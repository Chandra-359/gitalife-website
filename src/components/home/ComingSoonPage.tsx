"use client";

/**
 * ComingSoonPage — shared stub used by the Phase-2 routes
 * (/classes, /festival, /daily, /retreats, /gallery, /volunteer, /impact)
 * until those pages are fully built out.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { C, Icon } from "./icons";

interface ComingSoonPageProps {
  eyebrow: string;
  heading: string;
  description: string;
  homeBlurb?: string;
}

export default function ComingSoonPage({
  eyebrow,
  heading,
  description,
  homeBlurb,
}: ComingSoonPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: C.cream }}>
      <Navbar />

      <section
        className="relative min-h-screen flex items-center justify-center px-6"
        style={{
          background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 100%)`,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.saffron}, ${C.gold}, transparent)`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-2xl text-center"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{
              background: "rgba(212,168,67,0.12)",
              border: `1px solid ${C.gold}30`,
              color: C.goldLight,
            }}
          >
            <Icon name="sparkle" size={12} />
            {eyebrow}
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl font-bold font-serif text-white leading-tight">
            {heading}
          </h1>

          <p
            className="mt-6 text-[15px] sm:text-[16px] leading-[1.75] max-w-lg mx-auto"
            style={{ color: "rgba(255,251,242,0.7)" }}
          >
            {description}
          </p>

          {homeBlurb && (
            <p
              className="mt-3 text-[13px] italic"
              style={{ color: "rgba(240,214,138,0.55)" }}
            >
              {homeBlurb}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full px-6 py-3 text-[13px] font-semibold text-white transition-all hover:scale-[1.03] flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                boxShadow: `0 0 25px ${C.gold}30`,
              }}
            >
              Back to home
              <Icon name="arrowRight" size={13} />
            </Link>
            <Link
              href="/#explore"
              className="rounded-full px-6 py-3 text-[13px] font-semibold transition-all hover:bg-white/10"
              style={{
                border: `1px solid ${C.gold}30`,
                color: C.goldLight,
              }}
            >
              Explore other areas
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
