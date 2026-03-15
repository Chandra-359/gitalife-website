/**
 * Home page — Server Component
 *
 * Fetches all programs from PostgreSQL via Prisma at request time,
 * serializes them, and passes them to the client-side MapScene.
 *
 * This is the recommended Next.js App Router pattern:
 *  - Server Component fetches data (no API round-trip)
 *  - Client Component receives data as props
 *  - No useEffect / SWR needed for initial load
 */

import { prisma } from "@/lib/prisma";
import type { Program } from "@/data/programs";
import MapScene from "@/components/MapScene";

/** Hardcoded fallback data used when the database is unavailable */
const FALLBACK_PROGRAMS: Program[] = [
  {
    id: "jc-kirtan-grove",
    title: "Kirtan by the Grove",
    category: "Kirtan & Prasadam",
    description:
      "An evening of soul-stirring kirtan and home-cooked prasadam at the heart of Jersey City's Hamilton Park neighborhood.",
    longitude: -74.0445,
    latitude: 40.7265,
    date: "2026-04-05T18:00:00.000Z",
    imageUrl: null,
  },
  {
    id: "jc-wisdom-exchange",
    title: "Gita Wisdom Exchange",
    category: "Wisdom Session",
    description:
      "A deep-dive discussion circle exploring the Bhagavad Gita's practical wisdom for modern life. Held in a cozy Journal Square loft.",
    longitude: -74.0631,
    latitude: 40.7328,
    date: "2026-04-12T17:00:00.000Z",
    imageUrl: null,
  },
  {
    id: "nyc-youth-festival",
    title: "NYC Youth Festival",
    category: "Youth Festival",
    description:
      "A high-energy gathering of hundreds of young seekers in the East Village — live music, philosophy talks, and an unforgettable feast.",
    longitude: -73.9857,
    latitude: 40.7264,
    date: "2026-04-19T14:00:00.000Z",
    imageUrl: null,
  },
  {
    id: "nyc-midtown-kirtan",
    title: "Midtown Mantra Night",
    category: "Kirtan & Prasadam",
    description:
      "Escape the Midtown rush with an intimate kirtan session and vegetarian dinner near Bryant Park.",
    longitude: -73.9845,
    latitude: 40.7536,
    date: "2026-04-26T19:00:00.000Z",
    imageUrl: null,
  },
  {
    id: "retreat-harriman",
    title: "Weekend of the Soul",
    category: "Retreat",
    description:
      "A transformative weekend retreat in the Harriman State Park mountains — meditation at sunrise, philosophy by the campfire, and prasadam under the stars.",
    longitude: -74.1077,
    latitude: 41.2273,
    date: "2026-05-16T10:00:00.000Z",
    imageUrl: null,
  },
];

async function getPrograms(): Promise<Program[]> {
  // If no database is configured, use fallback data
  if (!prisma) {
    console.warn("⚠ DATABASE_URL not set — using fallback program data");
    return FALLBACK_PROGRAMS;
  }

  try {
    const rows = await prisma.program.findMany({
      orderBy: { date: "asc" },
    });

    // Serialize Prisma Date objects to ISO strings for the client component
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      longitude: row.longitude,
      latitude: row.latitude,
      date: row.date.toISOString(),
      imageUrl: row.imageUrl,
    }));
  } catch {
    // Database unreachable at runtime — fall back gracefully
    console.warn("⚠ Database query failed — using fallback program data");
    return FALLBACK_PROGRAMS;
  }
}

export default async function Home() {
  const programs = await getPrograms();
  return <MapScene programs={programs} />;
}
