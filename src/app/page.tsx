/**
 * Home page — Server Component
 *
 * The landing page for Gita Life NYC.
 * Fetches programs (for testimonials) and the next slice of upcoming
 * Luma events (for the homepage Featured / Upcoming section).
 */

import { getPrograms } from "@/lib/programs";
import { getLumaEvents } from "@/lib/luma";
import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [programs, events] = await Promise.all([
    getPrograms(),
    getLumaEvents({ period: "future", limit: 4 }),
  ]);
  return <HomePage programs={programs} events={events} />;
}
