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

/** Emails are matched lowercased; empty/garbage becomes null. */
export function normalizePromoEmail(raw: unknown): string | null {
  const email = String(raw ?? "").trim().toLowerCase();
  return email.includes("@") ? email.slice(0, 255) : null;
}

/**
 * Mobile numbers are matched on digits only, keeping the last 10 so
 * "+1 (555) 123-4567", "15551234567" and "555-123-4567" all collide.
 * Too-short inputs return null and are simply not matched on.
 */
export function normalizePromoPhone(raw: unknown): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length < 7) return null;
  return digits.slice(-10);
}

/** Who is redeeming — used for the once-per-user check. */
export interface PromoIdentity {
  email?: unknown;
  phone?: unknown;
}

/**
 * Look up and validate a promo code for this event. Used by the public
 * validation endpoint (so the ticket flow can show the discount) and
 * re-run by the checkout route right before the Square charge — the
 * client only ever sends the code string, never a discount amount.
 *
 * maxUses and the once-per-user rule are checked here but redemptions are
 * only recorded after a verified payment, so a burst of simultaneous
 * checkouts can briefly overshoot — acceptable for community-scale codes,
 * and the kill-switch is `active`.
 *
 * Pass `identity` (buyer email/phone) to enforce oncePerUser; without it
 * the check is advisory (e.g. an Apply click before the form is filled)
 * and the checkout route always re-runs it with the real identity.
 */
export async function checkPromoCode(
  db: Pick<PrismaClient, "promoCode" | "promoRedemption">,
  rawCode: unknown,
  now: Date = new Date(),
  identity: PromoIdentity | null = null,
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
  if (row.oncePerUser && identity) {
    const email = normalizePromoEmail(identity.email);
    const phone = normalizePromoPhone(identity.phone);
    const matchers = [
      ...(email ? [{ email }] : []),
      ...(phone ? [{ phone }] : []),
    ];
    if (matchers.length > 0) {
      const used = await db.promoRedemption.findFirst({
        where: { promoCodeId: row.id, OR: matchers },
        select: { id: true },
      });
      if (used) {
        return { ok: false, error: "This code has already been used with your email or mobile number" };
      }
    }
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
 * Record a verified paid redemption: bump usedCount and write the
 * PromoRedemption row that backs the once-per-user check. Called once per
 * newly-recorded Square order (and the [promoCodeId, orderId] unique key
 * backstops that), so refresh/re-verify never double-counts.
 */
export async function redeemPromoCode(
  db: Pick<PrismaClient, "promoCode" | "promoRedemption">,
  code: string,
  redemption: { email: string; phone?: unknown; orderId: string },
) {
  try {
    const row = await db.promoCode.findUnique({ where: { code: normalizePromoCode(code) } });
    if (!row) return;
    await db.promoRedemption.create({
      data: {
        promoCodeId: row.id,
        email: normalizePromoEmail(redemption.email) ?? redemption.email.toLowerCase().slice(0, 255),
        phone: normalizePromoPhone(redemption.phone),
        orderId: redemption.orderId,
      },
    });
    // Only counts up when the redemption row is new — a replayed order id
    // throws P2002 above and skips the increment.
    await db.promoCode.update({
      where: { id: row.id },
      data: { usedCount: { increment: 1 } },
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return; // this order's redemption is already on the books
    }
    // Never fail a paid registration over usage bookkeeping.
    console.error("Promo redemption record failed (non-fatal):", error);
  }
}
