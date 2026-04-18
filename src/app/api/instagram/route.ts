/**
 * GET /api/instagram — Fetches recent posts from @gitalifenyc.
 *
 * WIRING INSTRUCTIONS:
 *   1. Create a Meta/Facebook app and enable Instagram Basic Display API.
 *   2. Generate a long-lived access token for @gitalifenyc.
 *   3. Set env var: IG_ACCESS_TOKEN="..."
 *   4. (Optional) IG_LIMIT="8" to control tile count (default 8).
 *
 * When the token is missing, this route returns an empty array with
 * `source: "placeholder"` so the client can fall back to placeholder tiles.
 * Responses are cached at the edge for 15 minutes to respect rate limits.
 */

import { NextResponse } from "next/server";

interface IgPost {
  id: string;
  caption?: string;
  media_url: string;
  permalink: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnail_url?: string;
  timestamp?: string;
}

interface IgResponse {
  source: "instagram" | "placeholder";
  posts: IgPost[];
}

const IG_ENDPOINT = "https://graph.instagram.com/me/media";
const IG_FIELDS = "id,caption,media_url,permalink,media_type,thumbnail_url,timestamp";
const DEFAULT_LIMIT = 8;
const CACHE_SECONDS = 60 * 15;

export async function GET(): Promise<NextResponse<IgResponse>> {
  const token = process.env.IG_ACCESS_TOKEN;
  const limit = Number(process.env.IG_LIMIT) || DEFAULT_LIMIT;

  if (!token) {
    return NextResponse.json({ source: "placeholder", posts: [] });
  }

  try {
    const url = new URL(IG_ENDPOINT);
    url.searchParams.set("fields", IG_FIELDS);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", token);

    const res = await fetch(url.toString(), {
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) {
      throw new Error(`Instagram API ${res.status}`);
    }

    const data = (await res.json()) as { data?: IgPost[] };
    const posts = (data.data ?? []).slice(0, limit);

    return NextResponse.json({ source: "instagram", posts });
  } catch (err) {
    console.warn("[api/instagram] Falling back to placeholder:", err);
    return NextResponse.json({ source: "placeholder", posts: [] });
  }
}
