/**
 * Programs page — Server Component
 *
 * The public hub for every Gita Life NYC program. Distribution endpoint
 * for QR codes — must orient new visitors quickly and hand off to Luma
 * for registration.
 *
 * Old map-and-list split-view has moved aside; the new page is built
 * around the shared Luma calendar (LUMA_CALENDAR_EMBED_URL in home.ts)
 * with branded chrome, category onboarding, and a past-programs carousel.
 */

import type { Metadata } from "next";
import { getPrograms } from "@/lib/programs";
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
  const programs = await getPrograms();
  const testimonials = programs
    .filter((p) => p.testimonial && p.testimonialAuthor)
    .slice(0, 3);

  return <ProgramsPage testimonials={testimonials} />;
}
