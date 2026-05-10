"use client";

/**
 * DailyPageContent — Hallow-inspired daily practice page.
 *
 * Three tabs: Verse (memorization), Japa (round counter), Reading
 * (short guided passage). All state is client-side / localStorage —
 * no server roundtrip required for the daily rhythm.
 */

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { VERSES, getVerseOfTheDay, type Verse } from "@/data/verses";
import { C, Icon } from "./icons";

type Tab = "verse" | "japa" | "reading";

const TABS: { id: Tab; label: string; icon: "book" | "lotus" | "flame" }[] = [
  { id: "verse", label: "Verse", icon: "book" },
  { id: "japa", label: "Japa", icon: "lotus" },
  { id: "reading", label: "Reading", icon: "flame" },
];

const LS_STREAK = "gitalife.streak";
const LS_LAST_VISIT = "gitalife.lastVisit";
const LS_JAPA = "gitalife.japaRounds";
const LS_JAPA_DATE = "gitalife.japaDate";
const LS_CHANGE_EVENT = "gitalife:ls";

/** "2026-04-18" format — used to detect day changes and reset japa counter. */
function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Compute new streak given last-visit date in "YYYY-MM-DD" form. */
function bumpStreak(lastVisit: string | null, prev: number): number {
  const today = todayKey();
  if (lastVisit === today) return prev;
  if (!lastVisit) return 1;
  const yesterday = todayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  return lastVisit === yesterday ? prev + 1 : 1;
}

/** Write to localStorage and notify same-tab subscribers. */
function writeLocal(key: string, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new Event(LS_CHANGE_EVENT));
}

function subscribeLocal(cb: () => void): () => void {
  window.addEventListener("storage", cb);
  window.addEventListener(LS_CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(LS_CHANGE_EVENT, cb);
  };
}

/** React 19 idiom for reading localStorage without setState-in-effect. */
function useLocalNumber(key: string, fallback = 0): number {
  return useSyncExternalStore(
    subscribeLocal,
    () => Number(localStorage.getItem(key)) || fallback,
    () => fallback
  );
}

