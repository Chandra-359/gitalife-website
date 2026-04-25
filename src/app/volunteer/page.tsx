/**
 * Volunteer page — Server Component
 *
 * Pulls upcoming events from the shared Luma calendar (LUMA_CALENDAR_ID)
 * and filters to those tagged "volunteer". Add a new volunteer event by
 * creating it on Luma with the "volunteer" tag — it shows up here within
 * the cache window (~60s).
 */

import { getLumaEvents } from "@/lib/luma";
import VolunteerPageContent from "@/components/home/VolunteerPageContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Volunteer — Gita Life NYC",
  description:
    "Seva opportunities at ISKCON Brooklyn — from one-hour drop-ins to long-term stewardship. Pick a rung that fits your life.",
};

export default async function VolunteerPage() {
  const all = await getLumaEvents({ period: "future", limit: 50 });
  const volunteerEvents = all.filter((e) =>
    e.tags.some((t) => t.toLowerCase() === "volunteer"),
  );

  return <VolunteerPageContent events={volunteerEvents} />;
}
