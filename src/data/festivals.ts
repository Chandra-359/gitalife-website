/**
 * festivals.ts (data) — client-safe types & constants for dated events.
 * Server-side fetching lives in src/lib/festivals.ts (Prisma); anything
 * imported by client components must come from here instead.
 */

/** Category → accent color (site palette). */
export const FESTIVAL_CATEGORY_ACCENTS: Record<string, string> = {
  "Youth Festival": "#C84682", // lotus pink
  Festival: "#A8842A",         // deep gold
  Volunteering: "#006D5B",     // peacock green
};
export const DEFAULT_FESTIVAL_ACCENT = "#A8842A";

export const FESTIVAL_CATEGORIES = Object.keys(FESTIVAL_CATEGORY_ACCENTS);

export function festivalAccent(category: string): string {
  return FESTIVAL_CATEGORY_ACCENTS[category] ?? DEFAULT_FESTIVAL_ACCENT;
}

/** Serializable event view shared by the page, emails, and console. */
export interface FestivalEventLive {
  id: string;
  title: string;
  category: string;
  description: string;
  /** ISO-8601 UTC */
  startAt: string;
  /** ISO-8601 UTC (defaults to start + 3h when unset) */
  endAt: string;
  dateLabel: string;   // "Saturday, August 15"
  timeLabel: string;   // "6:00 PM – 9:00 PM EDT"
  venueName: string;
  address: string;
  mapsUrl: string;
  posterUrl: string | null;
  galleryUrls: string[];
  videoUrl: string | null;
  highlights: string[];
  capacity: number | null;
  /** Total confirmed people (sum of guests) */
  registeredCount: number;
  spotsLeft: number | null;
  status: string;
  featured: boolean;
  accent: string;
}
