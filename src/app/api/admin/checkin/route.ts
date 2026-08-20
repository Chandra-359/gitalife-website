/**
 * /api/admin/checkin — door check-in (admin only)
 *
 * Serves Bhajan Clubbing AND every dated event on /festival (MYF
 * editions, big festivals) from one board.
 *
 * GET    — ?event=<programId> selects the event (default: the most
 *          door-relevant one — soonest upcoming, else latest past).
 *          Returns the pickable event list, the selected event's
 *          registrations with parsed tier/paid info, and live stats.
 * POST   — { token } QR scan: verify the signed ticket and check the
 *          party in. Works across events — the response says which
 *          event the ticket belongs to.
 * PATCH  — { id, checkedIn, programId? } toggles a party's checkedInAt
 * DELETE — { id, programId? } permanently removes a registration
 *          (programId defaults to Bhajan Clubbing on both)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyTicketToken } from "@/lib/ticket";
import { removeFestivalSheetRows } from "@/lib/sheets";
import { EVENT } from "@/data/bhajanClubbing";
import { ET_TZ } from "@/lib/weeklyPrograms";

export const dynamic = "force-dynamic";

/** Notes are stamped like "[General Admission · PAID] …". */
function parseNotes(notes: string | null): { tier: string | null; paid: boolean; rest: string | null } {
  if (!notes) return { tier: null, paid: false, rest: null };
  const match = notes.match(/^\[([^\]]*)\]\s*([\s\S]*)$/);
  if (!match) return { tier: null, paid: false, rest: notes };
  const inside = match[1];
  const paid = /(^|\s|·)\s*PAID$/.test(inside) || inside === "PAID";
  const tier = inside === "PAID" ? null : inside.replace(/\s*·\s*PAID$/, "");
  return { tier, paid, rest: match[2] || null };
}

interface CheckableEvent {
  id: string;
  title: string;
  dateLabel: string;
  startAt: Date;
  capacity: number | null;
  kind: "clubbing" | "festival";
}

function dateLabel(at: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    weekday: "short", month: "short", day: "numeric",
  }).format(at);
}

/**
 * Events the door board can work: Bhajan Clubbing (a fixed Program row
 * without eventStartAt) plus every dated /festival event. Ordered by
 * door relevance — upcoming soonest-first, then past latest-first — so
 * the default selection is whatever is happening next.
 */
async function checkableEvents(): Promise<CheckableEvent[]> {
  const clubbing: CheckableEvent = {
    id: EVENT.programId,
    title: `${EVENT.title} — ${EVENT.volume}`,
    dateLabel: dateLabel(new Date(EVENT.startIso)),
    startAt: new Date(EVENT.startIso),
    capacity: EVENT.capacity,
    kind: "clubbing",
  };
  const dated = await prisma!.program.findMany({
    where: { eventStartAt: { not: null }, id: { not: EVENT.programId } },
    orderBy: { eventStartAt: "desc" },
    take: 12,
    select: { id: true, title: true, eventStartAt: true, capacity: true },
  });
  const events: CheckableEvent[] = [
    clubbing,
    ...dated.map((e) => ({
      id: e.id,
      title: e.title,
      dateLabel: dateLabel(e.eventStartAt as Date),
      startAt: e.eventStartAt as Date,
      capacity: e.capacity,
      kind: "festival" as const,
    })),
  ];
  // Events stay "upcoming" at the door until 6h after start
  const horizon = Date.now() - 6 * 3600_000;
  const upcoming = events
    .filter((e) => e.startAt.getTime() >= horizon)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const past = events
    .filter((e) => e.startAt.getTime() < horizon)
    .sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
  return [...upcoming, ...past];
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const events = await checkableEvents();
    const requested = request.nextUrl.searchParams.get("event");
    const selected = events.find((e) => e.id === requested) ?? events[0];

    const rsvps = await prisma.rsvp.findMany({
      where: { programId: selected.id, status: "confirmed" },
      orderBy: { name: "asc" },
    });

    const registrations = rsvps.map((r) => {
      const { tier, paid, rest } = parseNotes(r.notes);
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        guests: r.guests,
        tier,
        paid,
        notes: rest,
        checkedInAt: r.checkedInAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      };
    });

    const totalGuests = registrations.reduce((sum, r) => sum + r.guests, 0);
    const checkedInGuests = registrations.filter((r) => r.checkedInAt).reduce((sum, r) => sum + r.guests, 0);

    return NextResponse.json({
      event: {
        id: selected.id,
        title: selected.title,
        capacity: selected.capacity,
        kind: selected.kind,
      },
      events: events.map((e) => ({ id: e.id, title: e.title, dateLabel: e.dateLabel })),
      stats: {
        parties: registrations.length,
        partiesIn: registrations.filter((r) => r.checkedInAt).length,
        guests: totalGuests,
        guestsIn: checkedInGuests,
        vipPaid: registrations.filter((r) => r.paid).length,
      },
      registrations,
    });
  } catch (error) {
    console.error("Failed to fetch check-in list:", error);
    return NextResponse.json({ error: "Failed to fetch check-in list" }, { status: 500 });
  }
}

