/**
 * Date display helpers tuned for a Luma-driven program calendar.
 *
 * All formatting is normalized to America/New_York since this is a
 * NYC-based community calendar. Times displayed match the time the
 * event was scheduled at, not the viewer's local time.
 */

const TZ = "America/New_York";

const MONTH_SHORT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: TZ,
});
const DAY_NUM = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  timeZone: TZ,
});
const DOW_SHORT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: TZ,
});
const DOW_LONG = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: TZ,
});
const MONTH_LONG = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: TZ,
});
const TIME_SHORT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TZ,
});

export interface DatePill {
  /** "APR" */
  monthShort: string;
  /** "25" */
  day: string;
  /** "SAT" */
  dowShort: string;
}

export function getDatePill(iso: string): DatePill {
  const d = new Date(iso);
  return {
    monthShort: MONTH_SHORT.format(d).toUpperCase(),
    day: DAY_NUM.format(d),
    dowShort: DOW_SHORT.format(d).toUpperCase(),
  };
}

export function formatTime(iso: string): string {
  return TIME_SHORT.format(new Date(iso));
}

export function formatTimeRange(startIso: string, endIso?: string): string {
  const start = formatTime(startIso);
  if (!endIso) return start;
  return `${start} – ${formatTime(endIso)}`;
}

/**
 * "Today", "Tomorrow", "Saturday", or "Sat, Apr 25" depending on
 * proximity. All comparisons are anchored in America/New_York so a
 * 9pm-EST event doesn't get labeled "tomorrow" for an east-coast
 * user just because it's after midnight UTC.
 */
function nyDateKey(d: Date): string {
  // YYYY-MM-DD in NY tz
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TZ,
  }).format(d);
}

export function formatRelativeDay(iso: string, now: Date = new Date()): string {
  const event = new Date(iso);
  const eventKey = nyDateKey(event);
  const todayKey = nyDateKey(now);

  if (eventKey === todayKey) return "Today";

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (eventKey === nyDateKey(tomorrow)) return "Tomorrow";

  const dayDiff =
    (event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  // Within the next 6 days — show day name only ("Saturday").
  if (dayDiff > 0 && dayDiff < 6.5) return DOW_LONG.format(event);

  // Otherwise: "Sat, Apr 25"
  return `${DOW_SHORT.format(event)}, ${MONTH_LONG.format(event)} ${DAY_NUM.format(event)}`;
}

export function isLive(startIso: string, endIso: string, now: Date = new Date()): boolean {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const t = now.getTime();
  return t >= start && t <= end;
}

/** Used by the LumaCountdown to break a duration into d/h/m/s pieces. */
export function breakdown(ms: number): { d: number; h: number; m: number; s: number } {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { d, h, m, s };
}

/* ------------------------------------------------------------------ */
/*  Tag → accent color                                                 */
/*  Map tag names to brand accents deterministically. Specific names   */
/*  get tuned colors; everything else hashes onto the rotation.        */
/* ------------------------------------------------------------------ */
const TAG_ROTATION = ["saffron", "gold", "peacock", "lotus", "krishna"] as const;
export type TagAccent = (typeof TAG_ROTATION)[number];

const TAG_OVERRIDES: Record<string, TagAccent> = {
  // Lowercased keys — see resolve()
  volunteer: "peacock",
  retreat: "gold",
  retreats: "gold",
  festival: "saffron",
  festivals: "saffron",
  class: "krishna",
  classes: "krishna",
  kirtan: "lotus",
  harinam: "lotus",
  "sunday program": "lotus",
  "student centric": "krishna",
  "professional centric": "peacock",
  prasadam: "saffron",
};

export function getTagAccent(tag: string): TagAccent {
  const key = tag.trim().toLowerCase();
  if (key in TAG_OVERRIDES) return TAG_OVERRIDES[key];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return TAG_ROTATION[Math.abs(hash) % TAG_ROTATION.length];
}
