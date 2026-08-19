/**
 * festivals.ts — server helpers for dated events on /festival.
 *
 * A "festival event" is any Program row with a non-null eventStartAt:
 * the monthly Youth Festival, big festivals (Ratha Yatra, Janmashtami),
 * and dated volunteering opportunities. They're created and edited in
 * the /admin/festivals console; weekly programs (null eventStartAt) are
 * untouched by any of this.
 *
 * Registration reuses the same Rsvp table + unique email-per-event
 * constraint as everything else, so check-in and the admin RSVP views
 * keep working unchanged.
 */

import { prisma } from "@/lib/prisma";
import { ET_TZ } from "@/lib/weeklyPrograms";
import { festivalAccent, type FestivalEventLive } from "@/data/festivals";

export type { FestivalEventLive } from "@/data/festivals";

const DEFAULT_DURATION_MS = 3 * 3600_000;

export function eventDateLabel(startAtIso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    weekday: "long", month: "long", day: "numeric",
  }).format(new Date(startAtIso));
}

export function eventTimeLabel(startAtIso: string, endAtIso: string): string {
  const fmt = (iso: string, withTz = false) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: ET_TZ,
      hour: "numeric", minute: "2-digit",
      ...(withTz ? { timeZoneName: "short" } : {}),
    }).format(new Date(iso));
  return `${fmt(startAtIso)} – ${fmt(endAtIso, true)}`;
}

type ProgramRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  eventStartAt: Date | null;
  eventEndAt: Date | null;
  venueName: string | null;
  address: string | null;
  imageUrl: string | null;
  galleryUrls: string[];
  videoUrl: string | null;
  whatToExpect: string[];
  capacity: number | null;
  status: string;
  featured: boolean;
  rsvps: { guests: number }[];
};

function toLive(row: ProgramRow): FestivalEventLive {
  const startAt = (row.eventStartAt as Date).toISOString();
  const endAt = (
    row.eventEndAt ?? new Date((row.eventStartAt as Date).getTime() + DEFAULT_DURATION_MS)
  ).toISOString();
  const registeredCount = row.rsvps.reduce((n, r) => n + r.guests, 0);
  const address = row.address ?? "";
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    startAt,
    endAt,
    dateLabel: eventDateLabel(startAt),
    timeLabel: eventTimeLabel(startAt, endAt),
    venueName: row.venueName ?? "Venue to be announced",
    address,
    mapsUrl: address
      ? `https://maps.google.com/?q=${encodeURIComponent(address)}`
      : "https://maps.google.com/?q=ISKCON+Brooklyn",
    posterUrl: row.imageUrl,
    galleryUrls: row.galleryUrls,
    videoUrl: row.videoUrl,
    highlights: row.whatToExpect,
    capacity: row.capacity,
    registeredCount,
    spotsLeft: row.capacity != null ? Math.max(0, row.capacity - registeredCount) : null,
    status: row.status,
    featured: row.featured,
    accent: festivalAccent(row.category),
  };
}

const EVENT_SELECT = {
  id: true, title: true, category: true, description: true,
  eventStartAt: true, eventEndAt: true, venueName: true, address: true,
  imageUrl: true, galleryUrls: true, videoUrl: true, whatToExpect: true,
  capacity: true, status: true, featured: true,
  rsvps: { where: { status: "confirmed" }, select: { guests: true } },
} as const;

export interface FestivalEventsResult {
  upcoming: FestivalEventLive[];
  past: FestivalEventLive[];
}

/**
 * Published dated events, split into upcoming (soonest first — events
 * stay listed until 6h after start) and recent past (for the gallery).
 * Never throws.
 */
export async function getFestivalEvents(): Promise<FestivalEventsResult> {
  if (!prisma?.program) return { upcoming: [], past: [] };
  try {
    const horizon = new Date(Date.now() - 6 * 3600_000);
    const [upcoming, past] = await Promise.all([
      prisma.program.findMany({
        where: { status: "published", eventStartAt: { gte: horizon } },
        orderBy: { eventStartAt: "asc" },
        select: EVENT_SELECT,
      }),
      prisma.program.findMany({
        where: { status: "published", eventStartAt: { lt: horizon } },
        orderBy: { eventStartAt: "desc" },
        take: 6,
        select: EVENT_SELECT,
      }),
    ]);
    return {
      upcoming: upcoming.map((r) => toLive(r as ProgramRow)),
      past: past.map((r) => toLive(r as ProgramRow)),
    };
  } catch (err) {
    console.warn("festival events fetch failed:", err);
    return { upcoming: [], past: [] };
  }
}

/** Every dated event regardless of status — for the admin console. */
export async function getAllFestivalEvents(): Promise<FestivalEventLive[]> {
  if (!prisma?.program) return [];
  try {
    const rows = await prisma.program.findMany({
      where: { eventStartAt: { not: null } },
      orderBy: { eventStartAt: "desc" },
      select: EVENT_SELECT,
    });
    return rows.map((r) => toLive(r as ProgramRow));
  } catch (err) {
    console.warn("admin festival events fetch failed:", err);
    return [];
  }
}

/** One dated event by id regardless of status or date — admin tooling
 *  (check-in board email resends work even after the event starts). */
export async function getFestivalEventById(id: string): Promise<FestivalEventLive | null> {
  if (!prisma?.program) return null;
  try {
    const row = await prisma.program.findUnique({ where: { id }, select: EVENT_SELECT });
    if (!row || !row.eventStartAt) return null;
    return toLive(row as ProgramRow);
  } catch (err) {
    console.warn("festival event fetch failed:", err);
    return null;
  }
}

/** One published, still-upcoming event by id (registration target). */
export async function getOpenFestivalEvent(id: string): Promise<FestivalEventLive | null> {
  if (!prisma?.program) return null;
  try {
    const row = await prisma.program.findUnique({
      where: { id },
      select: EVENT_SELECT,
    });
    if (!row || !row.eventStartAt || row.status !== "published") return null;
    if (row.eventStartAt.getTime() < Date.now() - 6 * 3600_000) return null;
    return toLive(row as ProgramRow);
  } catch (err) {
    console.warn("festival event fetch failed:", err);
    return null;
  }
}
