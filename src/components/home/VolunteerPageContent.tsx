"use client";

/**
 * VolunteerPageContent — Engagement ladder for seva.
 *
 * Three tiers surfaced as rungs, each with time commitment and
 * examples. Life.Church "next step" model adapted for devotional
 * service. CTA at the bottom → Instagram DM for direct contact.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  VOLUNTEER_EVENTS,
  VOLUNTEER_LADDER,
  INSTAGRAM_URL,
  type VolunteerRung,
} from "@/data/home";
import { C, Icon, colorFor } from "./icons";
import LumaEmbed from "./LumaEmbed";

const WHY = [
  {
    title: "It's how you become the community, not just visit it",
    body: "The people you meet at the Sunday feast are the same ones who cooked, cleaned, or taught that day. Seva is the quickest way from guest to family.",
  },
  {
    title: "Scripture study without service stays abstract",
    body: "The Gita says karma-yoga — action offered to Krishna — is essential. A few hours of seva teaches what pages of theory can't.",
  },
  {
    title: "You don't need to know anything",
    body: "Show up with willingness. Every role has someone who'll teach you the first time. No experience, no devotional background, no problem.",
  },
];

export default function VolunteerPageContent() {
  const upcomingEvents = VOLUNTEER_EVENTS.filter((e) => e.status === "upcoming");

  return (
    <div className="surface-paper min-h-screen">
      <Navbar />

      {/* Upcoming volunteer events — list from VOLUNTEER_EVENTS in src/data/home.ts */}
      <section className="relative pt-28 px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          {upcomingEvents.length === 0 ? (
            <div
              className="rounded-2xl px-8 py-10 text-center"
              style={{ background: "white", border: `1px solid ${C.gold}25` }}
            >
              <p className="text-[14px] text-gray-600 max-w-md mx-auto">
                No volunteer events posted right now. New ones are added every
                few weeks — check back soon, or DM us on Instagram to be
                notified.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {upcomingEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                >
                  <LumaEmbed lumaUrl={event.lumaUrl} eventTitle={event.title} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* The ladder */}
      <section className="px-6 py-16" style={{ background: C.cream }}>
        <div className="max-w-5xl mx-auto space-y-5">
          {VOLUNTEER_LADDER.map((rung, i) => (
            <RungCard key={rung.tier} rung={rung} index={i} />
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="px-6 py-20" style={{ background: C.warmBg }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.gold }}
            >
              Why seva
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              Why we keep asking
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WHY.map((w, i) => (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl p-6"
                style={{
                  background: "white",
                  border: `1px solid ${C.gold}18`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                  }}
                >
                  <Icon name="lotus" size={18} />
                </div>
                <h3 className="text-[15px] font-bold font-serif" style={{ color: C.krishnaBlue }}>
                  {w.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.7] text-gray-600">
                  {w.body}
                </p>
              </motion.div>
            ))}
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
            Ready to start? Just message us.
          </h2>
          <p className="mt-3 text-[14px]" style={{ color: "rgba(255,251,242,0.65)" }}>
            DM @gitalifenyc on Instagram with which rung interests you and
            we&rsquo;ll connect you with someone on that team.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-6 py-3 text-[13px] font-semibold text-white transition-all hover:scale-[1.03]"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                boxShadow: `0 0 25px ${C.gold}30`,
              }}
            >
              DM us on Instagram
            </a>
            <Link
              href="/programs"
              className="rounded-full px-6 py-3 text-[13px] font-semibold transition-all"
              style={{
                border: `1px solid ${C.gold}30`,
                color: C.goldLight,
              }}
            >
              Or drop by a program
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RungCard({ rung, index }: { rung: VolunteerRung; index: number }) {
  const color = colorFor(rung.color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-3xl relative overflow-hidden"
      style={{
        background: "white",
        border: `1px solid ${color}25`,
        boxShadow: "0 8px 24px rgba(27,42,107,0.05)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}CC)` }}
      />

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 p-7 items-start">
        {/* Tier badge */}
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold font-serif shrink-0"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}CC)`,
            }}
          >
            {rung.tier}
          </div>
          <div className="md:hidden">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color }}>
              Tier {rung.tier}
            </div>
            <div className="text-[12px] text-gray-500">{rung.commitment}</div>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="hidden md:block">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.15em]"
              style={{ color }}
            >
              Tier {rung.tier} · {rung.commitment}
            </span>
          </div>
          <h3 className="mt-1 text-xl sm:text-2xl font-bold font-serif" style={{ color: C.krishnaBlue }}>
            {rung.title}
          </h3>
          <p className="mt-2 text-[14px] leading-[1.7] text-gray-600">
            {rung.description}
          </p>
          <ul className="mt-4 space-y-2">
            {rung.examples.map((ex) => (
              <li key={ex} className="flex items-start gap-2 text-[13px] text-gray-700">
                <span
                  className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                {ex}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="md:self-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all hover:scale-[1.03] whitespace-nowrap"
            style={{
              background: color,
              color: "white",
            }}
          >
            {rung.cta}
            <Icon name="arrowRight" size={12} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
