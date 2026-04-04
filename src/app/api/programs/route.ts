/**
 * /api/programs
 *
 * GET  — Returns all published programs with RSVP counts (public, no auth required)
 * POST — Creates a new program (requires admin authentication)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET — fetch all published programs                                 */
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
      where: { status: "published" },
      orderBy: [
        { featured: "desc" },
        { date: "asc" },
      ],
      include: {
        _count: {
          select: { rsvps: { where: { status: "confirmed" } } },
        },
      },
    });

    const serialized = programs.map((p) => ({
      ...p,
      date: p.date.toISOString(),
      endDate: p.endDate?.toISOString() ?? null,
      rsvpDeadline: p.rsvpDeadline?.toISOString() ?? null,
      rsvpCount: p._count.rsvps,
      _count: undefined,
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
    const {
      title, category, description, date, latitude, longitude,
      type, imageUrl, subtitle, address, venueName, duration, level,
      endDate, capacity, rsvpDeadline, videoUrl, status, featured,
      whatToExpect, whyAttend, whatYouGet, whatToBring,
      lectureTopic, gitaReference,
      speakerName, speakerTitle, speakerBio, speakerImageUrl,
      galleryUrls, testimonial, testimonialAuthor,
    } = body;

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
        type: type ? String(type) : "program",
        imageUrl: imageUrl ? String(imageUrl) : null,
        subtitle: subtitle ? String(subtitle) : null,
        address: address ? String(address) : null,
        venueName: venueName ? String(venueName) : null,
        duration: duration ? String(duration) : null,
        level: level ? String(level) : null,
        endDate: endDate ? new Date(endDate) : null,
        capacity: capacity != null ? parseInt(capacity) : null,
        rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
        videoUrl: videoUrl ? String(videoUrl) : null,
        status: status ? String(status) : "published",
        featured: featured === true,
        whatToExpect: Array.isArray(whatToExpect) ? whatToExpect : [],
        whyAttend: whyAttend ? String(whyAttend) : null,
        whatYouGet: Array.isArray(whatYouGet) ? whatYouGet : [],
        whatToBring: whatToBring ? String(whatToBring) : null,
        lectureTopic: lectureTopic ? String(lectureTopic) : null,
        gitaReference: gitaReference ? String(gitaReference) : null,
        speakerName: speakerName ? String(speakerName) : null,
        speakerTitle: speakerTitle ? String(speakerTitle) : null,
        speakerBio: speakerBio ? String(speakerBio) : null,
        speakerImageUrl: speakerImageUrl ? String(speakerImageUrl) : null,
        galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
        testimonial: testimonial ? String(testimonial) : null,
        testimonialAuthor: testimonialAuthor ? String(testimonialAuthor) : null,
      },
    });

    return NextResponse.json(
      {
        ...program,
        date: program.date.toISOString(),
        endDate: program.endDate?.toISOString() ?? null,
        rsvpDeadline: program.rsvpDeadline?.toISOString() ?? null,
      },
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
