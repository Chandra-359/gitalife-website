import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gita Life NYC — Discover the Timeless Wisdom of the Bhagavad Gita",
  description:
    "Join Gita Life NYC — weekly programs, retreats, and a vibrant community exploring the Bhagavad Gita in the heart of New York City. An ISKCON initiative.",
  keywords: [
    "Gita Life",
    "ISKCON",
    "Bhagavad Gita",
    "NYC",
    "spiritual community",
    "kirtan",
    "yoga",
    "meditation",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — Playfair Display + Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
