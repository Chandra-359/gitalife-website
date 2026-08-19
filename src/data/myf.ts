/**
 * myf.ts — Monthly Youth Festival (MYF) editions, seeded from code.
 *
 * The next MYF lives here the way Bhajan Clubbing lives in
 * bhajanClubbing.ts: this file is the source of truth, and
 * ensureSeededFestivalEvents() (src/lib/myf.ts) upserts each entry into
 * the Program table so the event shows up on /festival with the inline
 * registration form, QR entry-pass email, Google Sheet logging, and the
 * admin check-in board — no console setup needed.
 *
 * WHERE TO EDIT EACH THING:
 *  - Date/time/venue/copy → the seed entry below (re-deploys re-sync it;
 *    console edits to these fields get overwritten on the next sync)
 *  - Poster              → drop the image in public/festival/ and set
 *    posterUrl (e.g. "/festival/prerana-aug-2026.jpg"), or upload it in
 *    /admin/festivals — a console-uploaded poster is kept whenever
 *    posterUrl here is null
 *  - Capacity            → capacity (null = unlimited, counted in guests)
 *  - Next edition        → add a new entry with a NEW programId and move
 *    the old one out (past events stay in the DB and on the photo wall)
 */

export interface FestivalEventSeed {
  /** Fixed Program id — keeps every registration attached to one DB row. */
  programId: string;
  title: string;
  /** One of FESTIVAL_CATEGORY_ACCENTS in data/festivals.ts. */
  category: string;
  description: string;
  /** ET-offset ISO instants — drive the date/time labels + calendar invites. */
  startIso: string;
  endIso: string;
  timeLabel: string;
  venueName: string;
  address: string;
  lat: number;
  lng: number;
  /** Path under public/ or an uploaded URL; null keeps any console upload. */
  posterUrl: string | null;
  /** Chips on the event card + bullets in the reminder email. */
  highlights: string[];
  /** Hard cap counted in guests; null = unlimited. */
  capacity: number | null;
  speakerName?: string;
  speakerTitle?: string;
  featured?: boolean;
}

/** MYF August 2026 — Prerana Festival with Govinda Krishna Das (GKD). */
export const MYF_PRERANA: FestivalEventSeed = {
  programId: "myf-prerana-2026-08",
  title: "Prerana Festival",
  category: "Youth Festival",
  description:
    "This month's youth festival takes on the two battles everyone is fighting: winning over stress and handling failures. Govinda Krishna Das (GKD) unpacks the Bhagavad Gita's answer, wrapped in live kirtan and a free prasadam dinner. Free entry — bring your friends.",
  startIso: "2026-08-29T18:00:00-04:00",
  endIso: "2026-08-29T21:00:00-04:00",
  timeLabel: "6:00 PM Onwards",
  venueName: "Sri Sri Radha Govinda Mandir",
  address: "305 Schermerhorn St, Brooklyn, NY 11217",
  lat: 40.68761,
  lng: -73.98252,
  posterUrl: null,
  highlights: [
    "Talk: Winning Over Stress & Handling Failures",
    "Speaker: Govinda Krishna Das (GKD)",
    "Live kirtan",
    "Free prasadam dinner",
  ],
  capacity: null,
  speakerName: "Govinda Krishna Das (GKD)",
  speakerTitle: "Monk & Speaker",
  featured: true,
};

/** Every code-managed dated event, synced to the DB on /festival loads
 *  and registrations. Add next month's MYF here. */
export const SEEDED_FESTIVAL_EVENTS: FestivalEventSeed[] = [MYF_PRERANA];
