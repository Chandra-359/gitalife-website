/**
 * /api/admin/volunteers
 *
 * GET  — signups for one drive (default: first configured) plus the
 *        drive's live per-shift fill and the drive picker list.
 *        Query: ?driveId=…&search=… (name/email, case-insensitive)
 * DELETE — { ids: string[] } → hard-delete those signups and remove
 *        their Google Sheet rows (spam cleanup from the console).
 *
 * Admin only.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { VOLUNTEER_DRIVES, findVolunteerDrive } from "@/data/volunteer";
import { getVolunteerDriveLive } from "@/lib/volunteer";
import { removeVolunteerSheetRows } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma?.volunteerSignup) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const driveId = searchParams.get("driveId") || VOLUNTEER_DRIVES[0]?.id || "";
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { driveId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [signups, drive] = await Promise.all([
      prisma.volunteerSignup.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      getVolunteerDriveLive(driveId),
    ]);

    return NextResponse.json({
      drives: VOLUNTEER_DRIVES.map((d) => ({
        id: d.id,
        title: d.title,
        festival: d.festival,
        status: d.status,
      })),
      drive,
      signups: signups.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch volunteer signups:", error);
    return NextResponse.json({ error: "Failed to fetch volunteer signups" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma?.volunteerSignup) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.filter((v: unknown): v is string => typeof v === "string").slice(0, 500)
      : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "No signups selected" }, { status: 400 });
    }

    const doomed = await prisma.volunteerSignup.findMany({
      where: { id: { in: ids } },
      select: { id: true, driveId: true, email: true },
    });
    if (doomed.length === 0) {
      return NextResponse.json({ purged: 0, sheetRows: 0 });
    }

    const { count } = await prisma.volunteerSignup.deleteMany({
      where: { id: { in: doomed.map((d) => d.id) } },
    });

    // Keep the sheet in step, tab by tab (best-effort — never blocks).
    const byDrive = new Map<string, string[]>();
    for (const d of doomed) {
      byDrive.set(d.driveId, [...(byDrive.get(d.driveId) ?? []), d.email]);
    }
    let sheetRows = 0;
    for (const [driveId, emails] of byDrive) {
      const cfg = findVolunteerDrive(driveId);
      if (!cfg) continue;
      sheetRows += await removeVolunteerSheetRows(cfg.sheetTab, cfg.title, emails);
    }

    return NextResponse.json({ purged: count, sheetRows });
  } catch (error) {
    console.error("Failed to delete volunteer signups:", error);
    return NextResponse.json({ error: "Failed to delete signups" }, { status: 500 });
  }
}
