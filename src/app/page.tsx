/**
 * Home page — Server Component
 *
 * The landing page for Gita Life NYC.
 * Fetches programs for the preview section and testimonials.
 */

import { getPrograms } from "@/lib/programs";
import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const programs = await getPrograms();
  return <HomePage programs={programs} />;
}
