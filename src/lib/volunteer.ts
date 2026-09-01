/**
 * volunteer.ts — server helpers for volunteer drives.
 *
 * Drives live in code (src/data/volunteer.ts); this module joins them
 * with the VolunteerSignup table to produce serializable "live" views
 * carrying per-shift signup counts and spots left, for the /volunteer
 * page, the confirmation email, and the /admin/volunteers console.
 */

import { prisma } from "@/lib/prisma";
import {
  VOLUNTEER_DRIVES,
  findVolunteerDrive,
  volunteerDateLabel,
  volunteerDayChip,
  volunteerShiftKey,
  volunteerTimeRange,
  volunteerDriveDatesLabel,
  type VolunteerDrive,
} from "@/data/volunteer";

export interface VolunteerShiftLive {
  /** "activityId:shiftId" — what signups store. */
  key: string;
  activityId: string;
  activityTitle: string;
  shiftId: string;
  startIso: string;
  endIso: string;
  dateLabel: string; // "Saturday, September 5"
  dayChip: string;   // "Sat, Sep 5"
  timeLabel: string; // "6:00 PM – 10:00 PM"
  note: string | null;
  capacity: number | null;
  signedUp: number;
  spotsLeft: number | null;
}

export interface VolunteerActivityLive {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  shifts: VolunteerShiftLive[];
}

export interface VolunteerDriveLive {
  id: string;
  festival: string;
  title: string;
  tagline: string;
  description: string;
  venueName: string;
  address: string;
  mapsUrl: string;
  datesLabel: string; // "September 3–6"
  status: string;
  whatsappUrl: string | null;
  activities: VolunteerActivityLive[];
  /** Distinct confirmed volunteers across the drive. */
  volunteerCount: number;
}

/** Confirmed signups per shift key for one drive. Never throws. */
export async function getVolunteerShiftCounts(
  driveId: string,
): Promise<{ counts: Record<string, number>; volunteers: number }> {
  if (!prisma?.volunteerSignup) return { counts: {}, volunteers: 0 };
  try {
    const rows = await prisma.volunteerSignup.findMany({
      where: { driveId, status: "confirmed" },
      select: { shiftKeys: true },
    });
    const counts: Record<string, number> = {};
    for (const row of rows) {
      for (const key of row.shiftKeys) {
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }
    return { counts, volunteers: rows.length };
  } catch (err) {
    console.warn("volunteer shift counts fetch failed:", err);
    return { counts: {}, volunteers: 0 };
  }
}

function toLive(
  drive: VolunteerDrive,
  counts: Record<string, number>,
  volunteers: number,
): VolunteerDriveLive {
  return {
    id: drive.id,
    festival: drive.festival,
    title: drive.title,
    tagline: drive.tagline,
    description: drive.description,
    venueName: drive.venueName,
    address: drive.address,
    mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(drive.address)}`,
    datesLabel: volunteerDriveDatesLabel(drive),
    status: drive.status,
    whatsappUrl: drive.whatsappUrl ?? null,
    volunteerCount: volunteers,
    activities: drive.activities.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      color: a.color,
      shifts: a.shifts.map((s) => {
        const key = volunteerShiftKey(a.id, s.id);
        const signedUp = counts[key] ?? 0;
        return {
          key,
          activityId: a.id,
          activityTitle: a.title,
          shiftId: s.id,
          startIso: s.startIso,
          endIso: s.endIso,
          dateLabel: volunteerDateLabel(s.startIso),
          dayChip: volunteerDayChip(s.startIso),
          timeLabel: volunteerTimeRange(s.startIso, s.endIso),
          note: s.note ?? null,
          capacity: s.capacity,
          signedUp,
          spotsLeft: s.capacity != null ? Math.max(0, s.capacity - signedUp) : null,
        };
      }),
    })),
  };
}

/** Every published or closed drive with live counts, config order. */
export async function getVolunteerDrivesLive(): Promise<VolunteerDriveLive[]> {
  const visible = VOLUNTEER_DRIVES.filter((d) => d.status !== "draft");
  return Promise.all(
    visible.map(async (drive) => {
      const { counts, volunteers } = await getVolunteerShiftCounts(drive.id);
      return toLive(drive, counts, volunteers);
    }),
  );
}

/** One drive with live counts, any status — admin + registration. */
export async function getVolunteerDriveLive(driveId: string): Promise<VolunteerDriveLive | null> {
  const drive = findVolunteerDrive(driveId);
  if (!drive) return null;
  const { counts, volunteers } = await getVolunteerShiftCounts(drive.id);
  return toLive(drive, counts, volunteers);
}

/** Flat shift list for a live drive, in config order. */
export function flattenShifts(drive: VolunteerDriveLive): VolunteerShiftLive[] {
  return drive.activities.flatMap((a) => a.shifts);
}

/**
 * Resolve submitted shift keys against a live drive: unknown keys are
 * dropped, order follows the config. Returns the matched shifts.
 */
export function resolveShiftKeys(
  drive: VolunteerDriveLive,
  keys: string[],
): VolunteerShiftLive[] {
  const wanted = new Set(keys);
  return flattenShifts(drive).filter((s) => wanted.has(s.key));
}
