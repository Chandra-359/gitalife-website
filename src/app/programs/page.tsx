/**
 * Programs page — Server Component
 *
 * The public hub for every Gita Life NYC program. Distribution endpoint
 * for QR codes — must orient new visitors quickly and hand off to Luma
 * for registration.
 *
 * Server-fetches the shared Luma calendar (configured at LUMA_CALENDAR_ID
 * in src/data/home.ts) so cards are rendered with full brand styling.
 * If the Luma fetch fails the section gracefully falls back to the
 * embedded calendar iframe.
 */

import type { Metadata } from "next";
import { getLumaEvents } from "@/lib/luma";
import ProgramsPage from "@/components/programs/ProgramsPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Programs — Gita Life NYC",
  description:
    "Every Gita Life NYC gathering — weekly Gita classes, kirtans, festivals, retreats, and seva — opens for free registration here.",
  openGraph: {
    title: "Programs — Gita Life NYC",
    description:
      "Classes, volunteer opportunities, festivals, and retreats. Free, open to all, registration via Luma.",
    type: "website",
  },
};

export default async function Page() {
  const events = await getLumaEvents({ period: "future", limit: 50 });
  return <ProgramsPage events={events} />;
}
