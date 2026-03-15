/**
 * GET /api/programs
 *
 * Returns all programs from the database, ordered by date ascending.
 * Each program is serialized with `date` as an ISO string.
 *
 * If the database is unavailable (no DATABASE_URL), returns 503.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
