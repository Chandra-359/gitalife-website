import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gita Life NYC",
  description:
    "Discover the timeless wisdom of the Bhagavad Gita — right here in NYC. Weekly programs, retreats, and a community that feels like family.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream text-charcoal font-body antialiased">
        {children}
      </body>
    </html>
  );
}
