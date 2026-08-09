/**
 * /api/admin/checkin — door check-in for Bhajan Clubbing (admin only)
 *
 * GET    — event registrations with parsed tier/paid info + live stats
 * POST   — { token } QR scan: verify the signed ticket, check the party in
 * PATCH  — { id, checkedIn } toggles a party's checkedInAt timestamp
 * DELETE — { id } permanently removes a registration (test rows, dupes)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyTicketToken } from "@/lib/ticket";
import { EVENT } from "@/data/bhajanClubbing";

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

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const rsvps = await prisma.rsvp.findMany({
      where: { programId: EVENT.programId, status: "confirmed" },
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
      event: { title: `${EVENT.title} — ${EVENT.volume}`, capacity: EVENT.capacity },
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
      where: { id: rsvpId, programId: EVENT.programId, status: "confirmed" },
    });
    if (!rsvp) return NextResponse.json({ result: "invalid" });

    const { tier, paid } = parseNotes(rsvp.notes);
    if (rsvp.checkedInAt) {
      return NextResponse.json({
        result: "already",
        id: rsvp.id,
        name: rsvp.name,
        guests: rsvp.guests,
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
    const { id, checkedIn } = await request.json();
    if (typeof id !== "string" || !id || typeof checkedIn !== "boolean") {
      return NextResponse.json({ error: "id and checkedIn are required" }, { status: 400 });
    }

    const rsvp = await prisma.rsvp.update({
      where: { id, programId: EVENT.programId },
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
    const { id } = await request.json();
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Scoped to this event's program so the endpoint can't touch other RSVPs
    await prisma.rsvp.delete({ where: { id, programId: EVENT.programId } });

    return NextResponse.json({ deleted: id });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    console.error("Registration delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
