import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { programId, name, email, phone, guests, notes } = body;

    // Validate required fields
    if (!programId || !name || !email) {
      console.error("RSVP 400: missing fields", { programId: !!programId, name: !!name, email: !!email });
      return NextResponse.json(
        { error: "programId, name, and email are required" },
        { status: 400 },
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error("RSVP 400: invalid email");
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // prisma is a Proxy (always truthy) — check a real property to detect
    // whether the underlying PrismaClient was created (i.e. DATABASE_URL is set).
    if (!prisma?.rsvp) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 },
      );
    }

    // Verify program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      console.error("RSVP 404: program not found", programId);
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 },
      );
    }

    // Check RSVP deadline
    if (program.rsvpDeadline) {
      const deadline = new Date(program.rsvpDeadline);
      const now = new Date();
      if (now > deadline) {
        console.error("RSVP 400: deadline passed", { deadline: deadline.toISOString(), now: now.toISOString() });
        return NextResponse.json(
          { error: `RSVP deadline has passed (was ${deadline.toLocaleDateString()})` },
          { status: 400 },
        );
      }
    }

    // Check capacity (separate query to avoid _count filter issues)
    const guestCount = Math.max(1, parseInt(guests) || 1);
    if (program.capacity) {
      const confirmedCount = await prisma.rsvp.count({
        where: { programId, status: "confirmed" },
      });
      if (confirmedCount + guestCount > program.capacity) {
        const remaining = program.capacity - confirmedCount;
        console.error("RSVP 400: capacity full", { capacity: program.capacity, confirmed: confirmedCount, requested: guestCount });
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

    const message =
      error instanceof Error ? error.message : String(error);
    console.error("RSVP error:", message, error);
    return NextResponse.json(
      { error: `Failed to process RSVP: ${message}` },
      { status: 500 },
    );
  }
}
