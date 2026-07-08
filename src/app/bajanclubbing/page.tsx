import type { Metadata } from "next";
import BajanClubbingPage from "@/components/bajanclubbing/BajanClubbingPage";
import { EVENT, LINEUP } from "@/data/bajanClubbing";

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

/** MusicEvent structured data so the event is eligible for rich results. */
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
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: EVENT.url,
    },
  };
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd()) }}
      />
      <BajanClubbingPage />
    </>
  );
}
