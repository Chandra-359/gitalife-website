"use client";

/**
 * TodayStrip — Hallow-inspired "Today at Gita Life" section.
 * Shows: verse of the day, japa tracker, today's reading.
 */

import Link from "next/link";
import { getVerseOfTheDay } from "@/data/verses";
import { C, Icon } from "./icons";

function formatToday(date: Date = new Date()) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function TodayStrip() {
  const verse = getVerseOfTheDay();
  const today = formatToday();

  return (
    <section className="surface-paper relative py-14 px-5 sm:py-20 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.gold }}
            >
              <Icon name="sparkle" size={14} />
              Today at Gita Life
            </span>
            <h2
              className="section-heading mt-2 text-3xl sm:text-4xl"
              style={{ color: C.krishnaBlue }}
            >
              Your daily practice
            </h2>
          </div>
          <p className="text-[13px] text-gray-500">{today}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* VERSE OF THE DAY */}
          <div
            className="surface-sacred md:col-span-2 group relative rounded-2xl p-5 sm:p-8 overflow-hidden"
            style={{
              border: `1px solid ${C.gold}30`,
            }}
          >
            {/* Corner gold accent */}
            <div
              className="absolute top-0 left-0 w-16 h-16"
              style={{
                borderTop: `2px solid ${C.gold}50`,
                borderLeft: `2px solid ${C.gold}50`,
                borderRadius: "24px 0 0 0",
              }}
            />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="book" size={14} style={{ color: C.goldLight }} />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: C.goldLight }}
                >
                  Verse of the Day
                </span>
              </div>

              <p className="text-[17px] sm:text-[20px] leading-[1.75] font-serif text-white/95">
                &ldquo;{verse.translation}&rdquo;
              </p>

              {verse.purport && (
                <p
                  className="mt-4 text-[13px] sm:text-[14px] leading-[1.7] italic"
                  style={{ color: `${C.goldLight}CC` }}
                >
                  {verse.purport}
                </p>
              )}

              <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ background: `${C.gold}20`, color: C.goldLight }}
                >
                  Bhagavad Gita {verse.chapter}.{verse.verse}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href="/daily"
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all hover:bg-white/10"
                    style={{ border: `1px solid ${C.gold}35`, color: C.goldLight }}
                  >
                    Memorize
                    <Icon name="arrowRight" size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* JAPA & READING — stacked right column */}
          <div className="flex flex-col gap-4">
            {/* Japa */}
            <div
              className="glass-card hover-lift group relative rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${C.saffron}, ${C.saffron}CC)`,
                    boxShadow: `0 4px 12px -4px ${C.saffron}80`,
                  }}
                >
                  <Icon name="flame" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.18em] mb-0.5"
                    style={{ color: C.saffron }}
                  >
                    Japa
                  </p>
                  <h3 className="text-[15px] font-semibold" style={{ color: C.krishnaBlue }}>
                    16 rounds
                  </h3>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    The daily chanting meditation
                  </p>
                </div>
              </div>
              <Link
                href="/daily#japa"
                className="btn-soft btn-soft-saffron mt-4"
              >
                Start today&rsquo;s round
                <Icon name="arrowRight" size={12} />
              </Link>
            </div>

            {/* Today's reading */}
            <div
              className="glass-card hover-lift group relative rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${C.peacock}, ${C.peacock}CC)`,
                    boxShadow: `0 4px 12px -4px ${C.peacock}80`,
                  }}
                >
                  <Icon name="book" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.18em] mb-0.5"
                    style={{ color: C.peacock }}
                  >
                    Today&rsquo;s Reading
                  </p>
                  <h3 className="text-[15px] font-semibold" style={{ color: C.krishnaBlue }}>
                    Chapter {verse.chapter}, verses {verse.verse}–{verse.verse + 3}
                  </h3>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    ~8 minutes · guided passage
                  </p>
                </div>
              </div>
              <Link
                href="/daily#reading"
                className="btn-soft btn-soft-peacock mt-4"
              >
                Read passage
                <Icon name="arrowRight" size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
