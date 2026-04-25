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

/* ------------------------------------------------------------------ */
/*  Week bucketing                                                     */
/*  Group events into Monday-anchored weeks (in America/New_York).     */
/*  Used by the events grid to give long calendars visual rhythm.     */
/* ------------------------------------------------------------------ */
interface NyDateParts {
  year: number;
  month: number;
  day: number;
  weekday: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
}

const WEEKDAY_FROM_SHORT: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

function getNyDateParts(d: Date): NyDateParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    timeZone: TZ,
  });
  const map = new Map<string, string>();
  for (const p of fmt.formatToParts(d)) map.set(p.type, p.value);
  return {
    year: Number(map.get("year")),
    month: Number(map.get("month")),
    day: Number(map.get("day")),
    weekday: WEEKDAY_FROM_SHORT[map.get("weekday") ?? "Mon"] ?? 1,
  };
}

interface WeekMonday {
  year: number;
  month: number; // 1-indexed
  day: number;
  /** epoch ms of midnight UTC at this Monday — stable sort key */
  utcMs: number;
}

function getWeekMonday(d: Date): WeekMonday {
  const { year, month, day, weekday } = getNyDateParts(d);
  // Monday-anchored week: subtract (weekday === 0 ? 6 : weekday - 1)
  const subtract = weekday === 0 ? 6 : weekday - 1;
  // Use a UTC scratch date for arithmetic (DST-stable for whole-day shifts).
  const scratch = new Date(Date.UTC(year, month - 1, day));
  scratch.setUTCDate(scratch.getUTCDate() - subtract);
  return {
    year: scratch.getUTCFullYear(),
    month: scratch.getUTCMonth() + 1,
    day: scratch.getUTCDate(),
    utcMs: scratch.getTime(),
  };
}

export interface EventWeekBucket<T> {
  key: string;
  label: string;
  /** Numeric sort key — earlier weeks first */
  sortKey: number;
  events: T[];
}

/**
 * Group events into Monday-Sunday weeks, labeling the current and
 * upcoming week with friendly labels and the rest as "Week of May 12".
 */
export function bucketEventsByWeek<T extends { startAt: string }>(
  events: T[],
  now: Date = new Date(),
): EventWeekBucket<T>[] {
  const todayMonday = getWeekMonday(now);
  const nextMonday = new Date(todayMonday.utcMs);
  nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  const nextMondayMs = nextMonday.getTime();

  const buckets = new Map<string, EventWeekBucket<T>>();

  for (const event of events) {
    const eventDate = new Date(event.startAt);
    const monday = getWeekMonday(eventDate);
    const key = `${monday.year}-${String(monday.month).padStart(2, "0")}-${String(monday.day).padStart(2, "0")}`;

    let label: string;
    if (monday.utcMs === todayMonday.utcMs) {
      label = "This week";
    } else if (monday.utcMs === nextMondayMs) {
      label = "Next week";
    } else {
      const ref = new Date(monday.utcMs);
      // Format the Monday's month + day. Use UTC since `monday.utcMs`
      // represents midnight UTC at that calendar date.
      const monthName = new Intl.DateTimeFormat("en-US", {
        month: "long",
        timeZone: "UTC",
      }).format(ref);
      label = `Week of ${monthName} ${monday.day}`;
    }

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { key, label, sortKey: monday.utcMs, events: [] };
      buckets.set(key, bucket);
    }
    bucket.events.push(event);
  }

  return Array.from(buckets.values()).sort((a, b) => a.sortKey - b.sortKey);
}
