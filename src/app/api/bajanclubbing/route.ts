import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EVENT } from "@/data/bajanClubbing";

/**
 * Bhajan Clubbing registration API.
 *
 * Reuses the existing Program/Rsvp models: the event lives as a Program row
 * with the fixed id EVENT.programId (upserted on demand), so registrations
 * show up in the admin dashboard alongside every other RSVP.
 */

/** Ensure the event's Program row exists and is current with the data file. */
async function ensureEventProgram() {
  const data = {
    title: `${EVENT.title} — ${EVENT.volume}`,
    category: "Kirtan & Prasadam",
    description: EVENT.description,
    subtitle: EVENT.tagline,
    latitude: 40.6881,
    longitude: -73.9834,
    dayOfWeek: "Saturday",
    time: EVENT.timeLabel,
    venueName: EVENT.venue.name,
    address: EVENT.venue.address,
    duration: "4 hours",
    level: "All levels",
    capacity: EVENT.capacity,
    status: "published",
    featured: true,
  };
  return prisma!.program.upsert({
    where: { id: EVENT.programId },
    update: data,
    create: { id: EVENT.programId, ...data },
  });
}

/** GET — remaining passes, for the live "spots left" meter on the page. */
export async function GET() {
  try {
    if (!prisma?.rsvp) {
      return NextResponse.json({ capacity: EVENT.capacity, confirmed: null });
    }
    const confirmed = await prisma.rsvp.aggregate({
      where: { programId: EVENT.programId, status: "confirmed" },
      _sum: { guests: true },
    });
    return NextResponse.json({
      capacity: EVENT.capacity,
      confirmed: confirmed._sum.guests ?? 0,
    });
  } catch {
    return NextResponse.json({ capacity: EVENT.capacity, confirmed: null });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, guests, notes } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    if (!prisma?.rsvp) {
      return NextResponse.json(
        { error: "Registration is briefly offline — DM us on Instagram and we'll save your spot" },
        { status: 503 },
      );
    }

    await ensureEventProgram();

    const guestCount = Math.min(5, Math.max(1, parseInt(guests) || 1));
    const confirmed = await prisma.rsvp.aggregate({
      where: { programId: EVENT.programId, status: "confirmed" },
      _sum: { guests: true },
    });
    const taken = confirmed._sum.guests ?? 0;
    if (taken + guestCount > EVENT.capacity) {
      const remaining = EVENT.capacity - taken;
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Only ${remaining} pass${remaining === 1 ? "" : "es"} left`
              : "Passes are sold out — join the door line at 6:45 PM",
        },
        { status: 400 },
      );
    }

    const rsvp = await prisma.rsvp.create({
      data: {
        name,
        email,
        phone: phone || null,
        guests: guestCount,
        notes: notes || null,
        programId: EVENT.programId,
      },
    });

    return NextResponse.json(
      { id: rsvp.id, message: "Pass confirmed" },
      { status: 201 },
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You're already on the list — see you on the floor!" },
        { status: 409 },
      );
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error("Bhajan Clubbing registration error:", message, error);
    return NextResponse.json(
      { error: "Something went wrong — please try again" },
      { status: 500 },
    );
  }
}