/**
 * QR scan → check-in. Returns a `result` the scanner renders big:
 *   "ok"      — party newly checked in
 *   "already" — valid ticket, but the party is already in (screenshot
 *               sharing / double scan — send the second presenter to a
 *               volunteer)
 *   "invalid" — signature check failed or no such registration
 * The eventTitle in the response lets the door volunteer catch a ticket
 * from a different event than the one on their board.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { token } = await request.json();
    const rsvpId = verifyTicketToken(token);
    if (!rsvpId) return NextResponse.json({ result: "invalid" });

    const rsvp = await prisma.rsvp.findFirst({
      where: { id: rsvpId, status: "confirmed" },
      include: { program: { select: { id: true, title: true } } },
    });
    if (!rsvp) return NextResponse.json({ result: "invalid" });

    const eventTitle =
      rsvp.programId === EVENT.programId ? `${EVENT.title} — ${EVENT.volume}` : rsvp.program.title;

    const { tier, paid } = parseNotes(rsvp.notes);
    if (rsvp.checkedInAt) {
      return NextResponse.json({
        result: "already",
        id: rsvp.id,
        name: rsvp.name,
        guests: rsvp.guests,
        eventTitle,
        checkedInAt: rsvp.checkedInAt.toISOString(),
      });
    }

    const updated = await prisma.rsvp.update({
      where: { id: rsvp.id },
      data: { checkedInAt: new Date() },
    });
    return NextResponse.json({
      result: "ok",
      id: updated.id,
      name: updated.name,
      guests: updated.guests,
      tier,
      paid,
      eventTitle,
      checkedInAt: updated.checkedInAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("QR scan check-in failed:", error);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { id, checkedIn, programId } = await request.json();
    if (typeof id !== "string" || !id || typeof checkedIn !== "boolean") {
      return NextResponse.json({ error: "id and checkedIn are required" }, { status: 400 });
    }

    const rsvp = await prisma.rsvp.update({
      // Scoped to the board's event so the endpoint can't touch other RSVPs
      where: { id, programId: typeof programId === "string" && programId ? programId : EVENT.programId },
      data: { checkedInAt: checkedIn ? new Date() : null },
    });

    return NextResponse.json({
      id: rsvp.id,
      checkedInAt: rsvp.checkedInAt?.toISOString() ?? null,
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    console.error("Check-in toggle failed:", error);
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { id, programId } = await request.json();
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Scoped to the board's event so the endpoint can't touch other RSVPs
    const removed = await prisma.rsvp.delete({
      where: { id, programId: typeof programId === "string" && programId ? programId : EVENT.programId },
      include: { program: { select: { title: true, eventStartAt: true } } },
    });

    // Keep the registrations sheet in step — dated events only (the
    // clubbing sheet predates per-event tabs). Best-effort.
    if (removed.program.eventStartAt) {
      await removeFestivalSheetRows(removed.programId, removed.program.title, [removed.email]);
    }

    return NextResponse.json({ deleted: id });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    console.error("Registration delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
