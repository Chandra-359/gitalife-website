"use client";

/**
 * SeatMeterBadge — "Hurry — only 20 seats left" / "Sold out" pill.
 *
 * Renders nothing until the live count says something worth saying (see
 * seatMeter() in the data file), so a healthy room stays quiet and an
 * offline count never invents a number.
 */

import { seatMeter } from "@/data/bhajanClubbing";
import { useAvailability } from "./useAvailability";

const TONE = {
  urgent: {
    color: "var(--bc2-amber)",
    background: "rgba(229,192,141,0.12)",
    border: "1px solid rgba(229,192,141,0.55)",
    dot: "var(--bc2-amber)",
  },
  "sold-out": {
    color: "#FF9E9E",
    background: "rgba(255,110,110,0.1)",
    border: "1px solid rgba(255,110,110,0.45)",
    dot: "#FF6E6E",
  },
} as const;

export default function SeatMeterBadge({
  remaining,
  size = "md",
  className = "",
}: {
  /** Live remaining count. Omit to read it from the shared store. */
  remaining?: number | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const { availability } = useAvailability();
  const meter = seatMeter(remaining !== undefined ? remaining : availability?.remaining);
  if (!meter) return null;

  const tone = TONE[meter.tone];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-extrabold uppercase ${
        size === "sm"
          ? "px-3.5 py-1.5 text-[10px] tracking-[0.18em]"
          : "px-4 py-2 text-[11.5px] tracking-[0.16em]"
      } ${className}`}
      style={{ background: tone.background, border: tone.border, color: tone.color, backdropFilter: "blur(8px)" }}
      role="status"
    >
      <span
        className="bc2-live-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: tone.dot, boxShadow: `0 0 10px ${tone.dot}` }}
        aria-hidden
      />
      {size === "sm" ? meter.short : meter.long}
    </span>
  );
}
