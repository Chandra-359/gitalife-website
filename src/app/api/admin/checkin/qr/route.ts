/**
 * /api/admin/checkin/qr — email QR door tickets (admin only)
 *
 * POST { id }  — (re)send the ticket email to one registration
 * POST {}      — batch: send to confirmed registrations that haven't
 *                received one yet (qrSentAt null), up to BATCH_SIZE per
 *                call. Returns { sent, failed, remaining } — the admin UI
 *                keeps calling while remaining > 0, so each request stays
 *                well under serverless time limits.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendTicketQrEmail, emailConfigured } from "@/lib/email";
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
    const { id } = await request.json().catch(() => ({}) as { id?: unknown });

    // Single (re)send — used from a registration row
    if (typeof id === "string" && id) {
      const rsvp = await prisma.rsvp.findFirst({
        where: { id, programId: EVENT.programId, status: "confirmed" },
      });
      if (!rsvp) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      const sent = await sendTicketQrEmail({ to: rsvp.email, name: rsvp.name, guests: rsvp.guests, rsvpId: rsvp.id });
      if (!sent.ok) return NextResponse.json({ error: sent.error ?? "Send failed" }, { status: 502 });
      await prisma.rsvp.update({ where: { id: rsvp.id }, data: { qrSentAt: new Date() } });
      return NextResponse.json({ sent: 1, failed: 0, remaining: 0, to: rsvp.email });
    }

    // Batch — everyone confirmed who hasn't been sent a QR yet
    const batch = await prisma.rsvp.findMany({
      where: { programId: EVENT.programId, status: "confirmed", qrSentAt: null },
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
    });

    let sent = 0;
    let failed = 0;
    for (const rsvp of batch) {
      const outcome = await sendTicketQrEmail({ to: rsvp.email, name: rsvp.name, guests: rsvp.guests, rsvpId: rsvp.id });
      if (outcome.ok) {
        sent += 1;
        await prisma.rsvp.update({ where: { id: rsvp.id }, data: { qrSentAt: new Date() } });
      } else {
        // Left unstamped so a later run retries it
        failed += 1;
        console.error(`QR ticket email to ${rsvp.email} failed:`, outcome.error);
      }
    }

    // Unsent rows still on the books (includes this batch's failures) —
    // the client keeps calling while remaining > 0 AND progress was made,
    // so a dead SMTP config can't loop forever.
    const remaining = await prisma.rsvp.count({
      where: { programId: EVENT.programId, status: "confirmed", qrSentAt: null },
    });
    return NextResponse.json({ sent, failed, remaining });
  } catch (error) {
    console.error("QR ticket batch send failed:", error);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
