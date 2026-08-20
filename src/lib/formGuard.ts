/**
 * formGuard.ts — lightweight spam protection for the public registration
 * forms (festival + weekly programs), with no third-party CAPTCHA.
 *
 * Two independent trip-wires, both invisible to real people:
 *
 *  1. Honeypot — the forms render an off-screen "website" input that
 *     humans never see or fill. Auto-form-fillers stuff every field, so
 *     a non-empty value marks the submission as a bot. Routes answer
 *     those with a FAKE success, so the bot moves on instead of
 *     adapting.
 *
 *  2. Signed render-time token — the (force-dynamic) page mints
 *     `<ms>.<hmac>` server-side on every render and the form echoes it
 *     back. Submissions with no/forged tokens (bots POSTing the API
 *     directly — the pattern behind the gibberish sheet rows) or
 *     arriving faster than a human can type are rejected with a
 *     humane "try again" message.
 *
 * Secret resolution matches lib/ticket.ts: TICKET_QR_SECRET falling
 * back to the NextAuth secret production already requires. With no
 * secret the token check quietly disables (honeypot still works).
 */

import { createHmac, timingSafeEqual } from "node:crypto";

function guardSecret(): string | null {
  return (
    process.env.TICKET_QR_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    null
  );
}

function sign(ts: string, secret: string): string {
  return createHmac("sha256", secret).update(`form:${ts}`).digest("base64url");
}

/** Faster than this = not a human filling five fields. */
const MIN_AGE_MS = 4_000;

/** Older than this = a long-stale tab; ask for a refresh. */
const MAX_AGE_MS = 24 * 3600_000;

/** Signed render timestamp for a page's forms — null when no secret. */
export function mintFormToken(now = Date.now()): string | null {
  const secret = guardSecret();
  if (!secret) return null;
  const ts = String(now);
  return `${ts}.${sign(ts, secret)}`;
}

export type FormGuardCheck =
  | { ok: true }
  /**
   * honeypot — answer with fake success;
   * too-fast — ask them to give it a second and press again;
   * bad-token — missing/forged/stale: ask for a page refresh.
   */
  | { ok: false; reason: "honeypot" | "too-fast" | "bad-token" };

/** Inspect a registration body's `website` (honeypot) and `formToken`. */
export function checkFormGuard(
  body: { website?: unknown; formToken?: unknown },
  now = Date.now(),
): FormGuardCheck {
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return { ok: false, reason: "honeypot" };
  }

  const secret = guardSecret();
  if (!secret) return { ok: true }; // token check off without a secret

  const token = body.formToken;
  if (typeof token !== "string") return { ok: false, reason: "bad-token" };
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return { ok: false, reason: "bad-token" };
  const ts = token.slice(0, dot);
  const givenSig = token.slice(dot + 1);
  if (!/^\d{10,16}$/.test(ts) || !givenSig) return { ok: false, reason: "bad-token" };
  const expected = Buffer.from(sign(ts, secret));
  const given = Buffer.from(givenSig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { ok: false, reason: "bad-token" };
  }

  const age = now - parseInt(ts, 10);
  if (age > MAX_AGE_MS) return { ok: false, reason: "bad-token" };
  if (age < MIN_AGE_MS) return { ok: false, reason: "too-fast" };
  return { ok: true };
}

/** Copy the routes show for each rejection (honeypot never gets copy). */
export const FORM_GUARD_MESSAGES = {
  "too-fast": "That was quick! Give it a second and press the button again.",
  "bad-token": "This page has been open for a while — refresh it and try again.",
} as const;
