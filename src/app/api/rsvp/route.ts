import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { programId, name, email, phone, guests, notes } = body;

    // Validate required fields
    if (!programId || !name || !email) {
      return NextResponse.json(
        { error: "programId, name, and email are required" },
        { status: 400 },
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 },
      );
    }

    // Verify program exists and is published
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        _count: {
          select: { rsvps: { where: { status: "confirmed" } } },
        },
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 },
      );
    }

    // Check RSVP deadline
    if (program.rsvpDeadline && new Date() > program.rsvpDeadline) {
      return NextResponse.json(
        { error: "RSVP deadline has passed" },
        { status: 400 },
      );
    }

    // Check capacity
    const guestCount = Math.max(1, parseInt(guests) || 1);
    if (program.capacity) {
      const spotsUsed = program._count.rsvps;
      if (spotsUsed + guestCount > program.capacity) {
        const remaining = program.capacity - spotsUsed;
        return NextResponse.json(
          { error: remaining > 0 ? `Only ${remaining} spots left` : "This event is full" },
          { status: 400 },
        );
      }
    }

    // Create RSVP (unique constraint on [email, programId] prevents duplicates)
    const rsvp = await prisma.rsvp.create({
      data: {
        name,
        email,
        phone: phone || null,
        guests: guestCount,
        notes: notes || null,
        programId,
      },
    });

    return NextResponse.json(
      { id: rsvp.id, message: "RSVP confirmed" },
      { status: 201 },
    );
  } catch (error) {
    // Handle duplicate RSVP (Prisma unique constraint violation)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You've already RSVP'd for this event" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to process RSVP" },
      { status: 500 },
    );
  }
}
