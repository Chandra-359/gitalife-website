import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { programId, name, email, phone } = body;

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

    // Verify program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 },
      );
    }

    // Create RSVP
    const rsvp = await prisma.rsvp.create({
      data: {
        name,
        email,
        phone: phone || null,
        programId,
      },
    });

    return NextResponse.json(
      { id: rsvp.id, message: "RSVP confirmed" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process RSVP" },
      { status: 500 },
    );
  }
}
