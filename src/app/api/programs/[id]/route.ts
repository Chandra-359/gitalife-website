/**
 * /api/programs/[id]
 *
 * PUT    — Update a program (requires admin authentication)
 * DELETE — Delete a program (requires admin authentication)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  PUT — update a program                                             */
/* ------------------------------------------------------------------ */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, category, description, date, latitude, longitude, imageUrl, location, rsvpUrl } = body;

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

    const program = await prisma.program.update({
      where: { id },
      data: {
        title: String(title),
        category: String(category),
        description: String(description),
        location: location ? String(location) : null,
        date: new Date(date),
        latitude: lat,
        longitude: lng,
        imageUrl: imageUrl ? String(imageUrl) : null,
        rsvpUrl: rsvpUrl ? String(rsvpUrl) : null,
      },
    });

    return NextResponse.json({ ...program, date: program.date.toISOString() });
  } catch (error) {
    console.error("Failed to update program:", error);
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE — remove a program                                          */
/* ------------------------------------------------------------------ */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;

  try {
    await prisma.program.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete program:", error);
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
