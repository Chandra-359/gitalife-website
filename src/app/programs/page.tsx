/**
 * Programs page — Server Component
 *
 * Netflix/Paramount+ inspired streaming-style program browser.
 * Dark cinematic theme with hero banner, category rows, and detail modals.
 */

import { getPrograms } from "@/lib/programs";
import StreamBrowse from "@/components/StreamBrowse";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Programs — Gita Life NYC",
  description: "Explore upcoming programs, kirtans, retreats, and wisdom sessions across NYC.",
};

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return <StreamBrowse programs={programs} />;
}
