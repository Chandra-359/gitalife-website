"use client";

/**
 * ArtistProfiles — editorial artist cards, the way kirtan-artist sites
 * present people: 3:4 portrait, serif name, gold uppercase instrument
 * label, and the one-line bio in plain sight (no hover-reveal). Artists
 * without a photo get a warm monogram poster in their accent colour —
 * set `photo` in src/data/bhajanClubbing.ts (files in public/lineup/)
 * and the real portrait drops in.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import { LINEUP, type AccentToken, type ClubArtist } from "@/data/bhajanClubbing";

const ACCENT: Record<AccentToken, { main: string; soft: string }> = {
  gold: { main: "#C9A248", soft: "#EDD698" },
  saffron: { main: "#D9691A", soft: "#F2B95C" },
  peacock: { main: "#00917A", soft: "#7FD6C2" },
  lotus: { main: "#C84682", soft: "#F0A0C4" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w[0] && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

/** Placeholder portrait — warm accent aura, orbit rings, serif monogram. */
function MonogramPoster({ artist }: { artist: ClubArtist }) {
  const a = ACCENT[artist.accent];
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #2A1B10 0%, #160D06 78%)" }}>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 34%, ${a.main}30, transparent 62%)` }}
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
        className="bc3-display absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 select-none text-[56px] sm:text-[64px]"
        style={{ color: a.soft, textShadow: `0 0 34px ${a.main}66` }}
      >
        {initials(artist.name)}
      </span>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--tex-grain-dark)", backgroundSize: "240px 240px", opacity: 0.3, mixBlendMode: "screen" }}
        aria-hidden
      />
    </div>
  );
}

function ArtistCard({ artist, index }: { artist: ClubArtist; index: number }) {
  const a = ACCENT[artist.accent];
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.09 }}
      className="w-full max-w-[320px] sm:w-[300px]"
    >
      {/* portrait */}
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-3xl"
        style={{ border: "1px solid var(--bc3-line)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.65)" }}
      >
        {artist.photo ? (
          <Image src={artist.photo} alt={artist.name} fill sizes="(min-width: 640px) 300px, 90vw" className="object-cover" />
        ) : (
          <MonogramPoster artist={artist} />
        )}
        {/* warm wash pulls any portrait into the candlelit palette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(201,162,72,0.1), transparent 40%, rgba(16,10,5,0.35))" }}
          aria-hidden
        />
      </div>

      {/* editorial caption — everything in plain sight */}
      <div className="mt-5 text-center">
        <h3 className="bc3-display text-[21px] leading-tight text-white">{artist.name}</h3>
        <p className="mt-2 text-[10.5px] font-bold uppercase tracking-[0.24em]" style={{ color: a.soft }}>
          {artist.instrument}
        </p>
        <p className="mx-auto mt-3 max-w-[36ch] text-[13px] leading-relaxed" style={{ color: "var(--bc3-ink-dim)" }}>
          {artist.bio}
        </p>
      </div>
    </motion.article>
  );
}

export default function ArtistProfiles() {
  return (
    <section id="lineup" className="relative mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <p className="bc3-eyebrow">The Artists</p>
        <h2 className="bc3-display mt-4 text-[30px] text-white sm:text-[40px]">
          The voices <span className="bc3-headline-warm">leading the night</span>
        </h2>
      </motion.div>

      {/* centered flex row so a short lineup sits in the middle */}
      <div className="mt-12 flex flex-wrap items-start justify-center gap-x-8 gap-y-12">
        {LINEUP.map((artist, i) => (
          <ArtistCard key={artist.id} artist={artist} index={i} />
        ))}
      </div>
    </section>
  );
}
