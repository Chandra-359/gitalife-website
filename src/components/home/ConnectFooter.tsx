"use client";

/**
 * ConnectFooter — testimonials + newsletter/social + footer.
 * Keeps the existing warm sign-off feel from the previous homepage.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";
import { INSTAGRAM_URL, YOUTUBE_URL } from "@/data/home";
import { C } from "./icons";

interface ConnectFooterProps {
  testimonials: Program[];
}

export default function ConnectFooter({ testimonials }: ConnectFooterProps) {
  return (
    <>
      {/* Testimonials on Krishna blue */}
      <section
        className="relative py-24 px-6 overflow-hidden"
        style={{
          background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 100%)`,
        }}
      >
        <div className="absolute top-0 left-0 right-0 ornament-border-thick" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.goldLight }}
            >
              Testimonials
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold font-serif text-white">
              What people are saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((prog, i) => {
              const { bg } = getCategoryColor(prog.category);
              return (
                <motion.div
                  key={prog.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(8px)",
                    border: `1px solid ${C.gold}15`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-10 h-10"
                    style={{
                      borderTop: `2px solid ${C.gold}25`,
                      borderLeft: `2px solid ${C.gold}25`,
                      borderRadius: "4px 0 0 0",
                    }}
                  />
                  <p className="text-[14px] italic leading-relaxed text-white/75 mb-4 font-serif">
                    &ldquo;{prog.testimonial}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: `linear-gradient(135deg, ${bg}, ${C.gold})` }}
                    >
                      {prog.testimonialAuthor?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white/90">
                        {prog.testimonialAuthor}
                      </p>
                      <p className="text-[11px]" style={{ color: `${C.goldLight}60` }}>
                        {prog.category}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Get Connected + footer */}
      <section
        id="get-connected"
        className="relative py-24 px-6 overflow-hidden"
        style={{
          background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, #080E2A 100%)`,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.saffron}, ${C.gold}, transparent)`,
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.goldLight }}
          >
            Join Us
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold font-serif text-white">
            Stay connected
          </h2>
          <p className="mt-3 max-w-md mx-auto text-[14px]" style={{ color: "rgba(240,214,138,0.45)" }}>
            Get updates on upcoming classes, festivals, and retreats
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-xl px-5 py-3.5 text-[14px] text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${C.gold}20`,
              }}
            />
            <button
              className="rounded-xl px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:scale-[1.03] shrink-0"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                boxShadow: `0 0 25px ${C.gold}25`,
              }}
            >
              Subscribe
            </button>
          </div>

          {/* Social */}
          <div className="mt-10 flex items-center justify-center gap-3">
            {[
              {
                label: "YouTube",
                href: YOUTUBE_URL,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" className="text-red-400">
                    <path
                      d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"
                      fill="currentColor"
                    />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
                  </svg>
                ),
              },
              {
                label: "Instagram",
                href: INSTAGRAM_URL,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                ),
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-[1.06]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${C.gold}15`,
                  color: `${C.goldLight}70`,
                }}
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Footer bar */}
          <div
            className="mt-14 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${C.gold}20, transparent)` }}
          />
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})` }}
              >
                G
              </div>
              <span className="text-[14px] font-bold text-white/80">
                Gita Life <span style={{ color: C.gold }}>NYC</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-[12px]">
              <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">
                Home
              </Link>
              <Link
                href="/classes"
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Classes
              </Link>
              <Link
                href="/festival"
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Festival
              </Link>
              <Link
                href="/daily"
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Daily
              </Link>
              <Link
                href="/impact"
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                Impact
              </Link>
            </div>

            <p className="text-[11px]" style={{ color: `${C.gold}30` }}>
              Hare Krishna &mdash; Made with devotion at ISKCON Brooklyn
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
