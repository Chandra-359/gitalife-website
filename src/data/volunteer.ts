/**
 * volunteer.ts — volunteer drives, seeded from code (client-safe).
 *
 * A "drive" is one volunteering push — usually a festival (Janmashtami,
 * Ratha Yatra, Gaura Purnima) — broken into ACTIVITIES (kitchen, decor,
 * guest welcome…), each with dated SHIFTS (day + start/end + capacity).
 * The /volunteer page renders every published drive with an inline
 * signup form; registrations land in the VolunteerSignup table, on the
 * Google Sheet, and in the /admin/volunteers console.
 *
 * HOW TO ONBOARD THE NEXT DRIVE (this file is the whole setup):
 *  1. Copy JANMASHTAMI_2026 below, give it a NEW unique `id`
 *     (e.g. "ratha-yatra-2027") — signups and the sheet tab key on it.
 *  2. Set the activities and shifts (ET-offset ISO instants; capacity
 *     null = unlimited). Shift ids only need to be unique per activity.
 *  3. Add it to VOLUNTEER_DRIVES and set status "published".
 *  4. Deploy. Nothing else — no console setup, no schema change.
 *
 * When the drive is over, flip status to "closed" (page shows it as
 * wrapped, form disabled) — signups already collected stay in the DB
 * and console. Never reuse an old drive id for a new drive.
 */

/** All shift instants are defined in Eastern Time. */
export const VOLUNTEER_TZ = "America/New_York";

/** Site accent tokens (resolved via colorFor() in components). */
export type VolunteerColor = "gold" | "saffron" | "peacock" | "lotus" | "krishna";

/** Icon names from src/components/home/icons.tsx used on activity cards. */
export type VolunteerIcon =
  | "food"
  | "lotus"
  | "handshake"
  | "flame"
  | "sparkle"
  | "music"
  | "book"
  | "gift"
  | "calendar";

export interface VolunteerShift {
  /** Unique within its activity, e.g. "sat-serving". */
  id: string;
  /** ET-offset ISO instants, e.g. "2026-09-05T10:00:00-04:00". */
  startIso: string;
  endIso: string;
  /** Volunteers needed — the target on the admin fill board. Signups
   *  are never blocked by it, and the public page doesn't show it;
   *  null = no target. */
  capacity: number | null;
  /** Optional one-liner shown under the shift, e.g. "Aprons provided". */
  note?: string;
}

export interface VolunteerActivity {
  /** Unique within the drive, e.g. "kitchen". */
  id: string;
  title: string;
  description: string;
  icon: VolunteerIcon;
  color: VolunteerColor;
  shifts: VolunteerShift[];
}

export interface VolunteerDrive {
  /** Stable unique id — DB rows and the sheet tab key on it. Never reuse. */
  id: string;
  /** Festival / occasion name, e.g. "Sri Krishna Janmashtami". */
  festival: string;
  title: string;
  tagline: string;
  description: string;
  venueName: string;
  address: string;
  /** draft = hidden; published = open for signups; closed = shown as wrapped. */
  status: "draft" | "published" | "closed";
  /** Exact Google Sheet tab registrations land on; defaults to the title. */
  sheetTab?: string;
  /** Optional crew WhatsApp group invite, shown after signup + in email. */
  whatsappUrl?: string;
  activities: VolunteerActivity[];
}

/* ------------------------------------------------------------------ */
/*  Sri Krishna Janmashtami 2026 — ISKCON Brooklyn                     */
/*  Temple schedule: Kitchen seva Thursday Sep 3 (8 volunteers) and    */
/*  all day Friday Sep 4 (15 volunteers, most needed after 4 PM);      */
/*  Govinda's outside stalls run Friday (open to guests from 4 PM)     */
/*  with volunteer shifts 9 AM – 11 PM.                                */
/* ------------------------------------------------------------------ */

