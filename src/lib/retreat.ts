/**
 * retreat.ts — server helpers for retreats (src/data/retreats.ts).
 *
 * Each retreat is a Program row with `type: "retreat"` and
 * `status: "unlisted"`: registrations reuse the Rsvp table (so the
 * admin RSVP list, the door check-in board, and the unsubscribe link all
 * work unchanged), while the "unlisted" status keeps it off /festival,
 * /programs, the map, and the public programs API — all of which only
 * show "published" rows. Organizers share the /retreat/<slug> link by
 * hand.
 */

import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { RETREAT_TZ, RETREATS, type RetreatConfig } from "@/data/retreats";

/** Status of the retreat's Program row — deliberately not "published". */
export const RETREAT_PROGRAM_STATUS = "unlisted";

function weekdayEt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: RETREAT_TZ, weekday: "long" }).format(
    new Date(iso),
  );
}

function seedData(retreat: RetreatConfig) {
  return {
    title: retreat.title,
    category: "Retreat",
    description: retreat.description,
    latitude: retreat.lat,
    longitude: retreat.lng,
    dayOfWeek: weekdayEt(retreat.startIso),
    time: retreat.timingNote,
    type: "retreat",
    eventStartAt: new Date(retreat.startIso),
    eventEndAt: new Date(retreat.endIso),
    venueName: retreat.venueName,
    address: retreat.address,
    imageUrl: retreat.posterUrl,
    whatToExpect: retreat.highlights,
    capacity: retreat.capacity,
    speakerName: retreat.specialGuest ?? null,
    status: RETREAT_PROGRAM_STATUS,
    featured: false,
  };
}

/** Configs are constants per deploy — one successful sync per instance. */
let synced = false;

/**
 * Upsert every retreat's Program row (drafts included, so a retreat can
 * be set up before it opens). Never throws — a database hiccup must not
 * take down the page or a registration that could still work.
 */
export async function ensureRetreatPrograms(
  db: Pick<PrismaClient, "program"> | null,
): Promise<void> {
  if (synced || !db?.program) return;
  let allOk = true;
  for (const retreat of RETREATS) {
    try {
      const data = seedData(retreat);
      await db.program.upsert({
        where: { id: retreat.id },
        update: data,
        create: { id: retreat.id, ...data },
      });
    } catch (error) {
      allOk = false;
      console.error(`Retreat program sync failed for ${retreat.id}:`, error);
    }
  }
  synced = allOk; // a failed sync retries on the next call
}

export interface RetreatLive extends RetreatConfig {
  /** Confirmed registrations so far. */
  registeredCount: number;
  spotsLeft: number | null;
}

/** A retreat with its live registration count. Never throws. */
export async function getRetreatLive(retreat: RetreatConfig): Promise<RetreatLive> {
  let registeredCount = 0;
  try {
    if (prisma?.rsvp) {
      registeredCount = await prisma.rsvp.count({
        where: { programId: retreat.id, status: "confirmed" },
      });
    }
  } catch (err) {
    console.warn(`retreat count fetch failed for ${retreat.id}:`, err);
  }
  return {
    ...retreat,
    registeredCount,
    spotsLeft: retreat.capacity != null ? Math.max(0, retreat.capacity - registeredCount) : null,
  };
}

/** Calendar date (YYYY-MM-DD) of an instant, in Eastern time. */
export function etDateOf(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RETREAT_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(at);
}

export type RetreatReminderKind = "day-before" | "day-of";

/**
 * Which reminder (if any) a published retreat is due for on a given day:
 * "day-before" when it starts tomorrow (ET), "day-of" when it starts
 * today. Used by /api/cron/reminders.
 */
export function retreatReminderDue(
  retreat: RetreatConfig,
  now = new Date(),
): RetreatReminderKind | null {
  if (retreat.status !== "published") return null;
  const start = etDateOf(new Date(retreat.startIso));
  if (start === etDateOf(new Date(now.getTime() + 86_400_000))) return "day-before";
  if (start === etDateOf(now)) return "day-of";
  return null;
}
