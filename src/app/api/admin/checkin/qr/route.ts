/**
 * /api/admin/checkin/qr — check-in board email blasts (admin only)
 *
 * Works for Bhajan Clubbing AND any dated /festival event (pass
 * `programId`; omitted = Bhajan Clubbing). Three kinds of send, all
 * batched the same way and all deduped by a per-registration timestamp
 * so re-running never double-emails anyone:
 *
 *  mode omitted   QR door ticket → rows never sent one (qrSentAt null).
 *                  Festival events re-send the confirmation, which
 *                  carries the QR entry pass.
 *  mode "reminder" pre-event reminder w/ QR → rows not yet reminded
 *                  (lastReminderAt null — also honored by the daily
 *                  cron, so a manual blast and the cron never double up)
 *  mode "thanks"  post-event thank-you + feedback form → rows not yet
 *                  thanked (thanksSentAt null). Clubbing only — the
 *                  copy is specific to that night.
 *
 * POST { id, mode?, programId? }     — (re)send one registration, stamped
 * POST { mode?, programId? }         — batch: up to BATCH_SIZE per call,
 *                          returns { sent, failed, remaining }; the
 *                          admin UI keeps calling while remaining > 0,
 *                          so each request stays under serverless limits
 * POST { mode, testTo, programId? }  — preview: ONE email to that
 *                          address, styled on the newest confirmed
 *                          registration. Nothing is stamped; the real
 *                          blast is unaffected.
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
import { sendFestivalConfirmation, sendFestivalReminder } from "@/lib/festivalEmail";
import { getFestivalEventById, type FestivalEventLive } from "@/lib/festivals";
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

interface ModeDef {
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

const MODES: Record<Mode, ModeDef> = {
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

/** Festival-styled senders — same pending filters and stamps, different
 *  emails. "ticket" re-sends the confirmation (it carries the QR pass). */
function festivalMode(mode: Mode, event: FestivalEventLive): ModeDef | null {
  if (mode === "thanks") return null;
  return {
    ...MODES[mode],
    send: (r) =>
      mode === "reminder"
        ? sendFestivalReminder({ to: r.email, name: r.name, rsvpId: r.id, event, guests: r.guests })
        : sendFestivalConfirmation({
            to: r.email,
            name: r.name,
            rsvpId: r.id,
            guests: r.guests,
            event,
            alreadyRegistered: true,
          }),
  };
}

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
    const body = await request
      .json()
      .catch(() => ({}) as { id?: unknown; mode?: unknown; testTo?: unknown; programId?: unknown });
    const { id, mode: rawMode, testTo, programId: rawProgramId } = body as {
      id?: unknown; mode?: unknown; testTo?: unknown; programId?: unknown;
    };
    const mode: Mode = rawMode === "reminder" ? "reminder" : rawMode === "thanks" ? "thanks" : "ticket";
    const programId =
      typeof rawProgramId === "string" && rawProgramId ? rawProgramId : EVENT.programId;

    let kind: ModeDef | null = MODES[mode];
    if (programId !== EVENT.programId) {
      const event = await getFestivalEventById(programId);
      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      kind = festivalMode(mode, event);
      if (!kind) {
        return NextResponse.json(
          { error: "The thank-you blast is only set up for Bhajan Clubbing right now" },
          { status: 400 },
        );
      }
    }

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
        where: { programId, status: "confirmed" },
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
        where: { id, programId, status: "confirmed" },
      });
      if (!rsvp) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      const sent = await kind.send(rsvp);
      if (!sent.ok) return NextResponse.json({ error: sent.error ?? "Send failed" }, { status: 502 });
      await prisma.rsvp.update({ where: { id: rsvp.id }, data: kind.stamp(rsvp) });
      return NextResponse.json({ sent: 1, failed: 0, remaining: 0, to: rsvp.email });
    }

    // Batch over everyone confirmed who's still pending this kind of email
    const pending = { programId, status: "confirmed", ...kind.pending };
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
