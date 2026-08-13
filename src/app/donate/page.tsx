import type { Metadata } from "next";
import DonatePage from "@/components/donate/DonatePage";
import { DONATE } from "@/data/donation";

export const metadata: Metadata = {
  title: "Donate — Gita Life NYC",
  description: DONATE.blurb,
  openGraph: {
    title: "Support Gita Life NYC",
    description: DONATE.blurb,
    url: DONATE.url,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Gita Life NYC" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Support Gita Life NYC",
    description: DONATE.blurb,
    images: ["/og-image.png"],
  },
};

export default function Donate() {
  return <DonatePage />;
}