export default function DailyPageContent() {
  const [tab, setTab] = useState<Tab>("verse");
  const streak = useLocalNumber(LS_STREAK, 0);
  const verse = useMemo(() => getVerseOfTheDay(), []);

  // Bump streak once per day — write-only, no setState.
  useEffect(() => {
    const last = localStorage.getItem(LS_LAST_VISIT);
    const today = todayKey();
    if (last === today) return;
    const prev = Number(localStorage.getItem(LS_STREAK)) || 0;
    const next = bumpStreak(last, prev);
    writeLocal(LS_STREAK, String(next));
    writeLocal(LS_LAST_VISIT, today);
  }, []);

  return (
    <div className="surface-paper min-h-screen">
      <Navbar />

      {/* Hero / streak header */}
      <section
        className="relative pt-28 pb-10 px-6 overflow-hidden"
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
            <Icon name="lotus" size={12} />
            Daily Practice
          </span>

          <h1 className="mt-5 text-3xl sm:text-4xl font-bold font-serif text-white leading-tight">
            A steady rhythm of scripture, japa, and study
          </h1>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-[13px]"
            style={{
              background: "rgba(232,117,26,0.12)",
              border: `1px solid ${C.saffron}30`,
            }}
          >
            <Icon name="flame" size={16} style={{ color: C.saffron }} />
            <span className="text-white/85">
              <span className="font-bold" style={{ color: C.goldLight }}>
                {streak} day{streak === 1 ? "" : "s"}
              </span>{" "}
              visiting in a row
            </span>
          </div>
        </div>
      </section>

      {/* Tab switcher */}
      <section className="px-6 py-8" style={{ background: C.cream }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="flex rounded-full p-1 gap-1"
            style={{
              background: "white",
              border: `1px solid ${C.gold}25`,
              boxShadow: "0 4px 16px rgba(27,42,107,0.05)",
            }}
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-[13px] font-semibold transition-all"
                  style={{
                    background: active
                      ? `linear-gradient(135deg, ${C.gold}, ${C.saffron})`
                      : "transparent",
                    color: active ? "white" : C.krishnaBlue,
                  }}
                >
                  <Icon name={t.icon} size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tab content */}
      <section className="px-6 pb-24" style={{ background: C.cream }}>
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {tab === "verse" && <VerseTab key="verse" verse={verse} />}
            {tab === "japa" && <JapaTab key="japa" />}
            {tab === "reading" && <ReadingTab key="reading" verse={verse} />}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VERSE TAB — memorization tool                                      */
/* ------------------------------------------------------------------ */

function VerseTab({ verse }: { verse: Verse }) {
  const [hideTranslation, setHideTranslation] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="rounded-3xl p-8 sm:p-10"
        style={{
          background: `linear-gradient(145deg, ${C.krishnaBlue} 0%, ${C.krishnaDeep} 100%)`,
          boxShadow: "0 20px 60px rgba(27,42,107,0.12)",
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.goldLight }}
          >
            Verse of the day
          </span>
          <span
            className="text-[11px] px-2.5 py-1 rounded-full font-mono"
            style={{
              background: "rgba(212,168,67,0.15)",
              color: C.goldLight,
            }}
          >
            BG {verse.chapter}.{verse.verse}
          </span>
        </div>

        {hideTranslation ? (
          <button
            onClick={() => setHideTranslation(false)}
            className="mt-6 w-full py-10 rounded-xl text-[13px] font-semibold transition-all hover:bg-white/5"
            style={{
              border: `1px dashed ${C.gold}40`,
              color: `${C.goldLight}80`,
            }}
          >
            Tap to reveal the verse
          </button>
        ) : (
          <p
            className="mt-6 text-xl sm:text-2xl font-serif leading-[1.75] text-white"
          >
            &ldquo;{verse.translation}&rdquo;
          </p>
        )}

        {verse.purport && !hideTranslation && (
          <p
            className="mt-6 pt-5 text-[14px] sm:text-[15px] italic font-serif leading-[1.8]"
            style={{
              borderTop: `1px solid ${C.gold}18`,
              color: "rgba(240,214,138,0.75)",
            }}
          >
            {verse.purport}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setHideTranslation((v) => !v)}
          className="rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all"
          style={{
            background: "white",
            border: `1px solid ${C.gold}40`,
            color: C.krishnaBlue,
          }}
        >
          {hideTranslation ? "Show verse" : "Hide verse"}
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: `Bhagavad Gita ${verse.chapter}.${verse.verse}`,
                  text: `"${verse.translation}" — BG ${verse.chapter}.${verse.verse}`,
                })
                .catch(() => {});
            } else {
              navigator.clipboard
                .writeText(
                  `"${verse.translation}" — BG ${verse.chapter}.${verse.verse}`
                )
                .catch(() => {});
            }
          }}
          className="rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all flex items-center gap-2"
          style={{
            background: "transparent",
            border: `1px solid ${C.gold}30`,
            color: C.krishnaBlue,
          }}
        >
          <Icon name="share" size={12} />
          Share
        </button>
      </div>

      <p className="mt-8 text-center text-[12px] text-gray-400">
        A new verse rotates each day from a library of {VERSES.length} seed verses.
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  JAPA TAB — 16-round counter                                        */
/* ------------------------------------------------------------------ */

const JAPA_TARGET = 16;