export const JANMASHTAMI_2026: VolunteerDrive = {
  id: "janmashtami-2026",
  festival: "Sri Krishna Janmashtami",
  title: "Janmashtami 2026 Seva Crew",
  tagline: "The biggest night of the year doesn't happen without you.",
  description:
    "Thousands come through the temple doors for Krishna's appearance day — and every plate of prasadam served is a volunteer's seva. Kitchen seva starts Thursday; on festival Friday the kitchen runs all day and Govinda's outside stalls serve from 4 PM. Tick every shift you're available for; we'll confirm by email and the coordinators will take it from there.",
  venueName: "Sri Sri Radha Govinda Mandir",
  address: "305 Schermerhorn St, Brooklyn, NY 11217",
  status: "published",
  sheetTab: "Janmashtami 2026 Volunteers",
  activities: [
    {
      id: "kitchen",
      title: "Kitchen",
      description:
        "Chop, cook, and prep the feast offered to Krishna and served to every guest. No cooking experience needed — the kitchen leads will place you. Friday is the big push: the kitchen runs all day, with the most hands needed after 4 PM.",
      icon: "flame",
      color: "peacock",
      shifts: [
        {
          id: "thu-morning",
          startIso: "2026-09-03T10:00:00-04:00",
          endIso: "2026-09-03T13:00:00-04:00",
          capacity: 8,
          note: "Feast prep with the kitchen team",
        },
        {
          id: "thu-evening",
          startIso: "2026-09-03T15:00:00-04:00",
          endIso: "2026-09-03T20:00:00-04:00",
          capacity: 8,
        },
        {
          id: "fri-day",
          startIso: "2026-09-04T09:00:00-04:00",
          endIso: "2026-09-04T16:00:00-04:00",
          capacity: 15,
          note: "Full-day cooking — come for any stretch",
        },
        {
          id: "fri-evening",
          startIso: "2026-09-04T16:00:00-04:00",
          endIso: "2026-09-04T21:00:00-04:00",
          capacity: 15,
          note: "Most hands needed — festival rush",
        },
      ],
    },
    {
      id: "govindas",
      title: "Govinda's — Outside Stalls",
      description:
        "Run the outdoor food stalls with the Govinda's team on festival Friday — setup in the morning, then serving and keeping the lines moving once stalls open to guests at 4 PM.",
      icon: "food",
      color: "saffron",
      shifts: [
        {
          id: "fri-9-12",
          startIso: "2026-09-04T09:00:00-04:00",
          endIso: "2026-09-04T12:00:00-04:00",
          capacity: null,
          note: "Stall setup & prep",
        },
        {
          id: "fri-12-3",
          startIso: "2026-09-04T12:00:00-04:00",
          endIso: "2026-09-04T15:00:00-04:00",
          capacity: null,
        },
        {
          id: "fri-3-6",
          startIso: "2026-09-04T15:00:00-04:00",
          endIso: "2026-09-04T18:00:00-04:00",
          capacity: null,
          note: "Stalls open to guests at 4 PM",
        },
        {
          id: "fri-6-9",
          startIso: "2026-09-04T18:00:00-04:00",
          endIso: "2026-09-04T21:00:00-04:00",
          capacity: null,
        },
        {
          id: "fri-9-11",
          startIso: "2026-09-04T21:00:00-04:00",
          endIso: "2026-09-04T23:00:00-04:00",
          capacity: null,
          note: "Closing crew",
        },
      ],
    },
  ],
};

/** Every drive the site knows about, newest first. */
export const VOLUNTEER_DRIVES: VolunteerDrive[] = [JANMASHTAMI_2026];

/* ------------------------------------------------------------------ */
/*  Shared helpers (safe on client and server)                         */
/* ------------------------------------------------------------------ */

/** Canonical key a signup stores per chosen shift. */
export function volunteerShiftKey(activityId: string, shiftId: string): string {
  return `${activityId}:${shiftId}`;
}

export function findVolunteerDrive(driveId: string): VolunteerDrive | undefined {
  return VOLUNTEER_DRIVES.find((d) => d.id === driveId);
}

/** "Saturday, September 5" */
export function volunteerDateLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: VOLUNTEER_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

/** "Sat, Sep 5" — compact chip form. */
export function volunteerDayChip(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: VOLUNTEER_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

/** "6:00 PM – 10:00 PM" */
export function volunteerTimeRange(startIso: string, endIso: string): string {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: VOLUNTEER_TZ,
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  return `${fmt(startIso)} – ${fmt(endIso)}`;
}

/** "September 3–6" (single day → "September 5") across a drive's shifts. */
export function volunteerDriveDatesLabel(drive: VolunteerDrive): string {
  const starts = drive.activities.flatMap((a) => a.shifts.map((s) => s.startIso));
  if (starts.length === 0) return "";
  const sorted = starts.slice().sort();
  const day = (iso: string, withMonth: boolean) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: VOLUNTEER_TZ,
      ...(withMonth ? { month: "long" as const } : {}),
      day: "numeric",
    }).format(new Date(iso));
  const first = day(sorted[0], true);
  const last = day(sorted[sorted.length - 1], false);
  const lastWithMonth = day(sorted[sorted.length - 1], true);
  if (first === lastWithMonth) return first;
  // Same month → "September 3–6"; different months → "September 30 – October 2"
  return lastWithMonth.startsWith(first.split(" ")[0])
    ? `${first}–${last}`
    : `${first} – ${lastWithMonth}`;
}
