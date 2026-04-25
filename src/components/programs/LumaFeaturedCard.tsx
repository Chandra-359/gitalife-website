"use client";

/**
 * LumaFeaturedCard — large hero card for the next upcoming event.
 *
 * 5-column grid on desktop (image: 2 / content: 3), stacks on mobile.
 * Renders cover image with subtle Ken Burns drift, big serif title,
 * date + location with icons, live countdown, and a saffron CTA.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import type { LumaEvent } from "@/lib/luma";
import { C, Icon } from "@/components/home/icons";
import {
  formatRelativeDay,
  formatTimeRange,
  getDatePill,
  getTagAccent,
} from "./dateUtils";
import LumaCountdown from "./LumaCountdown";

const ACCENT_HEX: Record<ReturnType<typeof getTagAccent>, string> = {
  saffron: C.saffron,
  gold: C.gold,
  peacock: C.peacock,
  lotus: C.lotusPink,
  krishna: C.krishnaBlue,
};

interface LumaFeaturedCardProps {
  event: LumaEvent;
}

export default function LumaFeaturedCard({ event }: LumaFeaturedCardProps) {
  const pill = getDatePill(event.startAt);
  const relative = formatRelativeDay(event.startAt);
  const timeRange = formatTimeRange(event.startAt, event.endAt);
  const venueLine = [event.location?.venue, event.location?.city]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="relative grid md:grid-cols-5 overflow-hidden rounded-3xl"
      style={{
        background: "white",
        border: `1px solid ${C.gold}26`,
        boxShadow:
          "0 1px 2px rgba(15,27,77,0.04), 0 32px 80px -28px rgba(15,27,77,0.22), 0 0 0 1px rgba(212,168,67,0.08)",
      }}
    >
      {/* Soft saffron halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[40px] opacity-50 blur-3xl"
        style={{
          background: `radial-gradient(60% 60% at 30% 50%, ${C.saffron}1a 0%, ${C.gold}14 50%, transparent 80%)`,
        }}
      />

      {/* ---- Image ---- */}
      <div className="relative md:col-span-2 min-h-[260px] md:min-h-[420px]">
        {event.coverUrl ? (
          <Image
            src={event.coverUrl}
            alt={event.name}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover animate-ken-burns"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${C.krishnaBlue} 0%, ${C.krishnaDeep} 100%)`,
            }}
          />
        )}

        {/* Image overlay gradient — keeps date pill legible */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,27,77,0.18) 0%, transparent 35%, transparent 65%, rgba(15,27,77,0.32) 100%)",
          }}
        />

        {/* Featured badge */}
        <div className="absolute top-5 left-5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] backdrop-blur-md"
            style={{
              background: "rgba(255,255,255,0.85)",
              color: C.saffron,
              border: `1px solid ${C.gold}40`,
            }}
          >
            <Icon name="sparkle" size={11} />
            Next up
          </span>
        </div>

        {/* Big date pill — bottom left */}
        <div
          className="absolute bottom-5 left-5 rounded-2xl px-4 py-3 text-center backdrop-blur-md"
          style={{
            background: "rgba(255,251,242,0.94)",
            border: `1px solid ${C.gold}40`,
            boxShadow: "0 8px 24px -8px rgba(15,27,77,0.18)",
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: C.saffron }}
          >
            {pill.monthShort}
          </p>
          <p
            className="font-serif text-3xl font-bold leading-none mt-0.5 tabular-nums"
            style={{ color: C.krishnaBlue }}
          >
            {pill.day}
          </p>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.18em] mt-0.5"
            style={{ color: "#9ca3af" }}
          >
            {pill.dowShort}
          </p>
        </div>
      </div>

      {/* ---- Content ---- */}
      <div className="relative md:col-span-3 p-7 sm:p-10 flex flex-col">
        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag) => {
              const accent = ACCENT_HEX[getTagAccent(tag)];
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em]"
                  style={{
                    background: `${accent}14`,
                    color: accent,
                    border: `1px solid ${accent}33`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: accent }}
                  />
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Relative day + time */}
        <p
          className="text-[12.5px] font-bold uppercase tracking-[0.18em]"
          style={{ color: C.saffron }}
        >
          {relative} · {timeRange}
        </p>

        {/* Title */}
        <h3
          className="mt-3 font-serif text-3xl sm:text-4xl font-bold leading-[1.1]"
          style={{ color: C.krishnaBlue, letterSpacing: "-0.02em" }}
        >
          {event.name}
        </h3>

        {/* Location */}
        {venueLine && (
          <p
            className="mt-4 inline-flex items-center gap-2 text-[14px]"
            style={{ color: "#4b5563" }}
          >
            <Icon name="mapPin" size={14} style={{ color: C.gold }} />
            {venueLine}
          </p>
        )}

        {/* Description */}
        {event.description && (
          <p
            className="mt-4 text-[14.5px] leading-[1.7] line-clamp-3"
            style={{ color: "#4b5563" }}
          >
            {event.description}
          </p>
        )}

        {/* Countdown */}
        <div className="mt-6">
          <LumaCountdown startIso={event.startAt} endIso={event.endAt} />
        </div>

        {/* CTAs */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:scale-[1.03] btn-primary-gradient"
          >
            Reserve your spot
            <Icon
              name="arrowRight"
              size={13}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </a>
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold transition-opacity hover:opacity-70"
            style={{ color: C.krishnaBlue }}
          >
            View on Luma
            <Icon name="arrowRight" size={11} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
