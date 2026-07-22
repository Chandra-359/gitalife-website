/**
 * weeklyPrograms.ts — server helpers for the three weekly programs.
 *
 * - ensureWeeklyProgram: guarantees the Program row exists so RSVPs can
 *   attach to it. Creates with the config defaults but NEVER overwrites
 *   an existing row — the week-to-week fields (topic, poster, gallery,
 *   speaker) are owned by the /admin/weekly console.
 * - getWeeklyPrograms: merges the static config with the live DB row.
 * - nextOccurrence: next class date/time in America/New_York, DST-safe.
 * - unsubscribeToken: HMAC that authenticates one-click unsubscribe links.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  WEEKLY_PROGRAMS,
  type WeeklyProgram,
} from "@/data/weeklyPrograms";

export const ET_TZ = "America/New_York";

const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

/* ------------------------------------------------------------------ */
/*  Eastern-time occurrence math                                       */
/* ------------------------------------------------------------------ */

interface EtNow {
  year: number;
  month: number;   // 1-12
  day: number;
  weekday: number; // 0 = Sunday
  minutes: number; // minutes since ET midnight
}

function etNow(now = new Date()): EtNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", hour12: false, weekday: "short",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayShort = get("weekday");
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekdayShort);
  return {
    year: parseInt(get("year"), 10),
    month: parseInt(get("month"), 10),
    day: parseInt(get("day"), 10),
    weekday: weekday < 0 ? 0 : weekday,
    minutes: (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10),
  };
}

/** UTC offset of the ET zone (ms) at a given instant. */
function etOffsetMs(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    timeZoneName: "longOffset",
  }).formatToParts(at);
  const label = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-05:00";
  const m = label.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return -5 * 3600_000;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3] ?? "0", 10)) * 60_000;
}

/** UTC instant for an ET wall-clock time (two-pass, DST-safe). */
export function etWallTimeToUtc(
  year: number, month: number, day: number, hour: number, minute: number,
): Date {
  let guess = Date.UTC(year, month - 1, day, hour, minute);
  // Two iterations converge even across a DST transition.
  for (let i = 0; i < 2; i++) {
    const offset = etOffsetMs(new Date(guess));
    guess = Date.UTC(year, month - 1, day, hour, minute) - offset;
  }
  return new Date(guess);
}

export interface Occurrence {
  /** Wall-clock date of the class in ET */
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** Absolute instants */
  start: Date;
  end: Date;
}

/**
 * Next occurrence of the program in ET. If the class is later today it
 * counts as the next occurrence.
 */
export function nextOccurrence(program: WeeklyProgram, now = new Date()): Occurrence {
  const target = WEEKDAYS.indexOf(program.dayOfWeek);
  const [hour, minute] = program.startTime.split(":").map((n) => parseInt(n, 10));
  const today = etNow(now);

  let daysAhead = (target - today.weekday + 7) % 7;
  if (daysAhead === 0 && today.minutes >= hour * 60 + minute) daysAhead = 7;

  // Roll the ET calendar date forward via UTC noon arithmetic (immune to
  // DST because noon never lands on a transition).
  const noonUtc = Date.UTC(today.year, today.month - 1, today.day, 12);
  const targetDate = new Date(noonUtc + daysAhead * 86_400_000);
  const year = targetDate.getUTCFullYear();
  const month = targetDate.getUTCMonth() + 1;
  const day = targetDate.getUTCDate();

  const start = etWallTimeToUtc(year, month, day, hour, minute);
  return {
    year, month, day, hour, minute,
    start,
    end: new Date(start.getTime() + program.durationMinutes * 60_000),
  };
}

/** "Friday, March 6" style label for an occurrence, in ET. */
export function occurrenceLabel(o: Occurrence): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long", month: "long", day: "numeric",
  }).format(new Date(Date.UTC(o.year, o.month - 1, o.day, 12)));
}

/* ------------------------------------------------------------------ */
/*  Database merge                                                     */
/* ------------------------------------------------------------------ */

/** Weekly-changing fields owned by the DB row (edited at /admin/weekly). */
export interface WeeklyProgramLive extends WeeklyProgram {
  lectureTopic: string | null;
  gitaReference: string | null;
  speakerName: string | null;
  speakerTitle: string | null;
  posterUrl: string | null;
  galleryUrls: string[];
  videoUrl: string | null;
  registeredCount: number;
}

type ProgramDb = Pick<PrismaClient, "program">;

/** Create the Program row if missing. Never overwrites live edits. */
export async function ensureWeeklyProgram(db: ProgramDb, config: WeeklyProgram) {
  const existing = await db.program.findUnique({ where: { id: config.id } });
  if (existing) return existing;
  return db.program.create({
    data: {
      id: config.id,
      title: config.title,
      category: config.category,
      description: config.description,
      subtitle: config.tagline,
      latitude: config.latitude,
      longitude: config.longitude,
      dayOfWeek: config.dayOfWeek,
      time: config.timeLabel,
      venueName: config.venueName,
      address: config.address,
      duration: `${Math.round(config.durationMinutes / 60)} hours`,
      level: "All levels",
      whatToExpect: config.highlights,
      status: "published",
    },
  });
}

/** All three programs with live DB fields merged in. Never throws. */
export async function getWeeklyPrograms(): Promise<WeeklyProgramLive[]> {
  let rows: Array<{
    id: string;
    lectureTopic: string | null;
    gitaReference: string | null;
    speakerName: string | null;
    speakerTitle: string | null;
    imageUrl: string | null;
    galleryUrls: string[];
    videoUrl: string | null;
    _count: { rsvps: number };
  }> = [];

  try {
    if (prisma?.program) {
      rows = await prisma.program.findMany({
        where: { id: { in: WEEKLY_PROGRAMS.map((p) => p.id) } },
        select: {
          id: true,
          lectureTopic: true,
          gitaReference: true,
          speakerName: true,
          speakerTitle: true,
          imageUrl: true,
          galleryUrls: true,
          videoUrl: true,
          _count: { select: { rsvps: { where: { status: "confirmed" } } } },
        },
      });
    }
  } catch (err) {
    console.warn("weekly programs DB fetch failed:", err);
  }

  return WEEKLY_PROGRAMS.map((config) => {
    const row = rows.find((r) => r.id === config.id);
    return {
      ...config,
      lectureTopic: row?.lectureTopic ?? null,
      gitaReference: row?.gitaReference ?? null,
      speakerName: row?.speakerName ?? null,
      speakerTitle: row?.speakerTitle ?? null,
      posterUrl: row?.imageUrl ?? null,
      galleryUrls: row?.galleryUrls ?? [],
      videoUrl: row?.videoUrl ?? null,
      registeredCount: row?._count.rsvps ?? 0,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Unsubscribe tokens                                                 */
/* ------------------------------------------------------------------ */

function tokenSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.SMTP_PASS ||
    "gitalife-dev-secret" // dev fallback only — set AUTH_SECRET in production
  );
}

/** Deterministic HMAC authenticating an unsubscribe link for one RSVP. */
export function unsubscribeToken(rsvpId: string): string {
  return createHmac("sha256", tokenSecret()).update(`unsub:${rsvpId}`).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(rsvpId: string, token: string): boolean {
  const expected = unsubscribeToken(rsvpId);
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
