/**
 * /api/programs/[id]
 *
 * GET    — Fetch a single program by ID (public)
 * PUT    — Update a program (admin only)
 * DELETE — Delete a program (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET — fetch a single program                                       */
/* ------------------------------------------------------------------ */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        _count: {
          select: { rsvps: { where: { status: "confirmed" } } },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...program,
      rsvpCount: program._count.rsvps,
      _count: undefined,
    });
  } catch (error) {
    console.error("Failed to fetch program:", error);
    return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PUT — update a program (admin only)                                */
/* ------------------------------------------------------------------ */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();

    const existing = await prisma.program.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const {
      title, category, description, dayOfWeek, time, latitude, longitude,
      type, imageUrl, subtitle, address, venueName, duration, level,
      capacity, videoUrl, status, featured,
      whatToExpect, whyAttend, whatYouGet, whatToBring,
      lectureTopic, gitaReference,
      speakerName, speakerTitle, speakerBio, speakerImageUrl,
      galleryUrls, testimonial, testimonialAuthor,
    } = body;

    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = String(title);
    if (category !== undefined) data.category = String(category);
    if (description !== undefined) data.description = String(description);
    if (dayOfWeek !== undefined) data.dayOfWeek = String(dayOfWeek);
    if (time !== undefined) data.time = time || null;
    if (latitude !== undefined) data.latitude = parseFloat(latitude);
    if (longitude !== undefined) data.longitude = parseFloat(longitude);
    if (type !== undefined) data.type = String(type);
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (subtitle !== undefined) data.subtitle = subtitle || null;
    if (address !== undefined) data.address = address || null;
    if (venueName !== undefined) data.venueName = venueName || null;
    if (duration !== undefined) data.duration = duration || null;
    if (level !== undefined) data.level = level || null;
    if (capacity !== undefined) data.capacity = capacity != null ? parseInt(capacity) : null;
    if (videoUrl !== undefined) data.videoUrl = videoUrl || null;
    if (status !== undefined) data.status = String(status);
    if (featured !== undefined) data.featured = featured === true;
    if (whatToExpect !== undefined) data.whatToExpect = Array.isArray(whatToExpect) ? whatToExpect : [];
    if (whyAttend !== undefined) data.whyAttend = whyAttend || null;
    if (whatYouGet !== undefined) data.whatYouGet = Array.isArray(whatYouGet) ? whatYouGet : [];
    if (whatToBring !== undefined) data.whatToBring = whatToBring || null;
    if (lectureTopic !== undefined) data.lectureTopic = lectureTopic || null;
    if (gitaReference !== undefined) data.gitaReference = gitaReference || null;
    if (speakerName !== undefined) data.speakerName = speakerName || null;
    if (speakerTitle !== undefined) data.speakerTitle = speakerTitle || null;
    if (speakerBio !== undefined) data.speakerBio = speakerBio || null;
    if (speakerImageUrl !== undefined) data.speakerImageUrl = speakerImageUrl || null;
    if (galleryUrls !== undefined) data.galleryUrls = Array.isArray(galleryUrls) ? galleryUrls : [];
    if (testimonial !== undefined) data.testimonial = testimonial || null;
    if (testimonialAuthor !== undefined) data.testimonialAuthor = testimonialAuthor || null;

    const updated = await prisma.program.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update program:", error);
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE — delete a program (admin only)                             */
/* ------------------------------------------------------------------ */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const existing = await prisma.program.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    await prisma.program.delete({ where: { id } });

    return NextResponse.json({ message: "Program deleted" });
  } catch (error) {
    console.error("Failed to delete program:", error);
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
