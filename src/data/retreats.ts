/**
 * retreats.ts — weekend retreats with in-house registration (client-safe).
 *
 * Unlike festivals, a retreat is invite-only: nothing here is linked from
 * the nav bar or /festival, and the page is marked noindex. Organizers
 * share the link (/retreat/<slug>) directly with the people they want to
 * register. Payment is settled by Zelle outside the site — the page and
 * the emails show the Zelle QR + number, the attendee ticks "I've sent
 * it", and organizers verify on the Google Sheet.
 *
 * HOW TO ONBOARD THE NEXT RETREAT (this file is the whole setup):
 *  1. Copy FALL_RETREAT_2026 below, give it a NEW unique `id` and `slug`
 *     (registrations, the sheet tab, and the URL key on them).
 *  2. Set the dates (ET-offset ISO instants), venue, pricing, poster
 *     (drop the image in public/retreat/), and the Zelle details.
 *  3. Add it to RETREATS and set status "published". Deploy.
 *
 * When registration closes, flip status to "closed" — the page stays up
 * with the form disabled; rows already collected are untouched. Never
 * reuse an old id for a new retreat.
 */

export type Occupation = "Student" | "Working professional";

export const OCCUPATIONS: Occupation[] = ["Student", "Working professional"];

export interface RetreatZelle {
  /** The Zelle-enrolled phone number (or email) attendees send to.
   *  Shown verbatim on the page and in every email. */
  phone: string;
  /** Name attendees should see when Zelle asks them to confirm. */
  recipientName: string;
  /** Path under public/ of the Zelle QR image (export it from the bank
   *  app → "My QR code"), e.g. "/retreat/zelle-qr.png". null = no QR yet,
   *  the page shows a placeholder frame where it will go. */
  qrUrl: string | null;
}

export interface RetreatConfig {
  /** Stable Program row id — registrations key on it. Never change. */
  id: string;
  /** URL key: /retreat/<slug>. */
  slug: string;
  title: string;
  /** e.g. "Fall Retreat '26" as printed on the poster. */
  shortTitle: string;
  tagline: string;
  description: string;
  /** ET-offset ISO instants for the whole retreat (drive the calendar
   *  invite, the date labels, and the reminder schedule). */
  startIso: string;
  endIso: string;
  /** Free-form arrival / departure guidance shown with the dates. */
  timingNote: string;
  venueName: string;
  address: string;
  /** Approximate coordinates (Program rows require them; never shown). */
  lat: number;
  lng: number;
  posterUrl: string;
  /** Exact Google Sheet tab registrations land on (created on first use). */
  sheetTab: string;
  highlights: string[];
  specialGuest?: string;
  /** USD per person by occupation. */
  pricing: Record<Occupation, number>;
  zelle: RetreatZelle;
  /** Hard cap on confirmed registrations; null = unlimited. */
  capacity: number | null;
  /** draft = 404; published = open for registration; closed = form off. */
  status: "draft" | "published" | "closed";
  contactEmail: string;
}

export const RETREAT_TZ = "America/New_York";

/* ------------------------------------------------------------------ */
/*  Fall Retreat '26 — Nilachal Dham Yoga Farm, Sept 25–27             */
/* ------------------------------------------------------------------ */

export const FALL_RETREAT_2026: RetreatConfig = {
  id: "retreat-fall-2026",
  slug: "fall-2026",
  title: "Fall Retreat 2026",
  shortTitle: "Fall Retreat '26",
  tagline: "Three days out of the city — association, drama, prasadam, kirtan.",
  description:
    "Gita Life NYC invites you to the Fall Retreat at Nilachal Dham Yoga Farm: a weekend of kirtan, Gita wisdom, drama, home-cooked prasadam, and the kind of association you can't get in the city. Special guest HG Radheshyam Prabhu joins us for the weekend.",
  // Arrive Friday evening, leave Sunday afternoon — adjust once the
  // schedule is final. The day-of reminder goes out Friday morning.
  startIso: "2026-09-25T17:00:00-04:00",
  endIso: "2026-09-27T15:00:00-04:00",
  timingNote: "Arrive Friday evening · Depart Sunday afternoon",
  venueName: "Nilachal Dham Yoga Farm",
  address: "279 Joe Meltz Road, Warwick, MD 21912",
  lat: 39.43,
  lng: -75.83,
  posterUrl: "/retreat/fall-retreat-2026.jpg",
  sheetTab: "Fall Retreat 2026 Registrations",
  highlights: ["Association", "Drama", "Prasadam", "Kirtan"],
  specialGuest: "HG Radheshyam Prabhu",
  pricing: {
    Student: 50,
    "Working professional": 75,
  },
  zelle: {
    // The number enrolled with Zelle (it's what the QR below encodes);
    // the QR is the "Send Money with Zelle" code exported from the bank
    // app, cropped to just the code.
    phone: "(551) 998-7444",
    recipientName: "Kaushal Solanki",
    qrUrl: "/retreat/zelle-qr.png",
  },
  capacity: null,
  status: "published",
  contactEmail: "programs@gitalifenyc.com",
};

/** Every retreat the site knows about, newest first. */
export const RETREATS: RetreatConfig[] = [FALL_RETREAT_2026];

/* ------------------------------------------------------------------ */
/*  Shared helpers (safe on client and server)                         */
/* ------------------------------------------------------------------ */

export function findRetreatBySlug(slug: string): RetreatConfig | undefined {
  return RETREATS.find((r) => r.slug === slug);
}

export function findRetreatById(id: string): RetreatConfig | undefined {
  return RETREATS.find((r) => r.id === id);
}

export function isOccupation(value: unknown): value is Occupation {
  return typeof value === "string" && (OCCUPATIONS as string[]).includes(value);
}

/** Price in whole dollars for an occupation. */
export function retreatPrice(retreat: RetreatConfig, occupation: Occupation): number {
  return retreat.pricing[occupation];
}

export function formatUsd(dollars: number): string {
  return `$${dollars.toLocaleString("en-US")}`;
}

/** Suggested Zelle memo so payments are easy to match to a row. */
export function zelleMemo(retreat: RetreatConfig, name: string): string {
  return `${retreat.shortTitle} – ${name.trim() || "your name"}`;
}

export function retreatMapsUrl(retreat: RetreatConfig): string {
  return `https://maps.google.com/?q=${encodeURIComponent(`${retreat.venueName}, ${retreat.address}`)}`;
}

/** "Friday, September 25 – Sunday, September 27, 2026" */
export function retreatDatesLabel(retreat: RetreatConfig): string {
  const day = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: RETREAT_TZ, ...opts }).format(new Date(iso));
  return `${day(retreat.startIso, { weekday: "long", month: "long", day: "numeric" })} – ${day(retreat.endIso, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`;
}

/** "Sept 25 – 27" — compact poster-style form. */
export function retreatDatesShort(retreat: RetreatConfig): string {
  const fmt = (iso: string, withMonth: boolean) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: RETREAT_TZ,
      ...(withMonth ? { month: "short" as const } : {}),
      day: "numeric",
    }).format(new Date(iso));
  const first = fmt(retreat.startIso, true);
  const lastWithMonth = fmt(retreat.endIso, true);
  const sameMonth = lastWithMonth.split(" ")[0] === first.split(" ")[0];
  return `${first} – ${sameMonth ? fmt(retreat.endIso, false) : lastWithMonth}`;
}

/** "Friday, September 25" */
export function retreatDayLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: RETREAT_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

/** "5:00 PM EDT" */
export function retreatTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: RETREAT_TZ,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}
