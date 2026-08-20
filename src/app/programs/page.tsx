/**
 * Programs page — Server Component
 *
 * The public hub for the three flagship weekly programs (Newport,
 * Jersey City, Brooklyn). Distribution endpoint for QR codes.
 *
 * Registration is handled in-house (no Luma): one form per program,
 * a welcome email with a recurring calendar invite from
 * no-reply@gitalifenyc.com, weekly topic reminders until unsubscribe,
 * and a Google Sheet row per registrant for door check-in.
 *
 * Static schedule/venue data lives in src/data/weeklyPrograms.ts; the
 * week-to-week topic, poster, and media come from the database and are
 * edited at /admin/weekly.
 */

import type { Metadata } from "next";
import { getPrograms } from "@/lib/programs";
import {
  getWeeklyPrograms,
  nextOccurrence,
  occurrenceLabel,
} from "@/lib/weeklyPrograms";
import WeeklyProgramsPage from "@/components/programs/WeeklyProgramsPage";
import { mintFormToken } from "@/lib/formGuard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Weekly Programs — Gita Life NYC",
  description:
    "Three weekly Gita gatherings — Newport (Friday), Jersey City (Saturday), and ISKCON Brooklyn (Sunday). Register once, get a calendar invite, and just show up. Free, prasadam included.",
  openGraph: {
    title: "Weekly Programs — Gita Life NYC",
    description:
      "Register once for your neighborhood Gita program — Newport, Jersey City, or Brooklyn. Kirtan, wisdom, and prasadam every week.",
    type: "website",
  },
};

export default async function Page() {
  const [programs, weekly] = await Promise.all([
    getPrograms(),
    getWeeklyPrograms(),
  ]);

  const testimonials = programs
    .filter((p) => p.testimonial && p.testimonialAuthor)
    .slice(0, 3);

  const withNext = weekly.map((p) => ({
    ...p,
    nextLabel: occurrenceLabel(nextOccurrence(p)),
  }));

  // Spam guard: signed render timestamp echoed back by the forms
  return <WeeklyProgramsPage programs={withNext} testimonials={testimonials} formToken={mintFormToken()} />;
}
