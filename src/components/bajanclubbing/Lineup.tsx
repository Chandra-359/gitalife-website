"use client";

/**
 * Lineup — headliner spotlight card + supporting acts grid.
 *
 * Cards are dark glass with a 1px gradient "neon" edge in each artist's
 * accent colour (.bc-neon-card + CSS vars). Avatars are initial discs —
 * swap for photos by adding an imageUrl to LINEUP entries later.
 */

import { motion } from "framer-motion";
import { C } from "@/components/home/icons";
import { LINEUP, type AccentToken, type ClubArtist } from "@/data/bajanClubbing";

const ACCENT: Record<AccentToken, { main: string; soft: string }> = {
  gold: { main: C.gold, soft: C.goldLight },
  saffron: { main: C.saffron, soft: "#F2A264" },
  peacock: { main: C.peacockLight, soft: "#7BD8C4" },
  lotus: { main: C.lotusPink, soft: "#F0A0C4" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w[0] && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function AvatarDisc({ artist, size }: { artist: ClubArtist; size: number }) {
  const a = ACCENT[artist.accent];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {artist.headliner && (
        <span
          className="bc-glow-pulse absolute -inset-2 rounded-full"
          style={{ background: `radial-gradient(circle, ${a.main}44, transparent 70%)` }}
          aria-hidden
        />
      )}
      <div
        className="relative flex h-full w-full items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 28%, ${a.soft}55, ${a.main}22 45%, rgba(8,14,42,0.9))`,
          border: `1px solid ${a.main}66`,
          boxShadow: `inset 0 1px 0 rgba(251,245,230,0.14), 0 10px 30px -12px ${a.main}55`,
        }}
      >
        <span
          className="select-none"
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontWeight: 700,
            fontSize: size * 0.34,
            color: a.soft,
            letterSpacing: "0.02em",
          }}
        >
          {initials(artist.name)}
        </span>
      </div>
    </div>
  );
}

function Tag({ label, accent }: { label: string; accent: AccentToken }) {
  const a = ACCENT[accent];
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em]"
      style={{ background: `${a.main}14`, border: `1px solid ${a.main}38`, color: a.soft }}
    >
      {label}
    </span>
  );
}

function neonVars(accent: AccentToken): React.CSSProperties {
  const a = ACCENT[accent];
  return {
    "--bc-edge-hi": `${a.main}a6`,
    "--bc-edge-lo": `${a.main}40`,
    "--bc-shadow": `${a.main}59`,
  } as React.CSSProperties;
}

export default function Lineup() {
  const headliner = LINEUP.find((x) => x.headliner) ?? LINEUP[0];
  const support = LINEUP.filter((x) => x !== headliner);
  const hl = ACCENT[headliner.accent];

  return (
    <section id="lineup" className="relative mx-auto max-w-5xl scroll-mt-20 px-6 py-16 sm:py-24">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="eyebrow" style={{ color: C.goldLight }}>
          The Lineup
        </p>
        <h2 className="mt-3 text-3xl text-white sm:text-4xl" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
          Four acts. One sound system.{" "}
          <em style={{ color: C.goldLight }}>Zero proof.</em>
        </h2>
      </motion.div>

      {/* Headliner card */}
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65 }}
        className="bc-neon-card mt-12 p-6 sm:p-9"
        style={neonVars(headliner.accent)}
      >
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-9 sm:text-left">
          <AvatarDisc artist={headliner} size={132} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span
                className="rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em]"
                style={{ background: `${hl.main}1f`, border: `1px solid ${hl.main}59`, color: hl.soft }}
              >
                ★ Headliner
              </span>
              <span className="text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(251,245,230,0.55)" }}>
                {headliner.setTime} set
              </span>
            </div>
            <h3
              className="mt-3.5 text-[34px] leading-tight text-white sm:text-[42px]"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              {headliner.name}
            </h3>
            <p className="mt-1 text-[13px] font-bold uppercase tracking-[0.18em]" style={{ color: hl.soft }}>
              {headliner.role}
            </p>
            <p className="mt-3.5 text-[15px] leading-relaxed" style={{ color: "rgba(251,245,230,0.75)" }}>
              {headliner.bio}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {headliner.tags.map((t) => (
                <Tag key={t} label={t} accent={headliner.accent} />
              ))}
            </div>
          </div>
        </div>
      </motion.article>

      {/* Supporting acts */}
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {support.map((artist, i) => {
          const a = ACCENT[artist.accent];
          return (
            <motion.article
              key={artist.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="bc-neon-card flex flex-col items-center p-6 text-center"
              style={neonVars(artist.accent)}
            >
              <AvatarDisc artist={artist} size={88} />
              <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(251,245,230,0.5)" }}>
                {artist.setTime} set
              </span>
              <h3
                className="mt-1.5 text-[22px] leading-snug text-white"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 600 }}
              >
                {artist.name}
              </h3>
              <p className="mt-1 text-[11.5px] font-bold uppercase tracking-[0.16em]" style={{ color: a.soft }}>
                {artist.role}
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: "rgba(251,245,230,0.68)" }}>
                {artist.bio}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {artist.tags.map((t) => (
                  <Tag key={t} label={t} accent={artist.accent} />
                ))}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
