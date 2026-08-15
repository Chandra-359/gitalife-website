"use client";

/**
 * useAvailability — live seat count for /bhajanclubbing.
 *
 * Backed by GET /api/bhajanclubbing, which reports the guest count
 * confirmed so far against EVENT.capacity. Several places on the page
 * need the same number at the same time (hero pill, sticky mobile bar,
 * ticket flow), so the result lives in one module-level store with a
 * single in-flight request shared by every subscriber — one fetch per
 * page load instead of one per component.
 *
 * `remaining: null` means the count is unknown (DB offline); callers
 * must fall back to their static copy rather than showing a number.
 */

import { useCallback, useSyncExternalStore } from "react";

export interface TierAvailability {
  limit: number;
  taken: number;
  remaining: number;
}

export interface Availability {
  capacity: number;
  confirmed: number | null;
  /** null → DB offline, fall back to static copy */
  remaining: number | null;
  tiers: Record<string, TierAvailability> | null;
  /** false → Square unconfigured, tickets can't be sold */
  payments?: boolean;
}

let cached: Availability | null = null;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

/** Fetch once; concurrent callers ride along on the same request. */
function load(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = fetch("/api/bhajanclubbing", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: Availability | null) => {
      if (!data) return;
      cached = data; // a fresh object every time — snapshot identity changes
      listeners.forEach((notify) => notify());
    })
    .catch(() => {
      /* the meter is progressive enhancement — static copy still stands */
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** Subscribing is also what kicks off the (shared) first fetch. */
function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  load();
  return () => {
    listeners.delete(onStoreChange);
  };
}

const getSnapshot = () => cached;
// Server render (and the hydration pass) knows nothing yet — every
// consumer renders its "no count" branch until the first fetch lands.
const getServerSnapshot = () => null;

export function useAvailability() {
  const availability = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const refresh = useCallback(() => {
    load();
  }, []);
  return { availability, refresh };
}
