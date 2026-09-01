/**
 * Volunteer page — Server Component
 *
 * Public hub for volunteer drives (festival seva crews). Drives are
 * defined in code (src/data/volunteer.ts — add a drive there to onboard
 * the next festival); signups are in-house: inline form per drive, a
 * confirmation email with calendar invites per shift, a Google Sheet
 * row per submission, and the /admin/volunteers console for the full
 * registration list.
 */

import type { Metadata } from "next";
import { getVolunteerDrivesLive } from "@/lib/volunteer";
import { mintFormToken } from "@/lib/formGuard";
import VolunteerPage from "@/components/volunteer/VolunteerPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Volunteer — Gita Life NYC",
  description:
    "Join the Janmashtami seva crew at ISKCON Brooklyn — kitchen seva Thursday and Friday, and Govinda's outside stalls all day Friday. Pick the shifts that fit your life.",
  openGraph: {
    title: "Volunteer — Gita Life NYC",
    description:
      "The festival doesn't happen without you. Pick a crew and a shift for Janmashtami at ISKCON Brooklyn.",
    type: "website",
  },
};

export default async function Page() {
  const drives = await getVolunteerDrivesLive();
  // Spam guard: signed render timestamp echoed back by the signup form
  return <VolunteerPage drives={drives} formToken={mintFormToken()} />;
}
