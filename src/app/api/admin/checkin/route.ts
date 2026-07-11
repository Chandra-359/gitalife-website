/**
 * /api/admin/checkin — door check-in for Bhajan Clubbing (admin only)
 *
 * GET   — event registrations with parsed tier/paid info + live stats
 * PATCH — { id, checkedIn } toggles a party's checkedInAt timestamp
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { EVENT } from "@/data/bajanClubbing";

export const dynamic = "force-dynamic";

/** Notes are stamped like "[Front Row Bhakti]" or "[VIP Seva Pass · PAID] …". */
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
