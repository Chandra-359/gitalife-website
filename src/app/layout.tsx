import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const SITE_URL = "https://www.gitalifenyc.com";
const SITE_TITLE = "Gita Life NYC — Discover Timeless Wisdom";
const SITE_DESCRIPTION =
  "A community of young seekers exploring the Bhagavad Gita's timeless wisdom through weekly discussions, kirtans, retreats, and deep friendships in NYC.";

export const metadata: Metadata = {
  // Resolves every relative og:image / icon URL to an absolute one — link
  // previews (WhatsApp, iMessage, Slack…) ignore relative URLs entirely.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "Gita Life NYC",
    type: "website",
    // Raster PNG under 300 KB — WhatsApp rejects SVGs and images over ~600 KB.
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "Gita Life NYC" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0F1B4D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        {/* Single GPU-promoted paper layer for the whole site.
            Rendered once, never repainted on scroll. */}
        <div className="paper-backdrop" aria-hidden />
        {children}
      </body>
    </html>
  );
}
