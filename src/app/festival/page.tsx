/**
 * Festival page — Server Component
 *
 * Public hub for dated gatherings: the monthly Youth Festival, big
 * festivals (Ratha Yatra, Janmashtami), and volunteer crews.
 *
 * Registration is in-house (no Luma): inline form per event, a
 * confirmation email with a calendar invite from
 * no-reply@gitalifenyc.com, a day-before reminder, and a Google Sheet
 * row per registrant for door check-in. Events are created and managed
 * in the /admin/festivals console.
 */

import type { Metadata } from "next";
import { getPrismaClient } from "@/lib/prisma";
import { getFestivalEvents } from "@/lib/festivals";
import { ensureSeededFestivalEvents } from "@/lib/myf";
import FestivalsPage from "@/components/festival/FestivalsPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Festivals & Gatherings — Gita Life NYC",
  description:
    "Monthly Youth Festivals, Ratha Yatra, Janmashtami, and volunteer crews. Save your spot — free entry, prasadam always included.",
  openGraph: {
    title: "Festivals & Gatherings — Gita Life NYC",
    description:
      "The big nights: monthly Youth Festivals, Ratha Yatra, Janmashtami, and the volunteer crews that make them happen.",
    type: "website",
  },
};

export default async function Page() {
  // Code-managed events (MYF editions in src/data/myf.ts) sync here so
  // they appear without any /admin/festivals setup.
  await ensureSeededFestivalEvents(getPrismaClient());
  const { upcoming, past } = await getFestivalEvents();
  return <FestivalsPage upcoming={upcoming} past={past} />;
}
