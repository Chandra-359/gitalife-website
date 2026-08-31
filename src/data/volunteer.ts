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
  /** Max volunteers for this shift; null = no cap. */
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
/*  Festival day Saturday Sep 5; prep from Thursday, Nandotsava +      */
/*  restore on Sunday. Adjust shifts to the temple's final schedule.   */
/* ------------------------------------------------------------------ */

export const JANMASHTAMI_2026: VolunteerDrive = {
  id: "janmashtami-2026",
  festival: "Sri Krishna Janmashtami",
  title: "Janmashtami 2026 Seva Crew",
  tagline: "The biggest night of the year doesn't happen without you.",
  description:
    "Thousands come through the temple doors for Krishna's appearance day — and every garland, every plate of prasadam, and every warm welcome is a volunteer's seva. Pick the crew and shifts that fit your week; we'll confirm by email and the coordinators will take it from there.",
  venueName: "Sri Sri Radha Govinda Mandir",
  address: "305 Schermerhorn St, Brooklyn, NY 11217",
  status: "published",
  sheetTab: "Janmashtami 2026 Volunteers",
  activities: [
    {
      id: "kitchen",
      title: "Kitchen & Prasadam",
      description:
        "Chop, cook, and plate the feast offered to Krishna and served to every guest. No cooking experience needed — the kitchen leads will place you.",
      icon: "food",
      color: "peacock",
      shifts: [
        {
          id: "thu-prep",
          startIso: "2026-09-03T18:00:00-04:00",
          endIso: "2026-09-03T21:00:00-04:00",
          capacity: 10,
          note: "Veg prep for the feast",
        },
        {
          id: "fri-cooking",
          startIso: "2026-09-04T18:00:00-04:00",
          endIso: "2026-09-04T22:00:00-04:00",
          capacity: 12,
          note: "Cooking marathon with the kitchen team",
        },
        {
          id: "sat-cooking",
          startIso: "2026-09-05T10:00:00-04:00",
          endIso: "2026-09-05T14:00:00-04:00",
          capacity: 12,
        },
        {
          id: "sat-serving",
          startIso: "2026-09-05T18:00:00-04:00",
          endIso: "2026-09-05T22:00:00-04:00",
          capacity: 15,
          note: "Serving prasadam to guests",
        },
      ],
    },
    {
      id: "decoration",
      title: "Decoration & Altar",
      description:
        "Garlands, flowers, lights, and the festival altar — turn the temple into Vrindavan for Krishna's birthday.",
      icon: "lotus",
      color: "lotus",
      shifts: [
        {
          id: "fri-garlands",
          startIso: "2026-09-04T18:00:00-04:00",
          endIso: "2026-09-04T22:00:00-04:00",
          capacity: 15,
          note: "Garland stringing & hall decor",
        },
        {
          id: "sat-touches",
          startIso: "2026-09-05T09:00:00-04:00",
          endIso: "2026-09-05T13:00:00-04:00",
          capacity: 10,
          note: "Final touches before doors open",
        },
      ],
    },
    {
      id: "welcome",
      title: "Guest Welcome & Registration",
      description:
        "Be the first smile guests meet — greet, guide first-timers, and help at the welcome desk as the crowd builds toward midnight.",
      icon: "handshake",
      color: "gold",
      shifts: [
        {
          id: "sat-early",
          startIso: "2026-09-05T16:00:00-04:00",
          endIso: "2026-09-05T20:00:00-04:00",
          capacity: 8,
        },
        {
          id: "sat-late",
          startIso: "2026-09-05T20:00:00-04:00",
          endIso: "2026-09-06T00:00:00-04:00",
          capacity: 8,
          note: "Through the midnight arati crowd",
        },
      ],
    },
    {
      id: "operations",
      title: "Festival Operations",
      description:
        "Keep the festival flowing — darshan lines, shoe racks, aisles, and a calm pair of hands wherever the moment needs one.",
      icon: "flame",
      color: "saffron",
      shifts: [
        {
          id: "sat-early",
          startIso: "2026-09-05T16:00:00-04:00",
          endIso: "2026-09-05T20:00:00-04:00",
          capacity: 10,
        },
        {
          id: "sat-midnight",
          startIso: "2026-09-05T20:00:00-04:00",
          endIso: "2026-09-06T00:30:00-04:00",
          capacity: 10,
          note: "Includes the midnight abhisheka rush",
        },
      ],
    },
    {
      id: "cleanup",
      title: "Cleanup & Restore",
      description:
        "The unsung heroes. Close down festival night and reset the temple for Nandotsava and Srila Prabhupada's Vyasa-puja on Sunday.",
      icon: "sparkle",
      color: "krishna",
      shifts: [
        {
          id: "sat-night",
          startIso: "2026-09-05T22:00:00-04:00",
          endIso: "2026-09-06T01:00:00-04:00",
          capacity: 12,
          note: "Late-night crew — prasadam and kirtan included",
        },
        {
          id: "sun-restore",
          startIso: "2026-09-06T10:00:00-04:00",
          endIso: "2026-09-06T13:00:00-04:00",
          capacity: 10,
          note: "Sunday reset + Nandotsava",
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
