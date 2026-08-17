/**
 * /api/admin/checkin/qr — Bhajan Clubbing email blasts (admin only)
 *
 * Three kinds of send, all batched the same way and all deduped by a
 * per-registration timestamp so re-running never double-emails anyone:
 *
 *  mode omitted   QR door ticket → rows never sent one (qrSentAt null)
 *  mode "reminder" pre-event reminder w/ QR → rows not yet reminded
 *                  (lastReminderAt null — the clubbing program sits
 *                  outside both daily-cron passes, so the stamp is ours)
 *  mode "thanks"  post-event thank-you + feedback form → rows not yet
 *                  thanked (thanksSentAt null)
 *
 * POST { id, mode? }     — (re)send one registration, stamped
 * POST { mode? }         — batch: up to BATCH_SIZE per call, returns
 *                          { sent, failed, remaining }; the admin UI
 *                          keeps calling while remaining > 0, so each
 *                          request stays under serverless time limits
 * POST { mode, testTo }  — preview: ONE email to that address, styled
 *                          on the newest confirmed registration.
 *                          Nothing is stamped; the real blast is
 *                          unaffected.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  sendTicketQrEmail,
  sendClubbingReminderEmail,
  sendClubbingThanksEmail,
  emailConfigured,
  type SendOutcome,
} from "@/lib/email";
import { ticketsConfigured } from "@/lib/ticket";
import { EVENT } from "@/data/bhajanClubbing";

export const dynamic = "force-dynamic";

const BATCH_SIZE = 25;

type Mode = "ticket" | "reminder" | "thanks";

interface Recipient {
  id: string;
  name: string;
  email: string;
  guests: number;
}

const MODES: Record<
  Mode,
  {
    /** Sends one email of this kind. */
    send: (r: Recipient) => Promise<SendOutcome>;
    /** Rows still waiting for this kind of email. */
    pending: Record<string, unknown>;
    /** Stamp written on success (reminders also count as the QR send). */
    stamp: (r: Recipient & { qrSentAt: Date | null }) => Record<string, Date>;
    /** Whether the email carries the door QR (needs the signing secret). */
    needsQr: boolean;
    label: string;
  }
> = {
  ticket: {
    send: (r) => sendTicketQrEmail({ to: r.email, name: r.name, guests: r.guests, rsvpId: r.id }),
    pending: { qrSentAt: null },
    stamp: () => ({ qrSentAt: new Date() }),
    needsQr: true,
    label: "QR ticket",
  },
  reminder: {
    send: (r) => sendClubbingReminderEmail({ to: r.email, name: r.name, guests: r.guests, rsvpId: r.id }),
    pending: { lastReminderAt: null },
    stamp: (r) => ({ lastReminderAt: new Date(), qrSentAt: r.qrSentAt ?? new Date() }),
    needsQr: true,
    label: "Reminder",
  },
  thanks: {
    send: (r) => sendClubbingThanksEmail({ to: r.email, name: r.name }),
    pending: { thanksSentAt: null },
    stamp: () => ({ thanksSentAt: new Date() }),
    needsQr: false,
    label: "Thank-you",
  },
};

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!emailConfigured()) {
    return NextResponse.json({ error: "Email isn't configured (SMTP_* env vars)" }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => ({}) as { id?: unknown; mode?: unknown; testTo?: unknown });
    const { id, mode: rawMode, testTo } = body as { id?: unknown; mode?: unknown; testTo?: unknown };
    const mode: Mode = rawMode === "reminder" ? "reminder" : rawMode === "thanks" ? "thanks" : "ticket";
    const kind = MODES[mode];

    if (kind.needsQr && !ticketsConfigured()) {
      return NextResponse.json(
        { error: "QR tickets need a signing secret — set TICKET_QR_SECRET (or AUTH_SECRET)" },
        { status: 503 },
      );
    }

    // Test preview — one email to the given address, styled on the newest
    // confirmed registration so the name/guests/QR are realistic.
    if (typeof testTo === "string" && testTo.trim()) {
      const to = testTo.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return NextResponse.json({ error: "That doesn't look like a valid email address" }, { status: 400 });
      }
      const sample = await prisma.rsvp.findFirst({
        where: { programId: EVENT.programId, status: "confirmed" },
        orderBy: { createdAt: "desc" },
      });
      if (!sample) {
        return NextResponse.json({ error: "No confirmed registrations to preview with yet" }, { status: 404 });
      }
      const sent = await kind.send({ id: sample.id, name: sample.name, email: to, guests: sample.guests });
      if (!sent.ok) return NextResponse.json({ error: sent.error ?? "Send failed" }, { status: 502 });
      return NextResponse.json({ sent: 1, failed: 0, remaining: 0, to, test: true, sampleName: sample.name });
    }

    // Single (re)send — used from a registration row
    if (typeof id === "string" && id) {
      const rsvp = await prisma.rsvp.findFirst({
        where: { id, programId: EVENT.programId, status: "confirmed" },
      });
      if (!rsvp) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      const sent = await kind.send(rsvp);
      if (!sent.ok) return NextResponse.json({ error: sent.error ?? "Send failed" }, { status: 502 });
      await prisma.rsvp.update({ where: { id: rsvp.id }, data: kind.stamp(rsvp) });
      return NextResponse.json({ sent: 1, failed: 0, remaining: 0, to: rsvp.email });
    }

    // Batch over everyone confirmed who's still pending this kind of email
    const pending = { programId: EVENT.programId, status: "confirmed", ...kind.pending };
    const batch = await prisma.rsvp.findMany({
      where: pending,
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
    });

    let sent = 0;
    let failed = 0;
    for (const rsvp of batch) {
      const outcome = await kind.send(rsvp);
      if (outcome.ok) {
        sent += 1;
        await prisma.rsvp.update({ where: { id: rsvp.id }, data: kind.stamp(rsvp) });
      } else {
        // Left unstamped so a later run retries it
        failed += 1;
        console.error(`${kind.label} email to ${rsvp.email} failed:`, outcome.error);
      }
    }

    // Unsent rows still on the books (includes this batch's failures) —
    // the client keeps calling while remaining > 0 AND progress was made,
    // so a dead SMTP config can't loop forever.
    const remaining = await prisma.rsvp.count({ where: pending });
    return NextResponse.json({ sent, failed, remaining });
  } catch (error) {
    console.error("Email batch send failed:", error);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
