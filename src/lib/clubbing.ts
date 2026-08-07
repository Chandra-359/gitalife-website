/**
 * clubbing.ts — server-side helpers shared by the Bhajan Clubbing
 * registration and checkout API routes (route files may only export
 * HTTP handlers, so shared logic lives here).
 */

import type { PrismaClient } from "@prisma/client";
import { EVENT, type PromoDiscount } from "@/data/bhajanClubbing";

/** Tier tag stamped at the front of RSVP notes — also used to count tier usage. */
export const tierTag = (tierName: string) => `[${tierName}]`;

/** Ensure the event's Program row exists and is current with the data file. */
export async function ensureEventProgram(db: Pick<PrismaClient, "program">) {
  const data = {
    title: `${EVENT.title} — ${EVENT.volume}`,
    category: "Kirtan & Prasadam",
    description: EVENT.description,
    subtitle: EVENT.tagline,
    latitude: EVENT.venue.lat,
    longitude: EVENT.venue.lng,
    dayOfWeek: "Saturday",
    time: EVENT.timeLabel,
    venueName: EVENT.venue.name,
    address: EVENT.venue.address,
    duration: "3 hours",
    level: "All levels",
    capacity: EVENT.capacity,
    status: "published",
    featured: true,
  };
  return db.program.upsert({
    where: { id: EVENT.programId },
    update: data,
    create: { id: EVENT.programId, ...data },
  });
}

/** Confirmed guest count for the event, optionally narrowed to one tier. */
export async function countGuests(db: Pick<PrismaClient, "rsvp">, tierName?: string) {
  const sum = await db.rsvp.aggregate({
    where: {
      programId: EVENT.programId,
      status: "confirmed",
      ...(tierName ? { notes: { startsWith: tierTag(tierName) } } : {}),
    },
    _sum: { guests: true },
  });
  return sum._sum.guests ?? 0;
}

/** Whether Square is configured, i.e. tickets can actually be sold. */
export function paymentsConfigured(): boolean {
  return !!(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

/* ------------------------------------------------------------------ */
/*  Promo codes                                                        */
/* ------------------------------------------------------------------ */

export type PromoCheck =
  | { ok: true; promo: PromoDiscount }
  | { ok: false; error: string };

/** Codes are stored and matched uppercase, alphanumeric with - and _. */
export function normalizePromoCode(raw: unknown): string {
  return String(raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Look up and validate a promo code for this event. Used by the public
 * validation endpoint (so the ticket flow can show the discount) and
 * re-run by the checkout route right before the Square charge — the
 * client only ever sends the code string, never a discount amount.
 *
 * maxUses is checked here but only counted up after a verified payment,
 * so a burst of simultaneous checkouts can briefly overshoot the cap —
 * acceptable for community-scale codes, and the kill-switch is `active`.
 */
export async function checkPromoCode(
  db: Pick<PrismaClient, "promoCode">,
  rawCode: unknown,
  now: Date = new Date(),
): Promise<PromoCheck> {
  const code = normalizePromoCode(rawCode);
  if (!code || code.length > 40 || !/^[A-Z0-9_-]+$/.test(code)) {
    return { ok: false, error: "That doesn't look like a valid promo code" };
  }
  const row = await db.promoCode.findUnique({ where: { code } });
  if (!row || row.programId !== EVENT.programId || !row.active) {
    return { ok: false, error: "That promo code isn't valid" };
  }
  if (row.expiresAt && now >= row.expiresAt) {
    return { ok: false, error: "That promo code has expired" };
  }
  if (row.maxUses !== null && row.usedCount >= row.maxUses) {
    return { ok: false, error: "That promo code has been fully redeemed" };
  }
  if (row.kind === "percent" && row.percentOff && row.percentOff >= 1 && row.percentOff <= 100) {
    return { ok: true, promo: { code: row.code, kind: "percent", percentOff: row.percentOff } };
  }
  if (row.kind === "fixed" && row.amountOffCents && row.amountOffCents > 0) {
    return { ok: true, promo: { code: row.code, kind: "fixed", amountOffCents: row.amountOffCents } };
  }
  // Misconfigured row (bad kind/value) — treat as invalid rather than crash.
  return { ok: false, error: "That promo code isn't valid" };
}

/**
 * Count a verified paid redemption. Called once per newly-recorded Square
 * order, so refresh/re-verify of the same order never double-counts.
 */
export async function redeemPromoCode(db: Pick<PrismaClient, "promoCode">, code: string) {
  try {
    await db.promoCode.updateMany({
      where: { code: normalizePromoCode(code) },
      data: { usedCount: { increment: 1 } },
    });
  } catch (error) {
    // Never fail a paid registration over usage bookkeeping.
    console.error("Promo redemption count failed (non-fatal):", error);
  }
}
