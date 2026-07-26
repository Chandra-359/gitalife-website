/**
 * weeklyPrograms.ts — the three flagship weekly Gita programs.
 *
 * This file is the single source of truth for everything that almost
 * never changes: where and when each program meets, how to get there,
 * and each program's visual identity on the /programs page.
 *
 * Everything that changes week to week — this week's topic, the poster,
 * photos and videos from recent sessions, the speaker — lives on the
 * matching Program row in the database and is edited from the
 * "This Week" console at /admin/weekly. `getWeeklyPrograms()` in
 * src/lib/weeklyPrograms.ts merges the two.
 *
 * Registration is one-and-done: a person registers once, gets a
 * recurring calendar invite by email, and receives a weekly reminder
 * until they unsubscribe (see /api/cron/reminders).
 */

export interface WeeklyProgram {
  /** Stable Program row id in the database — never change once live. */
  id: string;
  slug: string;
  /** Short place name, e.g. "Newport" */
  name: string;
  /** e.g. "Jersey City, NJ" */
  area: string;
  title: string;
  tagline: string;
  description: string;
  /** Program day, e.g. "Friday" */
  dayOfWeek: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  /** Display label, e.g. "7:00 PM – 9:00 PM" */
  timeLabel: string;
  /** 24h start time in America/New_York, e.g. "19:00" */
  startTime: string;
  durationMinutes: number;
  venueName: string;
  address: string;
  mapsUrl: string;
  transit: string;
  latitude: number;
  longitude: number;
  /** Card accent — from the site's Krishna palette */
  accent: string;
  /** Softer companion tone for gradients/washes */
  accentSoft: string;
  /** Devanagari-style ordinal shown on the chapter card */
  chapterMark: string;
  highlights: string[];
  category: string;
}

export const PROGRAMS_CONTACT_EMAIL = "programs@gitalifenyc.com";

/** From-address for all weekly-program mail. Must be on the domain
 *  verified with the SMTP provider (see .env.example). */
export const PROGRAMS_FROM_EMAIL = "Gita Life NYC <no-reply@gitalifenyc.com>";

export const SITE_URL = "https://www.gitalifenyc.com";

export const WEEKLY_PROGRAMS: WeeklyProgram[] = [
  {
    id: "weekly-newport",
    slug: "newport",
    name: "Newport",
    area: "Jersey City, NJ",
    title: "Newport Gita Night",
    tagline: "Wind down the week with wisdom, kirtan & a home-cooked dinner",
    description:
      "Our Saturday evening Gita class in a cozy Newport apartment — perfect for young professionals in Jersey City. Small-group discussion, kirtan, and a home-cooked dinner.",
    dayOfWeek: "Saturday",
    timeLabel: "7:00 PM – 9:00 PM",
    startTime: "19:00",
    durationMinutes: 120,
    venueName: "Newport Community Space",
    address: "Newport, Jersey City, NJ",
    mapsUrl: "https://maps.google.com/?q=Newport+Jersey+City",
    transit: "PATH to Newport station — 2 min walk",
    latitude: 40.7270,
    longitude: -74.0338,
    accent: "#D9691A",       // saffron
    accentSoft: "#F0A35C",
    chapterMark: "१",   // १
    highlights: ["Small-group Gita discussion", "Live kirtan", "Home-cooked dinner"],
    category: "Wisdom Session",
  },
  {
    id: "weekly-jersey-city",
    slug: "jersey-city",
    name: "Jersey City",
    area: "Jersey City, NJ",
    title: "Jersey City Gita Night",
    tagline: "Scripture study, kirtan & prasadam in the heart of Jersey City",
    description:
      "Saturday evening class in the heart of Jersey City. Ideal for students at NJIT and Rutgers. Expect scripture study, kirtan, and prasadam.",
    dayOfWeek: "Saturday",
    timeLabel: "7:00 PM – 9:00 PM",
    startTime: "19:00",
    durationMinutes: 120,
    venueName: "Jersey City Center",
    address: "Jersey City, NJ",
    mapsUrl: "https://maps.google.com/?q=Jersey+City",
    transit: "PATH or bus lines within walking distance",
    latitude: 40.7215,
    longitude: -74.0475,
    accent: "#A8842A",       // deep gold
    accentSoft: "#C9A248",
    chapterMark: "२",   // २
    highlights: ["Verse-by-verse study", "Kirtan & mantra meditation", "Prasadam dinner"],
    category: "Wisdom Session",
  },
  {
    id: "weekly-brooklyn",
    slug: "brooklyn",
    name: "Brooklyn",
    area: "Brooklyn, NY",
    title: "ISKCON Brooklyn Sunday Program",
    tagline: "The full temple experience — deities, kirtan & Govinda's prasadam",
    description:
      "Our home temple — Sunday morning class in a historic 50-year-old ISKCON center. Deities, kirtan, full temple experience, and Govinda's prasadam.",
    dayOfWeek: "Sunday",
    timeLabel: "10:00 AM – 12:00 PM",
    startTime: "10:00",
    durationMinutes: 120,
    venueName: "ISKCON Brooklyn Temple",
    address: "305 Schermerhorn Street, Brooklyn, NY 11217",
    mapsUrl: "https://maps.google.com/?q=ISKCON+Brooklyn",
    transit: "2, 3, 4, 5, B, Q trains — Hoyt-Schermerhorn or Atlantic Av",
    latitude: 40.6885,
    longitude: -73.9825,
    accent: "#1B2A6B",       // krishna blue
    accentSoft: "#8DA2E8",   // light periwinkle — stays readable on the dark hero
    chapterMark: "३",   // ३
    highlights: ["Temple morning program", "Full kirtan with deities", "Govinda's prasadam feast"],
    category: "Wisdom Session",
  },
];

export function getWeeklyProgramConfig(id: string): WeeklyProgram | undefined {
  return WEEKLY_PROGRAMS.find((p) => p.id === id);
}
