/**
 * /api/admin/rsvps
 *
 * GET — Returns all RSVPs with program info, filterable by programId (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (programId) where.programId = programId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [rsvps, programs] = await Promise.all([
      prisma.rsvp.findMany({
        where,
        include: {
          program: {
            select: { id: true, title: true, dayOfWeek: true, category: true, type: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.program.findMany({
        select: { id: true, title: true, dayOfWeek: true },
        orderBy: { dayOfWeek: "asc" },
      }),
    ]);

    const serialized = rsvps.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      rsvps: serialized,
      programs,
    });
  } catch (error) {
    console.error("Failed to fetch RSVPs:", error);
    return NextResponse.json({ error: "Failed to fetch RSVPs" }, { status: 500 });
  }
}
