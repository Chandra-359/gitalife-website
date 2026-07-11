/**
 * clubbing.ts — server-side helpers shared by the Bhajan Clubbing
 * registration and checkout API routes (route files may only export
 * HTTP handlers, so shared logic lives here).
 */

import type { PrismaClient } from "@prisma/client";
import { EVENT } from "@/data/bajanClubbing";

/** Tier tag stamped at the front of RSVP notes — also used to count tier usage. */
export const tierTag = (tierName: string) => `[${tierName}]`;

/** Ensure the event's Program row exists and is current with the data file. */
export async function ensureEventProgram(db: Pick<PrismaClient, "program">) {
  const data = {
    title: `${EVENT.title} — ${EVENT.volume}`,
    category: "Kirtan & Prasadam",
    description: EVENT.description,
    subtitle: EVENT.tagline,
    latitude: 40.7178,
    longitude: -74.0431,
    dayOfWeek: "Saturday",
    time: EVENT.timeLabel,
    venueName: EVENT.venue.name,
    address: EVENT.venue.address,
    duration: "4 hours",
    level: "All levels",
    capacity: EVENT.capacity,
    status: "published",
    featured: true,
  };
  return db.program.upsert({
    where: { id: EVENT.programId },
    update: data,
    create: { id: EVENT.programId, ...data },
  });
}

/** Confirmed guest count for the event, optionally narrowed to one tier. */
export async function countGuests(db: Pick<PrismaClient, "rsvp">, tierName?: string) {
  const sum = await db.rsvp.aggregate({
    where: {
      programId: EVENT.programId,
      status: "confirmed",
      ...(tierName ? { notes: { startsWith: tierTag(tierName) } } : {}),
    },
    _sum: { guests: true },
  });
  return sum._sum.guests ?? 0;
}

/** Whether Square is configured, i.e. the VIP tier can actually be sold. */
export function paymentsConfigured(): boolean {
  return !!(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}
