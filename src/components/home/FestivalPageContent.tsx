"use client";

/**
 * FestivalPageContent — Dedicated page for the monthly Youth Festival.
 *
 * Pattern: hero → one Luma embed per upcoming monthly festival → highlights → location → FAQ.
 * Add a new month: append an entry to MONTHLY_FESTIVALS in src/data/home.ts.
 * The first upcoming entry is automatically promoted to the hero (FEATURED_EVENT).
 * If a festival has no Luma URL yet, the embed renders a "registration opening soon" card.
 */

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FEATURED_EVENT, MONTHLY_FESTIVALS, YOUTUBE_URL } from "@/data/home";
import { C, Icon } from "./icons";
import LumaEmbed from "./LumaEmbed";

const FAQS = [
  {
    q: "Is it free?",
    a: "Yes — completely free. We serve a full prasadam dinner too.",
  },
  {
    q: "Do I need to know anything about the Gita?",
    a: "Not at all. Come as you are. Whether it's your first time or your fiftieth, you'll feel at home.",
  },
  {
    q: "What should I wear?",
    a: "Comfortable clothes you can sit on the floor in. Modest dress is appreciated out of respect for the temple.",
  },
  {
    q: "Can I bring a friend?",
    a: "Please do! Just RSVP for each person so we can plan prasadam. There's no limit.",
  },
];

export default function FestivalPageContent() {
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

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{
                background: "rgba(212,168,67,0.12)",
                border: `1px solid ${C.gold}30`,
                color: C.goldLight,
              }}
            >
              <Icon name="calendar" size={12} />
              Monthly Youth Festival
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-white leading-tight">
              {FEATURED_EVENT.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] text-white/75">
              <span className="flex items-center gap-2">
                <Icon name="calendar" size={14} style={{ color: C.goldLight }} />
                {FEATURED_EVENT.dateLabel}
              </span>
              <span className="hidden sm:inline text-white/30">·</span>
              <span>{FEATURED_EVENT.timeLabel}</span>
              <span className="hidden sm:inline text-white/30">·</span>
              <span className="flex items-center gap-2">
                <Icon name="mapPin" size={14} style={{ color: C.goldLight }} />
                {FEATURED_EVENT.location}
              </span>
            </div>

            <p
              className="mt-8 text-[16px] sm:text-[17px] leading-[1.75] max-w-2xl mx-auto"
              style={{ color: "rgba(255,251,242,0.75)" }}
            >
              {FEATURED_EVENT.description}
            </p>

            {FEATURED_EVENT.spotsLeft !== undefined && FEATURED_EVENT.totalSpots && (
              <div className="mt-8 max-w-xs mx-auto">
                <div className="flex items-center justify-between text-[12px] mb-2">
                  <span className="text-white/60">
                    {FEATURED_EVENT.spotsLeft} spots left
                  </span>
                  <span style={{ color: C.goldLight }}>
                    of {FEATURED_EVENT.totalSpots}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((FEATURED_EVENT.totalSpots - FEATURED_EVENT.spotsLeft) / FEATURED_EVENT.totalSpots) * 100}%`,
                      background: `linear-gradient(90deg, ${C.gold}, ${C.saffron})`,
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* RSVP — one Luma embed per upcoming monthly festival */}
      <section className="relative -mt-10 px-6 pb-16">
        <div className="max-w-3xl mx-auto space-y-8">
          {MONTHLY_FESTIVALS.filter((f) => f.status === "upcoming").map((festival, i) => (
            <motion.div
              key={festival.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <LumaEmbed
                lumaUrl={festival.lumaUrl}
                eventTitle={festival.title}
                rsvpUrl={festival.rsvpUrl}
              />
            </motion.div>
          ))}

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center text-[13px]"
            style={{ color: `${C.krishnaBlue}99` }}
          >
            More monthly festival dates will be added here once confirmed.
          </motion.p>
        </div>
      </section>

      {/* What to expect */}
      <section className="py-20 px-6" style={{ background: C.warmBg }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.gold }}
            >
              What to expect
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              A festival evening, start to finish
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURED_EVENT.highlights.map((h, i) => {
              const colors = [C.gold, C.saffron, C.peacock, C.lotusPink];
              const color = colors[i % colors.length];
              return (
                <motion.div
                  key={h}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-4 p-5 rounded-2xl"
                  style={{
                    background: "white",
                    border: `1px solid ${color}20`,
                  }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 text-[13px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-[14px] leading-[1.6] text-gray-700 pt-1">{h}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 px-6" style={{ background: C.cream }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: C.gold }}
              >
                Where
              </span>
              <h2
                className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
                style={{ color: C.krishnaBlue }}
              >
                {FEATURED_EVENT.location}
              </h2>
              <p className="mt-4 text-[14px] leading-[1.7] text-gray-600">
                The historic ISKCON Brooklyn temple has been a home for devotees
                of the Bhagavad Gita in NYC for over 50 years. Easy to reach by
                the 2, 3, 4, 5, B, and Q trains.
              </p>
              <a
                href="https://maps.google.com/?q=ISKCON+Brooklyn"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all hover:scale-[1.03]"
                style={{
                  background: C.krishnaBlue,
                  color: "white",
                }}
              >
                <Icon name="mapPin" size={13} />
                Open in Maps
              </a>
            </div>

            <div
              className="aspect-[4/3] rounded-2xl overflow-hidden relative flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${C.krishnaBlue}, ${C.krishnaDeep})`,
              }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(circle at 30% 40%, ${C.gold}40 0%, transparent 50%), radial-gradient(circle at 70% 70%, ${C.saffron}30 0%, transparent 50%)`,
                }}
              />
              <div className="relative text-center text-white/80 px-6">
                <Icon name="mapPin" size={32} style={{ color: C.goldLight }} />
                <p className="mt-3 text-[13px] italic font-serif">
                  &ldquo;305 Schermerhorn Street, Brooklyn&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="py-20 px-6"
        style={{
          background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 100%)`,
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.goldLight }}
            >
              Frequently asked
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold font-serif text-white">
              Coming for the first time?
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.details
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group rounded-xl p-5 cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${C.gold}18`,
                }}
              >
                <summary className="flex items-center justify-between gap-4 text-[15px] font-semibold text-white list-none">
                  {faq.q}
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[16px] shrink-0 transition-transform group-open:rotate-45"
                    style={{ color: C.goldLight, border: `1px solid ${C.gold}30` }}
                  >
                    +
                  </span>
                </summary>
                <p
                  className="mt-3 text-[14px] leading-[1.7]"
                  style={{ color: "rgba(255,251,242,0.65)" }}
                >
                  {faq.a}
                </p>
              </motion.details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-[13px]" style={{ color: `${C.goldLight}80` }}>
              Still have questions?
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all hover:scale-[1.03]"
                style={{
                  border: `1px solid ${C.gold}40`,
                  color: C.goldLight,
                }}
              >
                Watch recap on YouTube
              </a>
              <Link
                href="/"
                className="rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:scale-[1.03]"
                style={{
                  background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                }}
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
