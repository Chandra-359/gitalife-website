import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gita Life NYC — Discover Timeless Wisdom",
  description:
    "A community of young seekers exploring the Bhagavad Gita's timeless wisdom through weekly discussions, kirtans, retreats, and deep friendships in NYC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — Playfair Display (serif headings) + Inter (sans body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
