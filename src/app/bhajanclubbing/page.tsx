import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import BhajanClubbingPage from "@/components/bhajanclubbing/BhajanClubbingPage";
import { EVENT, LINEUP, TIERS } from "@/data/bhajanClubbing";

/** High-contrast editorial display serif (Google Fonts). Scoped to this
 *  route via its CSS variable and consumed globally as `font-heading` /
 *  var(--font-heading) (set up in globals.css, falling back to Fraunces
 *  on routes that don't load it). Body copy stays Inter. */
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${EVENT.title} ${EVENT.volume} — Gita Life NYC`,
  description: EVENT.description,
  openGraph: {
    title: `${EVENT.title} ${EVENT.volume} — ${EVENT.tagline}`,
    description: `${EVENT.dateLabel} · ${EVENT.venue.name}. Live kirtan and free packed prasadam from Sri Sri Radha Govinda Temple. 100% sattvic. Tickets ${EVENT.priceLabel}.`,
    url: EVENT.url,
    type: "website",
    images: [{ url: "/krishna-arjuna-chariot.jpg", width: 1200, height: 630, alt: "Bhajan Clubbing — Gita Life NYC" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT.title} ${EVENT.volume} — ${EVENT.tagline}`,
    description: `${EVENT.dateLabel} · ${EVENT.venue.name}. The city's most blissful night out. Tickets ${EVENT.priceLabel}.`,
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
    isAccessibleForFree: false,
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
      url: "https://www.gitalifenyc.com",
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
    <div className={playfair.variable}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd()) }}
      />
      <BhajanClubbingPage />
    </div>
  );
}
