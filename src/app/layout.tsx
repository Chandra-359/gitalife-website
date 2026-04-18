import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Tiro_Devanagari_Sanskrit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const tiroDevanagari = Tiro_Devanagari_Sanskrit({
  subsets: ["devanagari", "latin"],
  weight: ["400"],
  variable: "--font-tiro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gita Life NYC — Discover Timeless Wisdom",
  description:
    "A community of young seekers exploring the Bhagavad Gita's timeless wisdom through weekly discussions, kirtans, retreats, and deep friendships in NYC.",
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
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${tiroDevanagari.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
