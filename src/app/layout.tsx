import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gita Life NYC — Events & Programs",
  description:
    "Discover weekly programs, retreats, and events by Gita Life NYC — a community exploring the Bhagavad Gita's timeless wisdom.",
  openGraph: {
    title: "Gita Life NYC — Events & Programs",
    description:
      "Join us for weekly programs, retreats, and festivals. Find the right program for you and register today.",
    siteName: "Gita Life NYC",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
