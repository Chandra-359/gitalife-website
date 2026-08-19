/**
 * myf.ts — server-side sync for code-managed dated events (the Monthly
 * Youth Festival editions in src/data/myf.ts).
 *
 * ensureSeededFestivalEvents() upserts each seed into the Program table
 * (same pattern as ensureEventProgram for Bhajan Clubbing), so the event
 * exists before /festival renders and before a registration lands. Code
 * is the source of truth for seeded events — except the poster, which a
 * null seed posterUrl leaves alone so an /admin/festivals upload sticks.
 */

import type { PrismaClient } from "@prisma/client";
import { SEEDED_FESTIVAL_EVENTS, type FestivalEventSeed } from "@/data/myf";
import { ET_TZ } from "@/lib/weeklyPrograms";

function weekdayEt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: ET_TZ, weekday: "long" }).format(
    new Date(iso),
  );
}

function seedData(seed: FestivalEventSeed) {
  return {
    title: seed.title,
    category: seed.category,
    description: seed.description,
    latitude: seed.lat,
    longitude: seed.lng,
    dayOfWeek: weekdayEt(seed.startIso),
    time: seed.timeLabel,
    type: "festival",
    eventStartAt: new Date(seed.startIso),
    eventEndAt: new Date(seed.endIso),
    venueName: seed.venueName,
    address: seed.address,
    whatToExpect: seed.highlights,
    capacity: seed.capacity,
    speakerName: seed.speakerName ?? null,
    speakerTitle: seed.speakerTitle ?? null,
    status: "published",
    featured: seed.featured ?? false,
  };
}

/** Seeds are constants per deploy, so one successful sync per server
 *  instance is enough — /festival page views don't each write the DB. */
let synced = false;

/**
 * Upsert every seeded event. Never throws — a database hiccup must not
 * take down the /festival page or a registration that could still work.
 */
export async function ensureSeededFestivalEvents(
  db: Pick<PrismaClient, "program"> | null,
): Promise<void> {
  if (synced || !db?.program) return;
  let allOk = true;
  for (const seed of SEEDED_FESTIVAL_EVENTS) {
    try {
      const data = seedData(seed);
      await db.program.upsert({
        where: { id: seed.programId },
        // A console-uploaded poster survives while the seed has none
        update: { ...data, ...(seed.posterUrl !== null ? { imageUrl: seed.posterUrl } : {}) },
        create: { id: seed.programId, imageUrl: seed.posterUrl, ...data },
      });
    } catch (error) {
      allOk = false;
      console.error(`Seeded event sync failed for ${seed.programId}:`, error);
    }
  }
  synced = allOk; // a failed sync retries on the next call
}
