"use client";

/**
 * LumaCalendarEmbed — branded chrome around Luma's calendar iframe.
 *
 * Single source of truth for the calendar URL is LUMA_CALENDAR_EMBED_URL
 * in src/data/home.ts. This component owns:
 *  - the gold/saffron framed wrapper
 *  - a soft loading skeleton (lotus pulse) until the iframe paints
 *  - a "Powered by Luma · Open in new tab" footer line
 *  - responsive heights tuned for mobile QR landings
 */

import { useState } from "react";
import { LUMA_CALENDAR_EMBED_URL, LUMA_CALENDAR_URL } from "@/data/home";
import { C, Icon } from "@/components/home/icons";

interface LumaCalendarEmbedProps {
  /** Optional override (defaults to the shared site calendar) */
  embedUrl?: string;
  /** Public Luma calendar URL (used by the "open in new tab" link) */
  publicUrl?: string;
  /** Iframe height in px on desktop. Mobile uses min-height via CSS. */
  desktopHeight?: number;
}

export default function LumaCalendarEmbed({
  embedUrl = LUMA_CALENDAR_EMBED_URL,
  publicUrl = LUMA_CALENDAR_URL,
  desktopHeight = 760,
}: LumaCalendarEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative">
      {/* ---- Outer glow halo (subtle saffron→gold ring) ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 sm:-inset-6 rounded-[36px] opacity-60 blur-2xl"
        style={{
          background: `radial-gradient(60% 60% at 50% 50%, ${C.gold}26 0%, ${C.saffron}14 40%, transparent 75%)`,
        }}
      />

      {/* ---- Framed shell ---- */}
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: "white",
          border: `1px solid ${C.gold}33`,
          boxShadow:
            "0 1px 2px rgba(15,27,77,0.04), 0 30px 80px -28px rgba(15,27,77,0.18), 0 0 0 1px rgba(212,168,67,0.08)",
        }}
      >
        {/* Top status bar */}
        <div
          className="flex items-center justify-between gap-3 px-5 sm:px-7 py-3.5 border-b"
          style={{
            background: `linear-gradient(90deg, ${C.cream}, white 50%, ${C.cream})`,
            borderColor: `${C.gold}1f`,
          }}
        >
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: C.saffron }}
          >
            <span className="relative inline-flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full"
                style={{ background: C.saffron, opacity: 0.45 }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: C.saffron }}
              />
            </span>
            Live calendar
          </span>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors"
            style={{
              color: C.krishnaBlue,
              border: `1px solid ${C.gold}33`,
              background: "white",
            }}
          >
            <span className="hidden sm:inline">Open on Luma</span>
            <span className="sm:hidden">Open</span>
            <Icon name="arrowRight" size={11} />
          </a>
        </div>

        {/* Iframe area with soft skeleton overlay */}
        <div className="relative">
          {!loaded && (
            <div
              aria-hidden
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{
                background:
                  "linear-gradient(180deg, #FFFBF2 0%, #FFF9F0 100%)",
              }}
            >
              {/* Lotus pulse */}
              <div
                className="h-12 w-12 rounded-full animate-lotus-pulse"
                style={{
                  background: `radial-gradient(circle, ${C.gold}55 0%, ${C.saffron}22 60%, transparent 80%)`,
                }}
              />
              <p
                className="text-[12px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: C.gold }}
              >
                Loading upcoming programs…
              </p>
              {/* Shimmer skeleton rows */}
              <div className="mt-2 w-[80%] max-w-md space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl overflow-hidden relative"
                    style={{ background: `${C.gold}12` }}
                  >
                    <div
                      className="absolute inset-0 animate-shimmer"
                      style={{
                        background: `linear-gradient(105deg, transparent 40%, ${C.gold}33 50%, transparent 60%)`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <iframe
            src={embedUrl}
            title="Gita Life NYC — Upcoming Programs (Luma)"
            loading="lazy"
            allow="fullscreen; payment"
            onLoad={() => setLoaded(true)}
            className="block w-full"
            style={{
              border: "none",
              minHeight: 600,
              height: desktopHeight,
            }}
          />
        </div>

        {/* Footer line */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-7 py-3 border-t text-[11px]"
          style={{
            background: `linear-gradient(90deg, ${C.cream}, white 50%, ${C.cream})`,
            borderColor: `${C.gold}1f`,
            color: "#6b7280",
          }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: C.gold }}
            />
            Registration powered by Luma — free, no app required
          </span>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold inline-flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: C.krishnaBlue }}
          >
            View full calendar
            <Icon name="arrowRight" size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
