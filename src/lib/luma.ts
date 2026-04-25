/**
 * Luma calendar fetcher.
 *
 * The shared site calendar is configured at LUMA_CALENDAR_ID in
 * src/data/home.ts. We hit Luma's calendar items endpoint server-side
 * (the same URL their own iframe uses), normalize the response into a
 * stable shape, and cache for 60 seconds — fresh enough that an edit
 * on Luma propagates within a minute, light enough that we don't
 * hammer the API on a popular page.
 *
 * The Luma API is unofficial and field names vary slightly between
 * events (cover_url vs cover_image_url; geo_address_json vs
 * geo_address_info). The parser falls through known aliases for each
 * field so a schema drift on one event doesn't blank our card.
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
/*  Loose accessors over an unknown JSON blob                          */
/* ------------------------------------------------------------------ */
type Json = Record<string, unknown>;

const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isObj = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function get(obj: unknown, key: string): unknown {
  if (!isObj(obj)) return undefined;
  return obj[key];
}

function pickStr(...candidates: unknown[]): string | undefined {
  for (const c of candidates) if (isStr(c)) return c;
  return undefined;
}

/** First non-null/object value among the given keys. */
function pickObj(obj: unknown, ...keys: string[]): Json | undefined {
  for (const k of keys) {
    const v = get(obj, k);
    if (isObj(v)) return v;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  Normalize one entry → LumaEvent                                    */
/* ------------------------------------------------------------------ */
function normalize(entry: unknown): LumaEvent | null {
  // Some endpoints wrap the event under entry.event; some put fields
  // directly on the entry. Try both.
  const e: unknown = isObj(entry) && isObj(entry.event) ? entry.event : entry;
  if (!isObj(e)) return null;

  const apiId = pickStr(e.api_id, get(entry, "api_id"));
  const name = pickStr(e.name, e.title);
  const startAt = pickStr(e.start_at, e.start);
  const endAt = pickStr(e.end_at, e.end);
  if (!apiId || !name || !startAt || !endAt) return null;

  const slug = pickStr(e.url, e.slug) ?? apiId;
  const coverUrl = pickStr(
    e.cover_url,
    e.cover_image_url,
    e.cover_image,
    e.image_url,
    e.social_image_url,
  );
  const description = pickStr(
    e.description,
    e.description_text,
    e.description_md,
    e.description_html,
  );

  // Location can live under several keys depending on event vintage.
  const geo =
    pickObj(e, "geo_address_json", "geo_address_info", "geo_info", "geo") ??
    undefined;
  const location = geo
    ? {
        venue: pickStr(geo.venue_name, geo.name, geo.venue),
        address: pickStr(geo.full_address, geo.address),
        city: pickStr(geo.city_state, geo.city),
      }
    : undefined;
  const hasLocation =
    location && (location.venue || location.address || location.city);

  // Tags: array of either { name } or just strings.
  const tagsRaw =
    (Array.isArray(get(entry, "tags")) && (get(entry, "tags") as unknown[])) ||
    (Array.isArray(e.tags) && (e.tags as unknown[])) ||
    [];
  const tags = tagsRaw
    .map((t) => (isStr(t) ? t : pickStr(get(t, "name"), get(t, "label"))))
    .filter(isStr);

  return {
    apiId,
    name,
    description,
    coverUrl,
    startAt,
    endAt,
    timezone: pickStr(e.timezone),
    url: `https://lu.ma/${slug}`,
    location: hasLocation ? location : undefined,
    tags,
  };
}

/* ------------------------------------------------------------------ */
/*  Public fetcher                                                     */
/* ------------------------------------------------------------------ */
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
      next: { revalidate: 60, tags: ["luma-calendar", `luma-${period}`] },
    });
    if (!res.ok) {
      console.warn(`[luma] non-OK ${res.status} for ${period}`);
      return [];
    }
    const data: unknown = await res.json();
    const entries = Array.isArray(get(data, "entries"))
      ? (get(data, "entries") as unknown[])
      : [];

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
