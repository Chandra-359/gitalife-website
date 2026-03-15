/**
 * Prisma seed script — populates the database with initial program data.
 *
 * Run with: npx prisma db seed
 *
 * This script is idempotent — it uses upsert so running it multiple times
 * won't create duplicates.
 *
 * TODO: Replace these mock programs with your real events.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_PROGRAMS = [
  /* ---- Jersey City ---- */
  {
    id: "jc-kirtan-grove",
    title: "Kirtan by the Grove",
    category: "Kirtan & Prasadam",
    description:
      "An evening of soul-stirring kirtan and home-cooked prasadam at the heart of Jersey City's Hamilton Park neighborhood.",
    longitude: -74.0445,
    latitude: 40.7265,
    date: new Date("2026-04-05T18:00:00Z"),
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
    date: new Date("2026-04-12T17:00:00Z"),
    imageUrl: null,
  },

  /* ---- Manhattan ---- */
  {
    id: "nyc-youth-festival",
    title: "NYC Youth Festival",
    category: "Youth Festival",
    description:
      "A high-energy gathering of hundreds of young seekers in the East Village — live music, philosophy talks, and an unforgettable feast.",
    longitude: -73.9857,
    latitude: 40.7264,
    date: new Date("2026-04-19T14:00:00Z"),
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
    date: new Date("2026-04-26T19:00:00Z"),
    imageUrl: null,
  },

  /* ---- Upstate / Retreat ---- */
  {
    id: "retreat-harriman",
    title: "Weekend of the Soul",
    category: "Retreat",
    description:
      "A transformative weekend retreat in the Harriman State Park mountains — meditation at sunrise, philosophy by the campfire, and prasadam under the stars.",
    longitude: -74.1077,
    latitude: 41.2273,
    date: new Date("2026-05-16T10:00:00Z"),
    imageUrl: null,
  },
];

async function main() {
  console.log("Seeding programs...");

  for (const program of SEED_PROGRAMS) {
    await prisma.program.upsert({
      where: { id: program.id },
      update: program,
      create: program,
    });
    console.log(`  ✓ ${program.title}`);
  }

  console.log(`\nDone — ${SEED_PROGRAMS.length} programs seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
