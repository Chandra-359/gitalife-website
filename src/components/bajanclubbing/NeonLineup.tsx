"use client";

/**
 * NeonLineup — six interactive frosted-glass artist cards.
 *
 * Hover (or tap, on touch) reveals the artist's instrument and bhajan
 * style in a panel that slides over the card's lower half. Keyboard
 * users get the same reveal via focus-within.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { LINEUP, type AccentToken, type ClubArtist } from "@/data/bajanClubbing";

const ACCENT: Record<AccentToken, { main: string; soft: string }> = {
  gold: { main: "#FFB25C", soft: "#FFD9B0" },
  saffron: { main: "#FF7A1A", soft: "#FFBE8F" },
  peacock: { main: "#4D9FFF", soft: "#9DC8FF" },
  lotus: { main: "#E86BB7", soft: "#F5AED8" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w[0] && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function ArtistCard({ artist, index }: { artist: ClubArtist; index: number }) {
  const a = ACCENT[artist.accent];
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.09 }}
      className={`bc2-glass bc2-glass-hover bc2-edge-top group relative overflow-hidden p-6 text-left ${
        artist.headliner ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
      style={{ "--bc2-edge": a.main, "--bc2-hover-glow": `${a.main}59` } as React.CSSProperties}
      onClick={() => setRevealed((v) => !v)}
      tabIndex={0}
      aria-label={`${artist.name} — tap to see instrument and style`}
    >
      <div className={`flex items-start gap-5 ${artist.headliner ? "sm:items-center" : ""}`}>
        {/* avatar disc */}
        <div className="relative shrink-0">
          {artist.headliner && (
            <span
              className="bc-glow-pulse absolute -inset-2 rounded-full"
              style={{ background: `radial-gradient(circle, ${a.main}4d, transparent 70%)` }}
              aria-hidden
            />
          )}
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: artist.headliner ? 96 : 68,
              height: artist.headliner ? 96 : 68,
              background: `radial-gradient(circle at 32% 28%, ${a.soft}66, ${a.main}26 45%, rgba(11,6,32,0.9))`,
              border: `1px solid ${a.main}73`,
              boxShadow: `0 10px 30px -12px ${a.main}66`,
            }}
          >
            <span
              className="bc2-display select-none"
              style={{ fontSize: artist.headliner ? 30 : 21, color: a.soft }}
            >
              {initials(artist.name)}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {artist.headliner && (
              <span
                className="rounded-full px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.2em]"
                style={{ background: `${a.main}24`, border: `1px solid ${a.main}66`, color: a.soft }}
              >
                ★ Headliner
              </span>
            )}
            <span className="text-[10.5px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--bc2-ink-faint)" }}>
              {artist.setTime} set
            </span>
          </div>
          <h3 className={`bc2-display mt-2 text-white ${artist.headliner ? "text-[24px] sm:text-[30px]" : "text-[18px]"}`} style={{ fontWeight: 700 }}>
            {artist.name}
          </h3>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: a.main }}>
            {artist.role}
          </p>
          <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
            {artist.bio}
          </p>
        </div>
      </div>

      {/* hover / tap / focus reveal — instrument & style */}
      <div
        className={`absolute inset-x-0 bottom-0 translate-y-full p-5 pt-8 transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0 ${
          revealed ? "!translate-y-0" : ""
        }`}
        style={{
          background: `linear-gradient(180deg, transparent, rgba(7,3,19,0.88) 30%, rgba(7,3,19,0.96))`,
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.24em]" style={{ color: a.main }}>
              Plays
            </p>
            <p className="mt-1 text-[13px] font-semibold text-white">{artist.instrument}</p>
          </div>
          <div className="text-right">
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.24em]" style={{ color: a.main }}>
              Style
            </p>
            <p className="mt-1 max-w-[240px] text-[12px] leading-snug" style={{ color: "var(--bc2-ink-dim)" }}>
              {artist.style}
            </p>
          </div>
        </div>
      </div>

      {/* reveal hint */}
      <span
        className="absolute right-4 top-4 text-[9px] font-bold uppercase tracking-[0.18em] opacity-60 transition-opacity group-hover:opacity-0"
        style={{ color: "var(--bc2-ink-faint)" }}
        aria-hidden
      >
        + info
      </span>
    </motion.article>
  );
}

export default function NeonLineup() {
  return (
    <section id="lineup" className="relative mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
          The Lineup
        </p>
        <h2 className="bc2-display mt-4 text-[30px] text-white sm:text-[40px]">
          Six acts. <span className="bc2-headline-grad">Zero proof.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[14px]" style={{ color: "var(--bc2-ink-dim)" }}>
          Hover a card — or tap on mobile — to see what each act plays and how they take the room up.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LINEUP.map((artist, i) => (
          <ArtistCard key={artist.id} artist={artist} index={i} />
        ))}
      </div>
    </section>
  );
}
