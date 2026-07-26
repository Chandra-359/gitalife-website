/**
 * /admin/weekly — the "This Week" console for program owners.
 *
 * The one place a program owner needs each week: set the upcoming
 * topic, Gita reference, and speaker; upload this week's poster; and
 * drop in photos/videos from the last session. Everything else about
 * the program (schedule, venue, description) is fixed configuration in
 * src/data/weeklyPrograms.ts and full editing stays at
 * /admin/programs/[id]/edit.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/prisma";
import { WEEKLY_PROGRAMS } from "@/data/weeklyPrograms";
import { ensureWeeklyProgram, getWeeklyPrograms } from "@/lib/weeklyPrograms";
import WeeklyConsole from "@/components/admin/WeeklyConsole";

export const dynamic = "force-dynamic";

export default async function AdminWeeklyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  // Make sure all three rows exist so edits always have a target.
  const db = getPrismaClient();
  if (db) {
    for (const config of WEEKLY_PROGRAMS) {
      try {
        await ensureWeeklyProgram(db, config);
      } catch (err) {
        console.warn(`ensureWeeklyProgram(${config.id}) failed:`, err);
      }
    }
  }

  const programs = await getWeeklyPrograms();
  return <WeeklyConsole programs={programs} />;
}
