import { NextResponse } from "next/server";
import { appendReviewToSheet, sheetsConfigured } from "@/lib/sheets";

/**
 * POST /api/bhajanclubbing/feedback — post-event feedback submissions.
 *
 * Each response is appended to the "reviews" tab of the same Google
 * spreadsheet the Bhajan Clubbing registrations land in (the tab is
 * created with a header row on first use). No database row — the sheet
 * IS the store the organizers read.
 *
 * Public endpoint, so inputs are clamped hard and a honeypot field
 * ("website") silently swallows bot posts.
 */

const RATING_MIN = 1;
const RATING_MAX = 5;

const clamp = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, rating, enjoyed, programsInterest, programs, inspire, suggestions, website } = body as Record<
      string,
      unknown
    >;

    // Honeypot: real visitors never fill this hidden field
    if (typeof website === "string" && website.trim()) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const ratingNum = Number.parseInt(String(rating), 10);
    if (!Number.isInteger(ratingNum) || ratingNum < RATING_MIN || ratingNum > RATING_MAX) {
      return NextResponse.json({ error: "Please pick an overall rating" }, { status: 400 });
    }

    if (!sheetsConfigured()) {
      return NextResponse.json(
        { error: "Feedback is briefly offline — please try again later" },
        { status: 503 },
      );
    }

    const programsList = Array.isArray(programs)
      ? programs
          .filter((p): p is string => typeof p === "string")
          .map((p) => p.trim().slice(0, 60))
          .filter(Boolean)
          .slice(0, 10)
          .join(", ")
      : "";

    const saved = await appendReviewToSheet({
      name: clamp(name, 100),
      rating: ratingNum,
      enjoyed: clamp(enjoyed, 2000),
      programsInterest: clamp(programsInterest, 40),
      programs: programsList,
      inspire: clamp(inspire, 40),
      suggestions: clamp(suggestions, 2000),
    });

    if (!saved) {
      return NextResponse.json(
        { error: "Couldn't save your feedback — please try again" },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json({ error: "Something went wrong — please try again" }, { status: 500 });
  }
}
