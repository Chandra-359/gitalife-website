/**
 * donation.ts — Single source of truth for the /donate page.
 *
 * WHERE TO EDIT EACH THING:
 *  - Preset amounts      → PRESET_AMOUNTS_USD (tiles on the page, in order).
 *                          Amounts follow the shagun tradition (ending in 1).
 *  - Amount guard-rails  → MIN/MAX_DONATION_USD — enforced server-side by
 *                          the checkout route; the client never sends a
 *                          price the server doesn't re-clamp.
 *  - Page copy           → DONATE (headline, blurb, where-it-goes chips,
 *                          transparency note) — kept deliberately short.
 *  - Bank transfer       → DONATE.bank (routing/account for large gifts).
 *  - Contact inbox       → DONATE.contactEmail (page + receipt Reply-To).
 *
 * The checkout API (src/app/api/donate/checkout/route.ts) verifies the
 * Square order on return and records it as a Donation row.
 */

/** Square order reference — marks an order as a Gita Life donation. */
export const DONATION_REFERENCE_ID = "gitalife-donation";

/** Preset tiles shown on the page, in display order. */
export const PRESET_AMOUNTS_USD = [501, 1001, 2501, 5001, 10001] as const;

/** Tile pre-selected when the page loads. */
export const DEFAULT_AMOUNT_USD = 501;

/** Preset highlighted with the "Most chosen" badge. */
export const POPULAR_AMOUNT_USD = 501;

/** Custom-amount guard rails (USD) — also enforced server-side. Keep the
 *  ceiling above the largest preset, or the server would quietly clamp it. */
export const MIN_DONATION_USD = 1;
export const MAX_DONATION_USD = 25_000;

export const DONATE = {
  eyebrow: "Support the mission",
  headline: "Keep the wisdom flowing",
  blurb:
    "Every program we run is free and volunteer-led. Your gift keeps the kirtans loud, the prasadam warm, and the Gita open for everyone in NYC.",
  /** Where the money goes — three short chips, no essays. */
  whereItGoes: [
    { icon: "book", label: "Weekly Gita programs" },
    { icon: "food", label: "Free prasadam" },
    { icon: "music", label: "Kirtans & retreats" },
  ],
  /** Transparency line under the card — mirrors the Bhajan Clubbing note. */
  note: "Gita Life NYC is a volunteer-led community initiative. Every donation goes directly toward our programs, prasadam, festivals, and future spiritual & community initiatives.",
  contactEmail: "hello@gitalifenyc.com",
  url: "https://www.gitalifenyc.com/donate",
  /** Direct bank transfer (ACH) for larger gifts — revealed on tap in the
   *  "Giving a larger amount?" panel. Card fees don't apply to these. */
  bank: {
    bankName: "TD Bank",
    routingNumber: "026013673",
    accountNumber: "4457166118",
  },
} as const;

/**
 * Clamp a raw amount into a chargeable whole-cent value, or null when it
 * isn't a usable donation (blank, NaN, below the minimum). Used by the
 * page for live validation and re-run by the checkout route — the server
 * never trusts a client-computed amount beyond this.
 */
export function donationCents(rawUsd: unknown): number | null {
  const n = typeof rawUsd === "number" ? rawUsd : Number.parseFloat(String(rawUsd ?? ""));
  if (!Number.isFinite(n)) return null;
  const clamped = Math.min(MAX_DONATION_USD, n);
  if (clamped < MIN_DONATION_USD) return null;
  return Math.round(clamped * 100);
}

/** "$51" / "$23.75"-style formatter for cent amounts. */
export function usd(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars.toLocaleString("en-US")}` : `$${dollars.toFixed(2)}`;
}
