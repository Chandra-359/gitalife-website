/**
 * Shared program data fetching logic
 *
 * Used by both the homepage (preview) and the /programs page (full list).
 */

import { prisma } from "@/lib/prisma";
import type { Program } from "@/data/programs";

export async function getPrograms(): Promise<Program[]> {
  if (!prisma?.program) {
    console.warn("DATABASE_URL not set — returning empty program list");
    return [];
  }

  try {
    const rows = await prisma.program.findMany({
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

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      type: row.type,
      description: row.description,
      longitude: row.longitude,
      latitude: row.latitude,
      date: row.date.toISOString(),
      imageUrl: row.imageUrl,
      subtitle: row.subtitle,
      address: row.address,
      venueName: row.venueName,
      duration: row.duration,
      level: row.level,
      endDate: row.endDate?.toISOString() ?? null,
      capacity: row.capacity,
      rsvpDeadline: row.rsvpDeadline?.toISOString() ?? null,
      rsvpCount: row._count.rsvps,
      whatToExpect: row.whatToExpect,
      whyAttend: row.whyAttend,
      whatYouGet: row.whatYouGet,
      whatToBring: row.whatToBring,
      lectureTopic: row.lectureTopic,
      gitaReference: row.gitaReference,
      speakerName: row.speakerName,
      speakerTitle: row.speakerTitle,
      speakerBio: row.speakerBio,
      speakerImageUrl: row.speakerImageUrl,
      galleryUrls: row.galleryUrls,
      videoUrl: row.videoUrl,
      testimonial: row.testimonial,
      testimonialAuthor: row.testimonialAuthor,
      status: row.status,
      featured: row.featured,
    }));
  } catch (err) {
    console.warn("Database query failed:", err);
    return [];
  }
}
