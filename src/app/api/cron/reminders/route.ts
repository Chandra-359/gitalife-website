import { NextResponse } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "@/lib/prisma";
import { getWeeklyPrograms, ET_TZ } from "@/lib/weeklyPrograms";
import { sendProgramReminder } from "@/lib/programEmail";
import { getFestivalEvents } from "@/lib/festivals";
import { sendFestivalReminder } from "@/lib/festivalEmail";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Reminder sender — invoked once a day by Vercel Cron
 * (see vercel.json; schedule 0 15 * * * ≈ 10–11 AM Eastern).
 *
 * Two passes, both "the day before, Eastern time":
 *  1. Weekly programs — everyone registered for a program whose class
 *     is tomorrow gets that week's topic reminder.
 *  2. Dated events (/festival) — everyone registered for an event that
 *     happens tomorrow gets the event reminder.
 *
 * Each reminder is stamped on the RSVP (`lastReminderAt`), so re-running
 * the cron the same day sends nothing twice. Only confirmed RSVPs with
 * remindersEnabled are mailed.
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

/** Calendar date (YYYY-MM-DD) of an instant, in Eastern time. */
function etDateOf(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ET_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(at);
}

interface DueRsvp {
  id: string;
  name: string;
  email: string;
  guests: number;
}

/** Un-reminded, subscribed, confirmed RSVPs for one program/event. */
async function dueRsvps(db: PrismaClient, programId: string): Promise<DueRsvp[]> {
  const cutoff = new Date(Date.now() - 3 * 86_400_000);
  return db.rsvp.findMany({
    where: {
      programId,
      status: "confirmed",
      remindersEnabled: true,
      OR: [{ lastReminderAt: null }, { lastReminderAt: { lt: cutoff } }],
    },
    select: { id: true, name: true, email: true, guests: true },
  });
}

/** Send in small batches; stamp lastReminderAt on success. */
async function sendBatch(
  db: PrismaClient,
  rsvps: DueRsvp[],
  send: (rsvp: DueRsvp) => Promise<{ ok: boolean; error?: string }>,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  const BATCH = 5;
  for (let i = 0; i < rsvps.length; i += BATCH) {
    const outcomes = await Promise.all(
      rsvps.slice(i, i + BATCH).map(async (rsvp) => {
        const outcome = await send(rsvp);
        if (outcome.ok) {
          await db.rsvp.update({
            where: { id: rsvp.id },
            data: { lastReminderAt: new Date() },
          });
        } else {
          console.error(`Reminder to ${rsvp.email} failed:`, outcome.error);
        }
        return outcome.ok;
      }),
    );
    sent += outcomes.filter(Boolean).length;
    failed += outcomes.filter((ok) => !ok).length;
  }
  return { sent, failed };
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
  const results: Array<{ program: string; sent: number; failed: number }> = [];

  /* ----- Pass 1: weekly programs meeting tomorrow ----- */
  if (WEEKDAYS.includes(tomorrow)) {
    const duePrograms = (await getWeeklyPrograms()).filter(
      (p) => p.dayOfWeek === tomorrow,
    );
    for (const program of duePrograms) {
      const due = await dueRsvps(db, program.id);
      const { sent, failed } = await sendBatch(db, due, (rsvp) =>
        sendProgramReminder({ to: rsvp.email, name: rsvp.name, rsvpId: rsvp.id, program }),
      );
      results.push({ program: program.id, sent, failed });
    }
  }

  /* ----- Pass 2: dated events (festivals) happening tomorrow ----- */
  const tomorrowDate = etDateOf(new Date(Date.now() + 86_400_000));
  const dueEvents = (await getFestivalEvents()).upcoming.filter(
    (e) => etDateOf(new Date(e.startAt)) === tomorrowDate,
  );
  for (const event of dueEvents) {
    const due = await dueRsvps(db, event.id);
    const { sent, failed } = await sendBatch(db, due, (rsvp) =>
      sendFestivalReminder({ to: rsvp.email, name: rsvp.name, rsvpId: rsvp.id, event, guests: rsvp.guests }),
    );
    results.push({ program: event.id, sent, failed });
  }

  const total = results.reduce((n, r) => n + r.sent, 0);
  console.log(`[reminders] ${tomorrow} (${tomorrowDate}): sent ${total}`, results);
  return NextResponse.json({ tomorrow, tomorrowDate, sent: total, programs: results });
}
