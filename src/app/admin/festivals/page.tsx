/**
 * /admin/festivals — event management console for /festival.
 *
 * Create, edit, publish, and duplicate dated events (monthly Youth
 * Festival, big festivals, volunteer crews). Weekly programs live in
 * /admin/weekly; this console only touches Program rows that carry an
 * eventStartAt.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllFestivalEvents } from "@/lib/festivals";
import FestivalsConsole from "@/components/admin/FestivalsConsole";

export const dynamic = "force-dynamic";

export default async function AdminFestivalsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const events = await getAllFestivalEvents();
  return <FestivalsConsole events={events} />;
}
