import type { Metadata } from "next";
import { Unbounded } from "next/font/google";
import BajanClubbingPage from "@/components/bajanclubbing/BajanClubbingPage";
import { EVENT, LINEUP, TIERS } from "@/data/bajanClubbing";

/** Wide club-poster display face (closest Google Fonts analog to
 *  Monument Extended / Clash Display). Scoped to this route via its
 *  CSS variable — the rest of the site stays Fraunces + Inter. */
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${EVENT.title} ${EVENT.volume} — Gita Life NYC`,
  description: EVENT.description,
  openGraph: {
    title: `${EVENT.title} ${EVENT.volume} — ${EVENT.tagline}`,
    description: `${EVENT.dateLabel} · ${EVENT.venue.name}. Live kirtan, devotional DJ sets, chai bar, midnight prasadam. 100% alcohol-free. Free passes.`,
    url: EVENT.url,
    type: "website",
    images: [{ url: "/krishna-arjuna-chariot.jpg", width: 1200, height: 630, alt: "Bhajan Clubbing — Gita Life NYC" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT.title} ${EVENT.volume} — ${EVENT.tagline}`,
    description: `${EVENT.dateLabel} · ${EVENT.venue.name}. The city's most blissful night out. Free passes.`,
  },
};

/** MusicEvent structured data — one offer per ticket tier. */
function eventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: `${EVENT.title} — ${EVENT.volume}`,
    description: EVENT.description,
    startDate: EVENT.startIso,
    endDate: EVENT.endIso,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    isAccessibleForFree: true,
    url: EVENT.url,
    location: {
      "@type": "Place",
      name: EVENT.venue.name,
      address: EVENT.venue.address,
    },
    performer: LINEUP.map((artist) => ({
      "@type": "MusicGroup",
      name: artist.name,
    })),
    organizer: {
      "@type": "Organization",
      name: "Gita Life NYC",
      url: "https://gitalifenyc.org",
    },
    offers: TIERS.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      price: String(tier.priceUsd),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${EVENT.url}#tickets`,
    })),
  };
}

export default function Page() {
  return (
    <div className={unbounded.variable}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd()) }}
      />
      <BajanClubbingPage />
    </div>
  );
}
