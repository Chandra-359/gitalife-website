/**
 * /api/admin/checkin/qr — email QR door tickets (admin only)
 *
 * POST { id }  — (re)send the ticket email to one registration
 * POST {}      — batch: send to confirmed registrations that haven't
 *                received one yet (qrSentAt null), up to BATCH_SIZE per
 *                call. Returns { sent, failed, remaining } — the admin UI
 *                keeps calling while remaining > 0, so each request stays
 *                well under serverless time limits.
 * POST { mode: "reminder" }
 *              — batch: send the event reminder (with the door QR
 *                attached) to EVERY confirmed registration, whether or
 *                not it already got a ticket email. Deduped via
 *                lastReminderAt, so pressing the button again only
 *                reaches people registered since the last blast (the
 *                clubbing program is outside both daily-cron passes, so
 *                the stamp is ours to use). Same { sent, failed,
 *                remaining } batching contract as the ticket send.
 * POST { mode: "reminder", testTo: "someone@example.com" }
 *              — preview: send ONE reminder to that address, using the
 *                newest confirmed registration's details for realism.
 *                Nothing is stamped, so the real blast is unaffected.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendTicketQrEmail, sendClubbingReminderEmail, emailConfigured } from "@/lib/email";
import { ticketsConfigured } from "@/lib/ticket";
import { EVENT } from "@/data/bhajanClubbing";

export const dynamic = "force-dynamic";

const BATCH_SIZE = 25;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!ticketsConfigured()) {
    return NextResponse.json(
      { error: "QR tickets need a signing secret — set TICKET_QR_SECRET (or AUTH_SECRET)" },
      { status: 503 },
    );
  }
  if (!emailConfigured()) {
    return NextResponse.json({ error: "Email isn't configured (SMTP_* env vars)" }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => ({}) as { id?: unknown; mode?: unknown; testTo?: unknown });
    const { id, mode, testTo } = body as { id?: unknown; mode?: unknown; testTo?: unknown };
    const isReminder = mode === "reminder";

    // Test preview — one reminder to the given address, styled on the
    // newest confirmed registration so the QR/name/guests are realistic.
    // No stamps are written; the real blast still reaches everyone.
    if (isReminder && typeof testTo === "string" && testTo.trim()) {
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
      const sent = await sendClubbingReminderEmail({
        to,
        name: sample.name,
        guests: sample.guests,
        rsvpId: sample.id,
      });
      if (!sent.ok) return NextResponse.json({ error: sent.error ?? "Send failed" }, { status: 502 });
      return NextResponse.json({ sent: 1, failed: 0, remaining: 0, to, test: true, sampleName: sample.name });
    }

    // Single (re)send — used from a registration row
    if (typeof id === "string" && id) {
      const rsvp = await prisma.rsvp.findFirst({
        where: { id, programId: EVENT.programId, status: "confirmed" },
      });
      if (!rsvp) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      const send = isReminder ? sendClubbingReminderEmail : sendTicketQrEmail;
      const sent = await send({ to: rsvp.email, name: rsvp.name, guests: rsvp.guests, rsvpId: rsvp.id });
      if (!sent.ok) return NextResponse.json({ error: sent.error ?? "Send failed" }, { status: 502 });
      await prisma.rsvp.update({
        where: { id: rsvp.id },
        data: isReminder ? { lastReminderAt: new Date() } : { qrSentAt: new Date() },
      });
      return NextResponse.json({ sent: 1, failed: 0, remaining: 0, to: rsvp.email });
    }

    // Batch. Ticket mode targets rows never sent a QR (qrSentAt null);
    // reminder mode targets rows not yet reminded (lastReminderAt null) —
    // i.e. everyone confirmed, ticket email or not.
    const pending = isReminder
      ? { programId: EVENT.programId, status: "confirmed", lastReminderAt: null }
      : { programId: EVENT.programId, status: "confirmed", qrSentAt: null };
    const batch = await prisma.rsvp.findMany({
      where: pending,
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
    });

    let sent = 0;
    let failed = 0;
    for (const rsvp of batch) {
      const send = isReminder ? sendClubbingReminderEmail : sendTicketQrEmail;
      const outcome = await send({ to: rsvp.email, name: rsvp.name, guests: rsvp.guests, rsvpId: rsvp.id });
      if (outcome.ok) {
        sent += 1;
        await prisma.rsvp.update({
          where: { id: rsvp.id },
          // A reminder carries the QR too, so it also counts as the
          // ticket email — stamp both and the ticket batch skips it.
          data: isReminder ? { lastReminderAt: new Date(), qrSentAt: rsvp.qrSentAt ?? new Date() } : { qrSentAt: new Date() },
        });
      } else {
        // Left unstamped so a later run retries it
        failed += 1;
        console.error(`${isReminder ? "Reminder" : "QR ticket"} email to ${rsvp.email} failed:`, outcome.error);
      }
    }

    // Unsent rows still on the books (includes this batch's failures) —
    // the client keeps calling while remaining > 0 AND progress was made,
    // so a dead SMTP config can't loop forever.
    const remaining = await prisma.rsvp.count({ where: pending });
    return NextResponse.json({ sent, failed, remaining });
  } catch (error) {
    console.error("QR ticket batch send failed:", error);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
