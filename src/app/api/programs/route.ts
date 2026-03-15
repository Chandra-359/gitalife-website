/**
 * /api/programs
 *
 * GET  — Returns all programs (public, no auth required)
 * POST — Creates a new program (requires admin authentication)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET — fetch all programs                                           */
/* ------------------------------------------------------------------ */
export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  try {
    const programs = await prisma.program.findMany({
      orderBy: { date: "asc" },
    });

    const serialized = programs.map((p) => ({
      ...p,
      date: p.date.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Failed to fetch programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST — create a new program (admin only)                           */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    const { title, category, description, date, latitude, longitude, imageUrl } = body;

    if (!title || !category || !description || !date || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, description, date, latitude, longitude" },
        { status: 400 },
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return NextResponse.json({ error: "Invalid latitude" }, { status: 400 });
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "Invalid longitude" }, { status: 400 });
    }

    const program = await prisma.program.create({
      data: {
        title: String(title),
        category: String(category),
        description: String(description),
        date: new Date(date),
        latitude: lat,
        longitude: lng,
        imageUrl: imageUrl ? String(imageUrl) : null,
      },
    });

    return NextResponse.json(
      { ...program, date: program.date.toISOString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create program:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 },
    );
  }
}
