"use client";

/**
 * RetreatsPageContent — Quarterly upstate retreats.
 *
 * Pattern: hero → upcoming retreat with Luma embed → "what happens on
 * a retreat" program → past retreats gallery with quotes → CTA.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { RETREATS, INSTAGRAM_URL, type Retreat } from "@/data/home";
import { C, Icon } from "./icons";
import LumaEmbed from "./LumaEmbed";

const RETREAT_PROGRAM = [
  {
    time: "6:00 AM",
    title: "Mangala aarti",
    desc: "Morning temple ceremony with kirtan by candlelight.",
  },
  {
    time: "7:30 AM",
    title: "Japa walk",
    desc: "Quiet chanting on beads, outdoors, while the sun comes up.",
  },
  {
    time: "9:00 AM",
    title: "Breakfast + morning class",
    desc: "Full prasadam breakfast, then an hour of Bhagavad Gita study.",
  },
  {
    time: "12:00 PM",
    title: "Hike or kirtan session",
    desc: "A long hike through the local hills, or a guided kirtan jam.",
  },
  {
    time: "6:00 PM",
    title: "Evening prasadam + fire yajña",
    desc: "Vegetarian feast, then a fire ceremony under the stars.",
  },
  {
    time: "9:00 PM",
    title: "Night kirtan",
    desc: "Everyone gathers — the best kirtans of the weekend always happen here.",
  },
];

export default function RetreatsPageContent() {
  const upcoming = RETREATS.filter((r) => r.status === "upcoming");
  const past = RETREATS.filter((r) => r.status === "past");

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
            <Icon name="mountain" size={12} />
            Quarterly Retreats
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl font-bold font-serif text-white leading-tight">
            Four weekends a year, off the grid
          </h1>

          <p
            className="mt-5 text-[15px] sm:text-[16px] leading-[1.75] max-w-xl mx-auto"
            style={{ color: "rgba(255,251,242,0.72)" }}
          >
            Deep sadhana, kirtan, and community — upstate New York,
            surrounded by trees, no phones on the main kirtan mat.
          </p>
        </div>
      </section>

      {/* Upcoming retreats */}
      <section className="px-6 py-16" style={{ background: C.cream }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.gold }}
            >
              Coming up next
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              {upcoming.length > 0 ? "Reserve your spot" : "New dates coming soon"}
            </h2>
          </div>

          {upcoming.length > 0 ? (
            upcoming.map((r) => <UpcomingRetreatCard key={r.id} retreat={r} />)
          ) : (
            <p className="text-[14px] text-gray-600">
              We&rsquo;re planning the next retreat — follow us on Instagram for
              the announcement.
            </p>
          )}
        </div>
      </section>

      {/* What happens */}
      <section className="px-6 py-20" style={{ background: C.warmBg }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.gold }}
            >
              A typical day
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              What happens on a retreat
            </h2>
          </div>

          <div className="space-y-3">
            {RETREAT_PROGRAM.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-start gap-4 p-5 rounded-2xl"
                style={{
                  background: "white",
                  border: `1px solid ${C.gold}18`,
                }}
              >
                <div
                  className="shrink-0 text-[11px] font-bold font-mono w-16 pt-1"
                  style={{ color: C.saffron }}
                >
                  {step.time}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold font-serif" style={{ color: C.krishnaBlue }}>
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-[1.6] text-gray-600">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Past retreats */}
      {past.length > 0 && (
        <section className="px-6 py-20" style={{ background: C.cream }}>
          <div className="max-w-5xl mx-auto">
            <div className="mb-10">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: C.gold }}
              >
                Past retreats
              </span>
              <h2
                className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
                style={{ color: C.krishnaBlue }}
              >
                What alumni are saying
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {past.map((r, i) => (
                <PastRetreatCard key={r.id} retreat={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section
        className="px-6 py-16"
        style={{
          background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 100%)`,
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Never been on a retreat?
          </h2>
          <p className="mt-3 text-[14px]" style={{ color: "rgba(255,251,242,0.65)" }}>
            Start with a weekly class. Most retreat attendees came to a class first.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/programs"
              className="rounded-full px-6 py-3 text-[13px] font-semibold text-white transition-all hover:scale-[1.03]"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                boxShadow: `0 0 25px ${C.gold}30`,
              }}
            >
              See upcoming programs
            </Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-6 py-3 text-[13px] font-semibold transition-all"
              style={{
                border: `1px solid ${C.gold}30`,
                color: C.goldLight,
              }}
            >
              Follow for retreat announcements
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function UpcomingRetreatCard({ retreat }: { retreat: Retreat }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: "white",
        border: `1px solid ${C.gold}25`,
      }}
    >
      <div
        className="p-7"
        style={{
          background: `linear-gradient(135deg, ${C.peacock}08, ${C.krishnaBlue}05)`,
        }}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] mb-3">
          <span className="flex items-center gap-2" style={{ color: C.saffron }}>
            <Icon name="calendar" size={13} />
            <span className="font-semibold">{retreat.dateLabel}</span>
          </span>
          <span className="flex items-center gap-2 text-gray-600">
            <Icon name="mapPin" size={13} />
            {retreat.location}
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold font-serif" style={{ color: C.krishnaBlue }}>
          {retreat.title}
        </h3>
        <p className="mt-3 text-[14px] leading-[1.7] text-gray-700">
          {retreat.description}
        </p>
      </div>

      <div className="border-t" style={{ borderColor: `${C.gold}15` }}>
        <LumaEmbed
          lumaUrl={retreat.lumaUrl ?? ""}
          eventTitle={retreat.title}
          height={520}
        />
      </div>
    </motion.div>
  );
}

function PastRetreatCard({ retreat, index }: { retreat: Retreat; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "white",
        border: `1px solid ${C.gold}18`,
      }}
    >
      <div
        className="aspect-[16/9] flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${C.peacock}, ${C.krishnaBlue})`,
        }}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, ${C.gold} 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${C.saffron} 0%, transparent 50%)`,
          }}
        />
        <div className="relative text-center text-white px-6">
          <Icon name="mountain" size={28} style={{ color: C.goldLight }} />
          <div className="mt-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: C.goldLight }}>
            {retreat.dateLabel}
          </div>
          <div className="mt-1 text-[14px] font-bold font-serif">
            {retreat.location}
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-[17px] font-bold font-serif" style={{ color: C.krishnaBlue }}>
          {retreat.title}
        </h3>
        <p className="mt-2 text-[13px] leading-[1.6] text-gray-600">
          {retreat.description}
        </p>

        {retreat.pastHighlights && retreat.pastHighlights.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {retreat.pastHighlights.map((h) => (
              <li
                key={h}
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{
                  background: `${C.gold}15`,
                  color: C.saffron,
                }}
              >
                {h}
              </li>
            ))}
          </ul>
        )}

        {retreat.quote && (
          <blockquote
            className="mt-4 pt-4 text-[13px] italic leading-[1.7] font-serif"
            style={{
              borderTop: `1px solid ${C.gold}15`,
              color: "#4A4A4A",
            }}
          >
            &ldquo;{retreat.quote}&rdquo;
            {retreat.quoteAuthor && (
              <footer className="mt-2 not-italic text-[11px] uppercase tracking-wider" style={{ color: C.saffron }}>
                — {retreat.quoteAuthor}
              </footer>
            )}
          </blockquote>
        )}
      </div>
    </motion.div>
  );
}
