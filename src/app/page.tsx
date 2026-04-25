/**
 * Home page — Server Component
 *
 * The landing page for Gita Life NYC. Fetches the next slice of
 * upcoming Luma events for the homepage Featured / Upcoming section.
 */

import { getLumaEvents } from "@/lib/luma";
import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getLumaEvents({ period: "future", limit: 4 });
  return <HomePage events={events} />;
}
