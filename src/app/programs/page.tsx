/**
 * Programs page — Server Component
 *
 * The interactive split-view with program list + map.
 * Previously at / — now lives at /programs.
 */

import { getPrograms } from "@/lib/programs";
import SplitView from "@/components/SplitView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Programs — Gita Life NYC",
  description: "Explore upcoming programs, kirtans, retreats, and wisdom sessions across NYC.",
};

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return <SplitView programs={programs} />;
}
