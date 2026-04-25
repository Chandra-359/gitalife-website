"use client";

/**
 * LumaEmbed — Shared RSVP card that either embeds a Luma event
 * or shows a "registration opening soon" fallback.
 *
 * Used by /festival and /retreats. Accepts an optional Luma URL;
 * when empty, renders a graceful fallback card with Instagram CTA.
 */

import { INSTAGRAM_URL } from "@/data/home";
import { C, Icon } from "./icons";

/** Convert a Luma event URL (https://lu.ma/xyz or https://luma.com/xyz) into its embed URL. */
export function toLumaEmbed(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("lu.ma") && !u.hostname.includes("luma.com")) return null;
    return `https://lu.ma/embed/event/${u.pathname.replace(/^\/+/, "")}/simple`;
  } catch {
    return null;
  }
}

interface LumaEmbedProps {
  lumaUrl: string;
  /** Used as iframe title and shown on the fallback card */
  eventTitle: string;
  /** Optional public RSVP URL shown as a fallback button */
  rsvpUrl?: string;
  /** Minimum iframe height in px (default 620) */
  height?: number;
}

export default function LumaEmbed({
  lumaUrl,
  eventTitle,
  rsvpUrl,
  height = 620,
}: LumaEmbedProps) {
  const embedUrl = toLumaEmbed(lumaUrl);

  return (
    <div
      className="rounded-3xl overflow-hidden shadow-2xl"
      style={{
        background: "white",
        border: `1px solid ${C.gold}25`,
      }}
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
          frameBorder="0"
          style={{ border: "none", minHeight: height }}
          allow="fullscreen; payment"
          title={`RSVP — ${eventTitle}`}
        />
      ) : (
        <div className="px-8 py-12 text-center">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${C.gold}20, ${C.saffron}15)`,
              color: C.saffron,
            }}
          >
            <Icon name="sparkle" size={22} />
          </div>
          <h3 className="mt-4 text-xl font-bold font-serif" style={{ color: C.krishnaBlue }}>
            Registration opening soon
          </h3>
          <p className="mt-2 text-[14px] text-gray-600 max-w-md mx-auto">
            We&rsquo;ll share the RSVP link here and on Instagram about a week before.
            To get notified, follow us or message us.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:scale-[1.03]"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
              }}
            >
              Follow @gitalifenyc
            </a>
            {rsvpUrl && (
              <a
                href={rsvpUrl}
                className="rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all"
                style={{
                  border: `1px solid ${C.gold}50`,
                  color: C.krishnaBlue,
                }}
              >
                RSVP via form
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