function JapaTab() {
  const rounds = useLocalNumber(LS_JAPA, 0);
  const [pressing, setPressing] = useState(false);

  // Reset counter when the day rolls over — write-only, no setState.
  useEffect(() => {
    const savedDate = localStorage.getItem(LS_JAPA_DATE);
    const today = todayKey();
    if (savedDate !== today) {
      writeLocal(LS_JAPA_DATE, today);
      writeLocal(LS_JAPA, "0");
    }
  }, []);

  const increment = useCallback(() => {
    const cur = Number(localStorage.getItem(LS_JAPA)) || 0;
    writeLocal(LS_JAPA, String(Math.min(cur + 1, 108)));
    setPressing(true);
    setTimeout(() => setPressing(false), 180);
  }, []);

  const reset = useCallback(() => {
    writeLocal(LS_JAPA, "0");
  }, []);

  const pct = Math.min((rounds / JAPA_TARGET) * 100, 100);
  const complete = rounds >= JAPA_TARGET;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <div
        className="rounded-3xl p-8 sm:p-12"
        style={{
          background: "white",
          border: `1px solid ${C.gold}20`,
          boxShadow: "0 20px 60px rgba(27,42,107,0.08)",
        }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: C.gold }}
        >
          Japa Meditation
        </span>
        <h2
          className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
          style={{ color: C.krishnaBlue }}
        >
          Hare Krishna Mahamantra
        </h2>
        <p
          className="mt-3 font-serif text-[14px] italic leading-[1.8]"
          style={{ color: C.saffron }}
        >
          Hare Krishna Hare Krishna Krishna Krishna Hare Hare
          <br />
          Hare Rama Hare Rama Rama Rama Hare Hare
        </p>

        {/* Big counter button */}
        <div className="mt-10 relative mx-auto" style={{ width: 240, height: 240 }}>
          {/* Progress ring */}
          <svg width="240" height="240" viewBox="0 0 240 240" className="absolute inset-0 -rotate-90">
            <circle
              cx="120"
              cy="120"
              r="110"
              fill="none"
              stroke={`${C.gold}15`}
              strokeWidth="8"
            />
            <motion.circle
              cx="120"
              cy="120"
              r="110"
              fill="none"
              stroke={`url(#japa-grad)`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={691.15}
              animate={{ strokeDashoffset: 691.15 - (pct / 100) * 691.15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="japa-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={C.gold} />
                <stop offset="100%" stopColor={C.saffron} />
              </linearGradient>
            </defs>
          </svg>

          <motion.button
            onClick={increment}
            animate={{ scale: pressing ? 0.95 : 1 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-4 rounded-full flex flex-col items-center justify-center cursor-pointer"
            style={{
              background: complete
                ? `linear-gradient(135deg, ${C.peacock}, ${C.peacockLight})`
                : `linear-gradient(135deg, ${C.krishnaBlue}, ${C.krishnaDeep})`,
              color: "white",
              boxShadow: `0 15px 40px ${C.krishnaBlue}40`,
            }}
            aria-label="Tap to count one round"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] opacity-70">
              Rounds
            </span>
            <span className="text-6xl font-bold font-serif mt-1">{rounds}</span>
            <span
              className="text-[12px] mt-1"
              style={{ color: complete ? "white" : C.goldLight }}
            >
              of {JAPA_TARGET}
            </span>
          </motion.button>
        </div>

        {complete && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-[14px] italic font-serif"
            style={{ color: C.peacock }}
          >
            All sixteen rounds complete. Well done.
          </motion.p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={increment}
            className="rounded-full px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:scale-[1.03]"
            style={{
              background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
            }}
          >
            + Round
          </button>
          <button
            onClick={reset}
            className="rounded-full px-5 py-2.5 text-[13px] font-semibold transition-colors hover:bg-gray-100"
            style={{
              color: "rgba(27,42,107,0.55)",
              border: `1px solid rgba(27,42,107,0.15)`,
            }}
          >
            Reset
          </button>
        </div>

        <p className="mt-8 text-[12px] text-gray-400 max-w-xs mx-auto">
          Counter resets each day. Tap the circle after completing one round
          of 108 chants on your beads.
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  READING TAB — guided scripture passage                             */
/* ------------------------------------------------------------------ */

function ReadingTab({ verse }: { verse: Verse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="rounded-3xl p-8 sm:p-12"
        style={{
          background: "white",
          border: `1px solid ${C.gold}20`,
          boxShadow: "0 20px 60px rgba(27,42,107,0.08)",
        }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: C.gold }}
        >
          Today&rsquo;s Reading
        </span>
        <h2
          className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
          style={{ color: C.krishnaBlue }}
        >
          Bhagavad Gita {verse.chapter}.{verse.verse}
        </h2>

        <p
          className="mt-6 text-[15px] leading-[1.9] font-serif"
          style={{ color: "#3B3B3B" }}
        >
          {verse.translation}
        </p>

        {verse.purport && (
          <div
            className="mt-8 p-6 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${C.warmBg}, ${C.cream})`,
              border: `1px solid ${C.gold}15`,
            }}
          >
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.saffron }}
            >
              Reflection
            </span>
            <p className="mt-2 text-[14px] italic leading-[1.8] text-gray-700">
              {verse.purport}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/programs"
            className="rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:scale-[1.03]"
            style={{
              background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
            }}
          >
            Study live with us
          </Link>
          <a
            href="https://vedabase.io/en/library/bg/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-5 py-2.5 text-[13px] font-semibold transition-colors"
            style={{
              color: C.krishnaBlue,
              border: `1px solid ${C.gold}30`,
            }}
          >
            Read the full Gita →
          </a>
        </div>
      </div>

      <p className="mt-6 text-center text-[12px] text-gray-400">
        Guided audio readings are coming soon.
      </p>
    </motion.div>
  );
}
