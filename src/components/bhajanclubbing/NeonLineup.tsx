"use client";

/**
 * NeonLineup — conference-style speaker grid.
 *
 * Uniform portrait tiles, the way tech events showcase speakers:
 * at rest each tile is just the artist's portrait with their name over
 * a bottom scrim — no set times, no headliner/opener labels, every
 * artist presented equally. Hover (tap on touch, focus on keyboard)
 * zooms the portrait and slides up a panel with the bio, instrument
 * and style. Artists without a photo yet get a neon monogram poster
 * in their accent colour — set `photo` in src/data/bhajanClubbing.ts
 * (files in public/lineup/) and the real portrait drops in.
 */

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { LINEUP, type AccentToken, type ClubArtist } from "@/data/bhajanClubbing";

/** Heading stays literate as the lineup grows — "Two acts", "Three acts", … */
const COUNT_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

const ACCENT: Record<AccentToken, { main: string; soft: string }> = {
  gold: { main: "#E5C08D", soft: "#F0DEC0" },
  saffron: { main: "#D98A4A", soft: "#E8B98C" },
  peacock: { main: "#A9B8D6", soft: "#C9D4E6" },
  lotus: { main: "#C08CA6", soft: "#DBB8C8" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w[0] && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

/** Placeholder portrait — accent aura, orbit rings, giant monogram. */
function MonogramPoster({ artist }: { artist: ClubArtist }) {
  const a = ACCENT[artist.accent];
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--bc2-bg-2) 0%, var(--bc2-bg) 78%)" }}>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 34%, ${a.main}38, transparent 62%)` }}
        aria-hidden
      />
      <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
        {[120, 184, 248].map((d) => (
          <span
            key={d}
            className="absolute rounded-full"
            style={{ width: d, height: d, left: -d / 2, top: -d / 2, border: `1px solid ${a.main}24` }}
          />
        ))}
      </div>
      <span
        className="bc2-display absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 select-none text-[56px] sm:text-[64px]"
        style={{ color: a.soft, textShadow: `0 0 34px ${a.main}99, 0 0 80px ${a.main}4d` }}
      >
        {initials(artist.name)}
      </span>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--tex-grain-dark)", backgroundSize: "240px 240px", opacity: 0.35, mixBlendMode: "screen" }}
        aria-hidden
      />
    </div>
  );
}

function ArtistTile({ artist, index }: { artist: ClubArtist; index: number }) {
  const a = ACCENT[artist.accent];
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.09 }}
      className="group relative aspect-[3/4] w-[calc(50%-0.5rem)] max-w-[300px] cursor-pointer overflow-hidden rounded-3xl outline-none focus-visible:ring-2 sm:w-[280px]"
      style={
        {
          border: "1px solid rgba(244,240,235,0.13)",
          boxShadow: "0 18px 48px -22px rgba(16,12,20,0.7)",
          "--tw-ring-color": a.main,
        } as React.CSSProperties
      }
      onClick={() => setRevealed((v) => !v)}
      tabIndex={0}
      aria-label={`${artist.name}. Tap for artist details.`}
    >
      {/* portrait */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.05] group-focus-visible:scale-[1.05] ${
          revealed ? "scale-[1.05]" : ""
        }`}
      >
        {artist.photo ? (
          <Image
            src={artist.photo}
            alt={artist.name}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover"
            style={artist.photoPosition ? { objectPosition: artist.photoPosition } : undefined}
          />
        ) : (
          <MonogramPoster artist={artist} />
        )}
        {/* accent wash pulls any portrait into the neon palette */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${a.main}1f, transparent 45%)`, mixBlendMode: "screen" }}
          aria-hidden
        />
      </div>

      {/* bottom scrim under the labels */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{ background: "linear-gradient(180deg, transparent, rgba(26,22,35,0.5) 48%, rgba(26,22,35,0.92))" }}
        aria-hidden
      />

      {/* resting label — name only */}
      <div
        className={`absolute inset-x-0 bottom-0 p-4 transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0 sm:p-5 ${
          revealed ? "opacity-0" : ""
        }`}
      >
        <h3 className="bc2-display text-[16px] leading-tight text-club-ink sm:text-[20px]">{artist.name}</h3>
      </div>

      {/* hover / tap / focus panel — the full story */}
      <div
        className={`absolute inset-0 flex translate-y-full flex-col justify-end p-4 transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 sm:p-5 ${
          revealed ? "!translate-y-0" : ""
        }`}
        style={{
          background: "linear-gradient(180deg, rgba(26,22,35,0) 10%, rgba(26,22,35,0.6) 38%, rgba(26,22,35,0.95) 62%, rgba(26,22,35,0.97) 100%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <h3 className="bc2-display text-[16px] leading-tight text-club-ink sm:text-[19px]">{artist.name}</h3>
        <p className="mt-2.5 line-clamp-3 text-[11.5px] leading-relaxed sm:line-clamp-none sm:text-[12.5px]" style={{ color: "var(--bc2-ink-dim)" }}>
          {artist.bio}
        </p>
        <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: "rgba(244,240,235,0.12)" }}>
          <p className="text-[11px] sm:text-[12px]">
            <span className="mr-2 text-[9px] font-extrabold uppercase tracking-[0.22em]" style={{ color: a.main }}>
              Plays
            </span>
            <span className="font-semibold text-club-ink">{artist.instrument}</span>
          </p>
          <p className="hidden text-[11px] leading-snug sm:block sm:text-[12px]">
            <span className="mr-2 text-[9px] font-extrabold uppercase tracking-[0.22em]" style={{ color: a.main }}>
              Style
            </span>
            <span style={{ color: "var(--bc2-ink-dim)" }}>{artist.style}</span>
          </p>
        </div>
      </div>
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
        <h2 className="bc2-display mt-4 text-[30px] text-club-ink sm:text-[40px]">
          {COUNT_WORDS[LINEUP.length] ?? LINEUP.length} acts. <span className="bc2-headline-grad">Zero proof.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[14px]" style={{ color: "var(--bc2-ink-dim)" }}>
          Hover a card — or tap on mobile — to get to know each artist.
        </p>
      </motion.div>

      {/* centered flex row (not a left-anchored grid) so a short lineup sits in the middle */}
      <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-5">
        {LINEUP.map((artist, i) => (
          <ArtistTile key={artist.id} artist={artist} index={i} />
        ))}
      </div>
    </section>
  );
}
