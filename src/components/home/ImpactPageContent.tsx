"use client";

/**
 * ImpactPageContent — Scrolling narrative for /impact.
 *
 * Pattern: hero → big stats → alternating story sections (one per
 * program) → timeline → CTA. Each story section has its own URL hash
 * anchor (#books, #govindas, etc.) linked to from the homepage.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  IMPACT_STATS,
  IMPACT_STORIES,
  IMPACT_TIMELINE,
  type ImpactStory,
} from "@/data/home";
import { C, Icon, colorFor } from "./icons";

export default function ImpactPageContent() {
  return (
    <div className="surface-paper min-h-screen">
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-28 pb-16 px-6 overflow-hidden"
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
        <div className="relative max-w-3xl mx-auto text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{
              background: "rgba(212,168,67,0.12)",
              border: `1px solid ${C.gold}30`,
              color: C.goldLight,
            }}
          >
            <Icon name="trophy" size={12} />
            Our Impact
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl font-bold font-serif text-white leading-tight">
            The numbers behind the work
          </h1>

          <p
            className="mt-5 text-[15px] sm:text-[16px] leading-[1.75] max-w-xl mx-auto"
            style={{ color: "rgba(255,251,242,0.72)" }}
          >
            Every week for the past three years: classes, kitchens, books,
            retreats. Here&rsquo;s what that looks like, in numbers and in
            stories.
          </p>
        </div>
      </section>

      {/* Headline stats */}
      <section className="px-6 -mt-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {IMPACT_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl p-5 text-center"
                style={{
                  background: "white",
                  border: `1px solid ${C.gold}20`,
                  boxShadow: "0 8px 24px rgba(27,42,107,0.06)",
                }}
              >
                <div
                  className="text-3xl sm:text-4xl font-bold font-serif"
                  style={{ color: C.krishnaBlue }}
                >
                  {stat.number}
                </div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: C.saffron }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <div>
        {IMPACT_STORIES.map((story, i) => (
          <StorySection key={story.anchor} story={story} index={i} />
        ))}
      </div>

      {/* Timeline */}
      <section className="px-6 py-20" style={{ background: C.warmBg }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.gold }}
            >
              How we got here
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              Milestones, 2023 → today
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[11px] top-0 bottom-0 w-px"
              style={{ background: `linear-gradient(180deg, ${C.gold}, ${C.saffron}, ${C.peacock})` }}
            />

            <ol className="space-y-6">
              {IMPACT_TIMELINE.map((m, i) => (
                <motion.li
                  key={`${m.year}-${m.title}`}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="relative pl-10"
                >
                  <span
                    className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                    style={{
                      background: "white",
                      border: `2px solid ${C.gold}`,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: C.saffron }} />
                  </span>
                  <div
                    className="text-[11px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: C.saffron }}
                  >
                    {m.year}
                  </div>
                  <h3 className="mt-1 text-[16px] font-bold font-serif" style={{ color: C.krishnaBlue }}>
                    {m.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-[1.7] text-gray-600">
                    {m.description}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-16"
        style={{
          background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 100%)`,
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Want to help keep this going?
          </h2>
          <p className="mt-3 text-[14px]" style={{ color: "rgba(255,251,242,0.65)" }}>
            Every class, every book, every meal is the work of volunteers.
            There&rsquo;s a rung on the ladder for every level of time you have.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/volunteer"
              className="rounded-full px-6 py-3 text-[13px] font-semibold text-white transition-all hover:scale-[1.03]"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                boxShadow: `0 0 25px ${C.gold}30`,
              }}
            >
              Volunteer with us
            </Link>
            <Link
              href="/"
              className="rounded-full px-6 py-3 text-[13px] font-semibold transition-all"
              style={{
                border: `1px solid ${C.gold}30`,
                color: C.goldLight,
              }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StorySection({ story, index }: { story: ImpactStory; index: number }) {
  const reverse = index % 2 === 1;
  const color = colorFor(story.color);
  const bg = index % 2 === 0 ? C.cream : C.warmBg;

  return (
    <section
      id={story.anchor}
      className="px-6 py-20 scroll-mt-24"
      style={{ background: bg }}
    >
      <div className="max-w-5xl mx-auto">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
        >
          <motion.div
            initial={{ opacity: 0, x: reverse ? 12 : -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color }}
            >
              {story.eyebrow}
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold font-serif leading-tight"
              style={{ color: C.krishnaBlue }}
            >
              {story.heading}
            </h2>
            <div className="mt-5 space-y-4">
              {story.paragraphs.map((p, i) => (
                <p key={i} className="text-[14px] leading-[1.8] text-gray-700">
                  {p}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="aspect-[4/3] rounded-3xl overflow-hidden relative flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}CC)`,
            }}
          >
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 40%, white 0%, transparent 50%), radial-gradient(circle at 70% 70%, white 0%, transparent 50%)`,
              }}
            />
            {story.stat && (
              <div className="relative text-center text-white px-6">
                <div className="text-5xl sm:text-6xl font-bold font-serif">
                  {story.stat.number}
                </div>
                <div className="mt-2 text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {story.stat.label}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
