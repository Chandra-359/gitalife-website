/**
 * ticket.ts — signed QR ticket tokens for door check-in.
 *
 * A ticket token is `<rsvpId>.<signature>` where the signature is an
 * HMAC-SHA256 of the RSVP id under a server secret, so tickets can't be
 * forged or enumerated. The QR itself carries no personal data — just
 * the token wrapped in a check-in URL, so scanning it with a normal
 * camera app lands an admin on the check-in page (and lands a guest on
 * the admin login screen).
 *
 * Secret resolution: TICKET_QR_SECRET, falling back to the NextAuth
 * secret that production already requires. Without any secret the QR
 * feature quietly disables (emails go out without a QR, scans fail).
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { EVENT } from "@/data/bhajanClubbing";

function ticketSecret(): string | null {
  return (
    process.env.TICKET_QR_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    null
  );
}

export function ticketsConfigured(): boolean {
  return !!ticketSecret();
}

function sign(rsvpId: string, secret: string): string {
  return createHmac("sha256", secret).update(rsvpId).digest("base64url");
}

/** `<rsvpId>.<signature>`, or null when no secret is configured. */
export function ticketToken(rsvpId: string): string | null {
  const secret = ticketSecret();
  if (!secret || !rsvpId) return null;
  return `${rsvpId}.${sign(rsvpId, secret)}`;
}

/** The RSVP id from a valid token, or null for anything forged/mangled. */
export function verifyTicketToken(token: unknown): string | null {
  const secret = ticketSecret();
  if (!secret || typeof token !== "string") return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const rsvpId = token.slice(0, dot);
  const givenSig = token.slice(dot + 1);
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(rsvpId) || !givenSig) return null;
  const expected = Buffer.from(sign(rsvpId, secret));
  const given = Buffer.from(givenSig);
  if (expected.length !== given.length) return null;
  return timingSafeEqual(expected, given) ? rsvpId : null;
}

/**
 * The URL encoded into the QR — opens the admin check-in page with the
 * token, which auto-processes it after login. Kept short so the QR stays
 * coarse and scans fast from a phone screen.
 */
export function ticketScanUrl(rsvpId: string): string | null {
  const token = ticketToken(rsvpId);
  if (!token) return null;
  return `${new URL(EVENT.url).origin}/admin/checkin?scan=${encodeURIComponent(token)}`;
}
