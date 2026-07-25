"use client";

/**
 * NeonLineup — streaming-platform poster rail.
 *
 * Movie-poster tiles (2:3) in a horizontal slideway: centered when the
 * lineup fits the viewport, snap-scrollable when it doesn't. Hovering
 * a poster spotlights it — the card scales up while the other posters
 * gently dim (hover-capable screens only; see .bc2-rail in globals.css)
 * — and quietly cross-fades the graded still into a live performance
 * loop. Tap on touch, focus on keyboard, do the same and slide up the
 * bio panel; tapping another poster or anywhere outside closes it.
 *
 * Performance footage: drop /videos/artist-<id>.mp4 (ids from
 * src/data/bhajanClubbing.ts) and that artist's hover loop plays it;
 * until then the shared ambient loop stands in. Stills come from
 * `photo` (public/lineup/); artists without one get a monogram poster.
 */

import { useEffect, useRef, useState } from "react";
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

function ArtistTile({
  artist,
  index,
  active,
  onToggle,
}: {
  artist: ClubArtist;
  index: number;
  /** This tile's bio panel is open (tap / click) — owned by the rail. */
  active: boolean;
  onToggle: () => void;
}) {
  const a = ACCENT[artist.accent];
  /* True when the shared ambient loop is standing in for real footage —
     then the video screen-blends over the still as a light wash instead
     of replacing the artist's face with plain haze. */
  const [placeholder, setPlaceholder] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playLoop = () => videoRef.current?.play().catch(() => {});
  const pauseLoop = (force = false) => {
    if (force || !active) videoRef.current?.pause();
  };

  /* The rail owns which card is open, so this tile can be closed from
     the outside (tap another poster, tap away) — keep the loop in sync. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active]);

  return (
    /* Entrance animation lives on the wrapper so framer's inline opacity
       never fights the spotlight dim classes on the article itself. */
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.09 }}
      className="shrink-0 snap-center"
    >
    <article
      className="bc2-tile group relative aspect-[2/3] w-[68vw] max-w-[300px] cursor-pointer overflow-hidden rounded-[22px] border border-white/10 outline-none transition-[opacity,scale] duration-500 ease-in-out focus-visible:ring-2 hover:scale-[1.04] sm:w-[300px] md:w-[320px]"
      style={
        {
          boxShadow: "0 18px 48px -22px rgba(16,12,20,0.7)",
          "--tw-ring-color": a.main,
        } as React.CSSProperties
      }
      onClick={onToggle}
      onPointerEnter={playLoop}
      onPointerLeave={() => pauseLoop()}
      onFocus={playLoop}
      onBlur={() => pauseLoop()}
      tabIndex={0}
      aria-label={`${artist.name}. Tap for artist details.`}
    >
      {/* portrait */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.05] group-focus-visible:scale-[1.05] ${
          active ? "scale-[1.05]" : ""
        }`}
      >
        {artist.photo ? (
          /* Warm, moody, desaturated grade at rest so press shots read as
             one set; hover / tap / focus melts it back to full colour. */
          <Image
            src={artist.photo}
            alt={artist.name}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className={`object-cover transition-[filter] duration-700 ease-in-out ${
              active
                ? "grayscale-0 sepia-0 saturate-100"
                : "grayscale-[55%] sepia-[24%] saturate-[85%] group-hover:grayscale-0 group-hover:sepia-0 group-hover:saturate-100 group-focus-visible:grayscale-0 group-focus-visible:sepia-0 group-focus-visible:saturate-100"
            }`}
            style={artist.photoPosition ? { objectPosition: artist.photoPosition } : undefined}
          />
        ) : (
          <MonogramPoster artist={artist} />
        )}
        {/* live performance loop — quietly cross-fades in over the still.
            Real footage goes to /videos/artist-<id>.mp4; the shared
            ambient loop stands in until then. preload="none" keeps the
            rail cheap — the clip only loads on first hover/tap/focus. */}
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
            active
              ? placeholder
                ? "opacity-60"
                : "opacity-100"
              : placeholder
                ? "opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60"
                : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
          style={placeholder ? { mixBlendMode: "screen" } : undefined}
          onLoadedMetadata={(e) => setPlaceholder(e.currentTarget.currentSrc.endsWith("hero-loop.webm"))}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          aria-hidden
        >
          <source src={`/videos/artist-${artist.id}.mp4`} type="video/mp4" />
          <source src="/videos/hero-loop.webm" type="video/webm" />
        </video>
        {/* accent wash pulls any portrait into the warm palette */}
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
          active ? "opacity-0" : ""
        }`}
      >
        <h3 className="bc2-display text-[16px] leading-tight text-club-ink sm:text-[20px]">{artist.name}</h3>
      </div>

      {/* hover / tap / focus panel — the full story */}
      <div
        className={`absolute inset-0 flex translate-y-full flex-col justify-end p-4 transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 sm:p-5 ${
          active ? "!translate-y-0" : ""
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
    </article>
    </motion.div>
  );
}

export default function NeonLineup() {
  /* Which poster's bio panel is open (tap on touch / click on desktop).
     Owned here — not per-tile — so opening one poster closes the last,
     and a tap anywhere outside the rail closes everything. Fixes the
     mobile "card stays stuck open until you tap it again" state. */
  const [activeId, setActiveId] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId) return;
    const close = (e: PointerEvent) => {
      if (!railRef.current?.contains(e.target as Node)) setActiveId(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [activeId]);

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

      {/* poster slideway — centered while the lineup fits, snap-scroll once
          it grows past the viewport. .bc2-rail scopes the hover spotlight
          (globals.css): only a directly-hovered poster dims the others. */}
      <div ref={railRef} className="bc2-rail scrollbar-hide -mx-6 mt-12 snap-x snap-mandatory overflow-x-auto px-6 pb-4 pt-2">
        <div className="mx-auto flex w-max items-stretch gap-5 md:gap-6">
          {LINEUP.map((artist, i) => (
            <ArtistTile
              key={artist.id}
              artist={artist}
              index={i}
              active={activeId === artist.id}
              onToggle={() => setActiveId((v) => (v === artist.id ? null : artist.id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
