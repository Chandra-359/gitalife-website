/**
 * Retreat registration page — Server Component
 *
 * Invite-only: /retreat/<slug> is not linked from the nav bar or any
 * public page and is marked noindex. Organizers send the link directly
 * to the people they want to register. Retreats are defined in
 * src/data/retreats.ts; registration is in-house (form → Rsvp row +
 * Google Sheet tab → confirmation email with Zelle details → day-before
 * and day-of reminders via /api/cron/reminders).
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findRetreatBySlug, retreatDatesShort } from "@/data/retreats";
import { getPrismaClient } from "@/lib/prisma";
import { ensureRetreatPrograms, getRetreatLive } from "@/lib/retreat";
import { mintFormToken } from "@/lib/formGuard";
import RetreatPage from "@/components/retreat/RetreatPage";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const retreat = findRetreatBySlug(slug);
  if (!retreat || retreat.status === "draft") return { robots: { index: false, follow: false } };
  return {
    title: `${retreat.title} — Gita Life NYC`,
    description: `${retreatDatesShort(retreat)} at ${retreat.venueName}. ${retreat.tagline}`,
    // Shared by link only — never in search results
    robots: { index: false, follow: false },
    openGraph: {
      title: `${retreat.title} — Gita Life NYC`,
      description: `${retreatDatesShort(retreat)} · ${retreat.venueName}. ${retreat.tagline}`,
      images: [{ url: retreat.posterUrl }],
      type: "website",
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const retreat = findRetreatBySlug(slug);
  if (!retreat || retreat.status === "draft") notFound();

  // The retreat's Program row (registrations attach to it) syncs here so
  // no console setup is needed.
  await ensureRetreatPrograms(getPrismaClient());
  const live = await getRetreatLive(retreat);
  // Spam guard: signed render timestamp echoed back by the form
  return <RetreatPage retreat={live} formToken={mintFormToken()} />;
}
