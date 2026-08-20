/**
 * /api/admin/spam — one-tap spam purge (admin only)
 *
 * POST { programId? }
 *
 * Deletes every CONFIRMED registration that trips the spam heuristics
 * (lib/spam.ts — the random-case bot names / dot-riddled addresses that
 * hit the public forms), then removes the matching rows from the Google
 * Sheets, so database and sheet stay in step. Scoped to one program
 * when programId is given, else sweeps every program.
 *
 * Bhajan Clubbing is always excluded — those registrations are paid,
 * so anything odd there is a human's job, not a heuristic's.
 *
 * The admin consoles preview the same heuristic client-side and put the
 * list in a confirm dialog before calling this.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isSpamRegistration } from "@/lib/spam";
import { removeFestivalSheetRows, removeWeeklySheetRows } from "@/lib/sheets";
import { EVENT } from "@/data/bhajanClubbing";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => ({}) as { programId?: unknown });
    const programId =
      typeof body.programId === "string" && body.programId ? body.programId : null;

    if (programId === EVENT.programId) {
      return NextResponse.json(
        { error: "Bhajan Clubbing registrations are paid — clean those up by hand" },
        { status: 400 },
      );
    }

    const rsvps = await prisma.rsvp.findMany({
      where: {
        status: "confirmed",
        programId: programId ?? { not: EVENT.programId },
      },
      include: { program: { select: { id: true, title: true, eventStartAt: true } } },
    });

    const spam = rsvps.filter((r) => isSpamRegistration(r.name, r.email));
    if (spam.length === 0) {
      return NextResponse.json({ purged: 0, sheetRows: 0, entries: [] });
    }

    await prisma.rsvp.deleteMany({ where: { id: { in: spam.map((s) => s.id) } } });

    // Sheet rows go per program: dated events on their own tab, weekly
    // programs on the shared programs sheet. Best-effort — the DB purge
    // above is the one that stops the emails.
    const byProgram = new Map<string, { title: string; dated: boolean; emails: string[] }>();
    for (const s of spam) {
      const g = byProgram.get(s.programId) ?? {
        title: s.program.title,
        dated: s.program.eventStartAt !== null,
        emails: [],
      };
      g.emails.push(s.email);
      byProgram.set(s.programId, g);
    }
    let sheetRows = 0;
    for (const [id, g] of byProgram) {
      sheetRows += g.dated
        ? await removeFestivalSheetRows(id, g.title, g.emails)
        : await removeWeeklySheetRows(g.title, g.emails);
    }

    return NextResponse.json({
      purged: spam.length,
      sheetRows,
      entries: spam.map((s) => ({ name: s.name, email: s.email, program: s.program.title })),
    });
  } catch (error) {
    console.error("Spam purge failed:", error);
    return NextResponse.json({ error: "Purge failed — try again" }, { status: 500 });
  }
}
