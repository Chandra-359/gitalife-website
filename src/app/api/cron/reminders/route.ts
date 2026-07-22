import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { getWeeklyPrograms, ET_TZ } from "@/lib/weeklyPrograms";
import { sendProgramReminder } from "@/lib/programEmail";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Weekly reminder sender — invoked once a day by Vercel Cron
 * (see vercel.json; schedule 0 15 * * * ≈ 10–11 AM Eastern).
 *
 * For every weekly program whose class is TOMORROW (Eastern time), email
 * each confirmed registrant who still has reminders enabled. A reminder
 * is stamped on the RSVP (`lastReminderAt`), so re-running the cron the
 * same day sends nothing twice.
 *
 * Protected by CRON_SECRET when set — Vercel sends it automatically as
 * `Authorization: Bearer <CRON_SECRET>` for cron invocations.
 */

const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function tomorrowWeekdayEt(now = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    weekday: "long",
  }).format(new Date(now.getTime() + 86_400_000));
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getPrismaClient();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const tomorrow = tomorrowWeekdayEt();
  const duePrograms = (await getWeeklyPrograms()).filter(
    (p) => p.dayOfWeek === tomorrow,
  );
  if (WEEKDAYS.indexOf(tomorrow) < 0 || duePrograms.length === 0) {
    return NextResponse.json({ tomorrow, sent: 0, programs: [] });
  }

  const results: Array<{ program: string; sent: number; failed: number; skipped: number }> = [];

  for (const program of duePrograms) {
    // Anyone confirmed, subscribed, and not already reminded this cycle.
    const cutoff = new Date(Date.now() - 3 * 86_400_000);
    const due = await db.rsvp.findMany({
      where: {
        programId: program.id,
        status: "confirmed",
        remindersEnabled: true,
        OR: [{ lastReminderAt: null }, { lastReminderAt: { lt: cutoff } }],
      },
      select: { id: true, name: true, email: true },
    });

    let sent = 0;
    let failed = 0;

    // Small batches — kind to the SMTP provider, fast enough for our size.
    const BATCH = 5;
    for (let i = 0; i < due.length; i += BATCH) {
      const outcomes = await Promise.all(
        due.slice(i, i + BATCH).map(async (rsvp) => {
          const outcome = await sendProgramReminder({
            to: rsvp.email,
            name: rsvp.name,
            rsvpId: rsvp.id,
            program,
          });
          if (outcome.ok) {
            await db.rsvp.update({
              where: { id: rsvp.id },
              data: { lastReminderAt: new Date() },
            });
          } else {
            console.error(`Reminder to ${rsvp.email} (${program.id}) failed:`, outcome.error);
          }
          return outcome.ok;
        }),
      );
      sent += outcomes.filter(Boolean).length;
      failed += outcomes.filter((ok) => !ok).length;
    }

    results.push({ program: program.id, sent, failed, skipped: 0 });
  }

  const total = results.reduce((n, r) => n + r.sent, 0);
  console.log(`[reminders] ${tomorrow}: sent ${total}`, results);
  return NextResponse.json({ tomorrow, sent: total, programs: results });
}
