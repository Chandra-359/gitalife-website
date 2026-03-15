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
      <body className="antialiased">{children}</body>
    </html>
  );
}
