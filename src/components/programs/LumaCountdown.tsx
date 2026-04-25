"use client";

/**
 * LumaCountdown — live d/h/m/s countdown to (or progress through) an event.
 *
 * Three states:
 *  - upcoming  → "Starts in 2d · 14h · 23m · 14s"
 *  - live      → animated "Happening now" pill + progress bar
 *  - past      → null (parent should hide; safe to leave on)
 *
 * Updates every second. Re-syncs against new ISO inputs.
 */

import { useEffect, useState } from "react";
import { breakdown } from "./dateUtils";
import { C } from "@/components/home/icons";

interface LumaCountdownProps {
  startIso: string;
  endIso: string;
  /** Compact one-line layout for the featured card */
  compact?: boolean;
}

export default function LumaCountdown({
  startIso,
  endIso,
  compact = false,
}: LumaCountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    // Kick the first tick on the next paint so we don't call setState
    // synchronously inside the effect body (which would cascade-render).
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  // SSR / first paint: render a neutral placeholder so server and client agree.
  if (now === null) {
    return (
      <div
        className={
          compact
            ? "h-6 rounded-full w-40"
            : "h-12 rounded-xl w-full max-w-sm"
        }
        style={{ background: `${C.gold}10` }}
      />
    );
  }

  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  if (now >= start && now <= end) {
    // Live — show animated pill + progress
    const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    return (
      <div className={compact ? "inline-flex items-center gap-2.5" : "w-full"}>
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{
            background: `${C.saffron}1a`,
            color: C.saffron,
            border: `1px solid ${C.saffron}40`,
          }}
        >
          <span className="relative inline-flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full"
              style={{ background: C.saffron, opacity: 0.6 }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: C.saffron }}
            />
          </span>
          Happening now
        </span>
        {!compact && (
          <div
            className="mt-2 h-1.5 w-full max-w-sm rounded-full overflow-hidden"
            style={{ background: `${C.gold}1a` }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${C.gold}, ${C.saffron})`,
              }}
            />
          </div>
        )}
      </div>
    );
  }

  if (now > end) return null;

  const { d, h, m, s } = breakdown(start - now);
  const showDays = d > 0;
  const showSeconds = !showDays;

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
        style={{
          background: `${C.gold}14`,
          border: `1px solid ${C.gold}33`,
          color: C.krishnaBlue,
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ background: C.gold }}
        />
        Starts in{" "}
        {showDays ? `${d}d · ${h}h · ${m}m` : `${h}h · ${m}m · ${s}s`}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {[
        showDays && { value: d, label: "days" },
        { value: h, label: "hrs" },
        { value: m, label: "min" },
        showSeconds && { value: s, label: "sec" },
      ]
        .filter((x): x is { value: number; label: string } => Boolean(x))
        .map((seg) => (
          <div
            key={seg.label}
            className="rounded-xl px-3 py-2 text-center min-w-[60px]"
            style={{
              background: "white",
              border: `1px solid ${C.gold}30`,
              boxShadow: `0 1px 2px rgba(15,27,77,0.04)`,
            }}
          >
            <div
              className="font-serif text-2xl font-bold leading-none tabular-nums"
              style={{ color: C.krishnaBlue }}
            >
              {String(seg.value).padStart(2, "0")}
            </div>
            <div
              className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "#9ca3af" }}
            >
              {seg.label}
            </div>
          </div>
        ))}
    </div>
  );
}
