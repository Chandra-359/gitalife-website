/**
 * schedule.ts — Live weekly schedule via Google Sheets
 *
 * TWO OPTIONS FOR WIRING THIS UP:
 *
 * ── Option A: Published CSV (zero auth, recommended for a simple read-only sheet) ──
 *   1. In Google Sheets: File → Share → Publish to the web → select the schedule
 *      tab → "Comma-separated values (.csv)" → Publish.
 *   2. Copy the URL Google gives you (ends in `/pub?output=csv`).
 *   3. Set env var:  GITA_SCHEDULE_CSV_URL="https://docs.google.com/..."
 *
 * ── Option B: Sheets API v4 (auth, better for private sheets) ──
 *   1. Create a service account in Google Cloud, download the JSON key.
 *   2. Share the sheet with the service account email.
 *   3. Set env vars:
 *        GITA_SHEET_ID="..."
 *        GITA_SHEET_RANGE="Schedule!A2:G"
 *        GOOGLE_APPLICATION_CREDENTIALS_JSON="<base64 of the JSON key>"
 *   4. Swap fetchSchedule() below to call the Sheets API instead of CSV.
 *
 * Expected sheet columns (Option A):
 *   day | time | title | location | neighborhood | kind | blurb
 *
 * Falls back to the hardcoded WEEKLY_SCHEDULE in src/data/home.ts
 * if the env var is missing or the fetch fails — so the site never breaks.
 */

import { WEEKLY_SCHEDULE, type WeeklyClass } from "@/data/home";

const CSV_URL = process.env.GITA_SCHEDULE_CSV_URL;

/**
 * Simple CSV parser that handles quoted fields.
 * Good enough for the schedule; swap for csv-parse if headers get complex.
 */
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"' && csv[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cur.push(field);
      field = "";
    } else if (ch === "\n") {
      cur.push(field);
      rows.push(cur);
      cur = [];
      field = "";
    } else if (ch === "\r") {
      // ignore
    } else {
      field += ch;
    }
  }
  if (field || cur.length) {
    cur.push(field);
    rows.push(cur);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

function normalizeRow(row: string[]): WeeklyClass | null {
  const [day, time, title, location, neighborhood, kind] = row.map((c) => c.trim());
  if (!day || !time || !title) return null;

  const validDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ] as const;
  const d = validDays.find((v) => v.toLowerCase() === day.toLowerCase());
  if (!d) return null;

  const validKinds = ["gita-class", "harinam", "japa", "book-reading"] as const;
  const k = validKinds.find((v) => v === kind) ?? "gita-class";

  return {
    day: d,
    time,
    title,
    location: location || "TBD",
    neighborhood: neighborhood || "",
    kind: k,
  };
}

/**
 * Fetch the weekly schedule.
 *
 * Cached for 10 minutes by Next.js so we don't hammer the Sheet on every request.
 * Falls back to the static WEEKLY_SCHEDULE if the env var isn't set or the
 * fetch fails — keeping the UI intact when offline or misconfigured.
 */
export async function fetchSchedule(): Promise<WeeklyClass[]> {
  if (!CSV_URL) return WEEKLY_SCHEDULE;

  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const csv = await res.text();
    const rows = parseCsv(csv);
    // Skip the header row
    const dataRows = rows.slice(1);
    const parsed = dataRows.map(normalizeRow).filter((x): x is WeeklyClass => x !== null);
    return parsed.length > 0 ? parsed : WEEKLY_SCHEDULE;
  } catch (err) {
    console.warn("[schedule] Falling back to static WEEKLY_SCHEDULE:", err);
    return WEEKLY_SCHEDULE;
  }
}
