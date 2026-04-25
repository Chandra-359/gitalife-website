/**
 * Luma calendar fetcher.
 *
 * The shared site calendar is configured at LUMA_CALENDAR_ID in
 * src/data/home.ts. We hit Luma's calendar items endpoint server-side
 * (the same URL their own iframe uses), normalize the response into a
 * stable shape, and cache for 5 minutes. The endpoint is unofficial
 * but stable — if it ever changes, the page falls back to the iframe
 * via getLumaEventsWithFallback().
 */

import { LUMA_CALENDAR_ID } from "@/data/home";

export interface LumaEvent {
  apiId: string;
  name: string;
  description?: string;
  coverUrl?: string;
  /** ISO-8601 UTC */
  startAt: string;
  /** ISO-8601 UTC */
  endAt: string;
  timezone?: string;
  /** Full registration URL on Luma */
  url: string;
  location?: {
    venue?: string;
    address?: string;
    city?: string;
  };
  tags: string[];
}

export type LumaPeriod = "future" | "past";

/* ------------------------------------------------------------------ */
/*  Internal types — kept loose; the Luma API is unofficial.           */
/* ------------------------------------------------------------------ */
interface ApiGeo {
  city?: unknown;
  city_state?: unknown;
  address?: unknown;
  full_address?: unknown;
  place_id?: unknown;
  venue_name?: unknown;
  name?: unknown;
}

interface ApiEvent {
  api_id?: unknown;
  name?: unknown;
  description?: unknown;
  cover_url?: unknown;
  start_at?: unknown;
  end_at?: unknown;
  timezone?: unknown;
  url?: unknown;
  geo_address_json?: ApiGeo | null;
}

interface ApiTag {
  name?: unknown;
  api_id?: unknown;
}

interface ApiEntry {
  api_id?: unknown;
  event?: ApiEvent;
  tags?: ApiTag[];
}

interface ApiResponse {
  entries?: ApiEntry[];
  has_more?: boolean;
  next_cursor?: string | null;
}

const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;

function pickStr(...candidates: unknown[]): string | undefined {
  for (const c of candidates) if (isStr(c)) return c;
  return undefined;
}

function normalize(entry: ApiEntry): LumaEvent | null {
  const e = entry.event;
  if (!e) return null;
  const apiId = pickStr(e.api_id);
  const name = pickStr(e.name);
  const startAt = pickStr(e.start_at);
  const endAt = pickStr(e.end_at);
  if (!apiId || !name || !startAt || !endAt) return null;

  const slug = pickStr(e.url) ?? apiId;
  const geo = e.geo_address_json ?? undefined;

  const location = geo
    ? {
        venue: pickStr(geo.venue_name, geo.name),
        address: pickStr(geo.full_address, geo.address),
        city: pickStr(geo.city_state, geo.city),
      }
    : undefined;

  const tags = Array.isArray(entry.tags)
    ? entry.tags.map((t) => pickStr(t.name)).filter(isStr)
    : [];

  return {
    apiId,
    name,
    description: pickStr(e.description),
    coverUrl: pickStr(e.cover_url),
    startAt,
    endAt,
    timezone: pickStr(e.timezone),
    url: `https://lu.ma/${slug}`,
    location,
    tags,
  };
}

/**
 * Fetch events for the configured calendar from Luma.
 * Returns [] on any error — callers should handle the empty case.
 */
export async function getLumaEvents(opts?: {
  period?: LumaPeriod;
  limit?: number;
}): Promise<LumaEvent[]> {
  const period: LumaPeriod = opts?.period ?? "future";
  const limit = opts?.limit ?? 50;

  const url = new URL("https://api.lu.ma/calendar/get-items");
  url.searchParams.set("calendar_api_id", LUMA_CALENDAR_ID);
  url.searchParams.set("pagination_limit", String(limit));
  url.searchParams.set("period", period);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        // Mimic a real client to avoid bot heuristics on Luma's edge.
        "user-agent":
          "Mozilla/5.0 (compatible; GitaLifeNYC/1.0; +https://gitalife.nyc/programs)",
      },
      next: { revalidate: 300, tags: ["luma-calendar", `luma-${period}`] },
    });
    if (!res.ok) {
      console.warn(`[luma] non-OK ${res.status} for ${period}`);
      return [];
    }
    const data = (await res.json()) as ApiResponse;
    const entries = Array.isArray(data.entries) ? data.entries : [];
    const events = entries
      .map(normalize)
      .filter((e): e is LumaEvent => e !== null);
    // Future events ascending, past events descending — most relevant first.
    events.sort((a, b) => {
      const t = new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
      return period === "future" ? t : -t;
    });
    return events;
  } catch (err) {
    console.warn("[luma] fetch failed:", err);
    return [];
  }
}
