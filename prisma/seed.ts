/**
 * Prisma seed script — populates the database with initial program data.
 *
 * Run with: npx prisma db seed
 *
 * This script is idempotent — it uses upsert so running it multiple times
 * won't create duplicates.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_PROGRAMS = [
  /* ---- Jersey City ---- */
  {
    id: "jc-kirtan-grove",
    title: "Kirtan by the Grove",
    category: "Kirtan & Prasadam",
    type: "program",
    description:
      "An evening of soul-stirring kirtan and home-cooked prasadam at the heart of Jersey City's Hamilton Park neighborhood.",
    longitude: -74.0445,
    latitude: 40.7265,
    date: new Date("2026-04-05T18:00:00Z"),
    imageUrl: null,
    subtitle: "Connecting through sacred sound",
    address: "Hamilton Park, Jersey City, NJ 07302",
    venueName: "Hamilton Park",
    duration: "2.5 hours",
    level: "Beginner-friendly",
    capacity: 50,
    status: "published",
    featured: true,
    whatToExpect: [
      "Live kirtan with mridanga and harmonium",
      "Home-cooked vegetarian prasadam feast",
      "Guided mantra meditation session",
      "Open Q&A circle on Bhagavad Gita wisdom",
    ],
    whyAttend:
      "Experience the transformative power of kirtan — a call-and-response chanting meditation that calms the mind and uplifts the soul. No musical experience needed, just an open heart.",
    whatYouGet: [
      "Inner peace and mental clarity",
      "New friendships with like-minded seekers",
      "Delicious home-cooked prasadam (sacred meal)",
      "A curated Bhagavad Gita reading list",
    ],
    whatToBring: "Just yourself and an open mind!",
    lectureTopic: "The Art of Detachment",
    gitaReference: "Chapter 2, Verses 47-51",
    speakerName: "Radha Govind Das",
    speakerTitle: "Monk & Educator",
    speakerBio:
      "A dedicated monk with 10+ years of teaching Bhagavad Gita wisdom to young professionals across NYC. Known for making ancient philosophy relatable and practical.",
    speakerImageUrl: null,
    galleryUrls: [],
    testimonial:
      "This kirtan evening completely changed how I handle stress at work. The mantra meditation was so peaceful — I felt like I was floating.",
    testimonialAuthor: "Priya S., software engineer & first-time attendee",
  },
  {
    id: "jc-wisdom-exchange",
    title: "Gita Wisdom Exchange",
    category: "Wisdom Session",
    type: "program",
    description:
      "A deep-dive discussion circle exploring the Bhagavad Gita's practical wisdom for modern life. Held in a cozy Journal Square loft.",
    longitude: -74.0631,
    latitude: 40.7328,
    date: new Date("2026-04-12T17:00:00Z"),
    imageUrl: null,
    subtitle: "Ancient wisdom for modern minds",
    address: "The Loft at Journal Square, Jersey City, NJ 07306",
    venueName: "The Loft at Journal Square",
    duration: "2 hours",
    level: "All levels welcome",
    capacity: 30,
    status: "published",
    featured: false,
    whatToExpect: [
      "Interactive discussion on a Bhagavad Gita chapter",
      "Practical exercises for applying wisdom daily",
      "Small-group breakout conversations",
      "Light refreshments and chai",
    ],
    whyAttend:
      "The Bhagavad Gita is the ultimate life manual — but reading it alone can be challenging. Join a circle of curious minds and discover how 5,000-year-old wisdom applies to your relationships, career, and inner life.",
    whatYouGet: [
      "A deeper understanding of the Gita's core teachings",
      "Practical tools for mindfulness and decision-making",
      "A supportive community of fellow seekers",
      "Free copy of Bhagavad Gita As It Is",
    ],
    whatToBring: "A notebook and your favorite questions about life",
    lectureTopic: "Finding Your Dharma in a Noisy World",
    gitaReference: "Chapter 3, Verses 35-43",
    speakerName: "Nitai Prema Das",
    speakerTitle: "Philosophy Teacher & Life Coach",
    speakerBio:
      "Former Wall Street analyst turned spiritual educator. Nitai has been facilitating Gita study circles for 7 years, blending Vedic philosophy with modern psychology.",
    speakerImageUrl: null,
    galleryUrls: [],
    testimonial:
      "I've read self-help books for years, but nothing hit me like the Gita discussions here. Nitai makes it so accessible and relevant to my daily struggles.",
    testimonialAuthor: "Marcus T., graduate student",
  },

  /* ---- Manhattan ---- */
  {
    id: "nyc-youth-festival",
    title: "NYC Youth Festival",
    category: "Youth Festival",
    type: "program",
    description:
      "A high-energy gathering of hundreds of young seekers in the East Village — live music, philosophy talks, and an unforgettable feast.",
    longitude: -73.9857,
    latitude: 40.7264,
    date: new Date("2026-04-19T14:00:00Z"),
    imageUrl: null,
    subtitle: "The biggest spiritual gathering for young NYC",
    address: "Tompkins Square Park, East Village, NYC 10009",
    venueName: "Tompkins Square Park",
    duration: "5 hours",
    level: "Everyone welcome — bring your friends!",
    capacity: 300,
    status: "published",
    featured: true,
    whatToExpect: [
      "Live kirtan performance with a full band",
      "Inspiring talks by young monks and leaders",
      "Massive vegetarian feast for 300+ people",
      "Creative workshops: yoga, art, meditation",
    ],
    whyAttend:
      "This is not your average spiritual event. The Youth Festival is a vibrant celebration of music, wisdom, and community that brings together hundreds of young people from every background. It's the energy of a concert with the depth of a retreat.",
    whatYouGet: [
      "An unforgettable experience of spiritual joy",
      "Connections with hundreds of like-minded youth",
      "Free vegetarian feast (prasadam for 300+)",
      "Access to follow-up weekly study groups",
    ],
    whatToBring: "Friends, a blanket to sit on, and good vibes",
    lectureTopic: "The Yoga of Action — Living with Purpose",
    gitaReference: "Chapter 3, Verses 19-26",
    speakerName: "Gaura Vani",
    speakerTitle: "Kirtan Artist & Youth Mentor",
    speakerBio:
      "An internationally recognized kirtan artist who has performed at festivals worldwide. Gaura is passionate about making spiritual culture accessible and exciting for young people.",
    speakerImageUrl: null,
    galleryUrls: [],
    testimonial:
      "I came with zero expectations and left with a completely new perspective on life. The energy was incredible — like nothing I've experienced in NYC before.",
    testimonialAuthor: "Aisha K., college senior",
  },
  {
    id: "nyc-midtown-kirtan",
    title: "Midtown Mantra Night",
    category: "Kirtan & Prasadam",
    type: "program",
    description:
      "Escape the Midtown rush with an intimate kirtan session and vegetarian dinner near Bryant Park.",
    longitude: -73.9845,
    latitude: 40.7536,
    date: new Date("2026-04-26T19:00:00Z"),
    imageUrl: null,
    subtitle: "Your midweek oasis of calm",
    address: "Near Bryant Park, Midtown Manhattan, NYC 10018",
    venueName: "Bryant Park Community Room",
    duration: "2 hours",
    level: "Beginner-friendly",
    status: "published",
    featured: false,
    whatToExpect: [
      "Intimate acoustic kirtan in a calm setting",
      "Guided breathing and mantra meditation",
      "Vegetarian dinner cooked with love",
      "Short talk on managing stress through the Gita",
    ],
    whyAttend:
      "Midtown can be overwhelming — the noise, the pace, the pressure. This intimate evening is designed to be the antidote: gentle kirtan, nourishing food, and a space to breathe deeply and reconnect with what matters.",
    whatYouGet: [
      "A calm, recharged mind for the rest of the week",
      "Simple meditation techniques for daily use",
      "A warm, home-cooked vegetarian dinner",
      "New connections with the Midtown spiritual community",
    ],
    whatToBring: "Just yourself — leave the laptop at the office!",
    lectureTopic: "Equanimity in Chaos — Staying Centered",
    gitaReference: "Chapter 2, Verses 55-61",
    speakerName: "Radha Govind Das",
    speakerTitle: "Monk & Educator",
    speakerBio:
      "A dedicated monk with 10+ years of teaching Bhagavad Gita wisdom to young professionals across NYC. Known for making ancient philosophy relatable and practical.",
    speakerImageUrl: null,
    galleryUrls: [],
    testimonial:
      "After a brutal day in finance, this was exactly what I needed. The kirtan melted my stress away and the food was incredible. I'm coming every month.",
    testimonialAuthor: "David R., investment banker",
  },

  /* ---- Volunteer Event ---- */
  {
    id: "nyc-park-cleanup",
    title: "Tompkins Square Park Cleanup",
    category: "Youth Festival",
    type: "volunteer",
    description:
      "Join fellow Gita Life volunteers for a community park cleanup in the East Village. Service is the highest yoga!",
    longitude: -73.9817,
    latitude: 40.7264,
    date: new Date("2026-04-20T09:00:00Z"),
    imageUrl: null,
    subtitle: "Serve with love, uplift the community",
    address: "Tompkins Square Park, East Village, NYC 10009",
    venueName: "Tompkins Square Park (East Entrance)",
    duration: "3 hours",
    level: "Everyone welcome",
    capacity: 40,
    status: "published",
    featured: false,
    whatToExpect: [
      "Community park cleanup and beautification",
      "Gloves, bags, and supplies provided",
      "Group meditation and reflection",
      "Free prasadam lunch for all volunteers",
    ],
    whyAttend:
      "The Gita teaches that selfless service is the path to true happiness. Come experience karma yoga in action while making our neighborhood beautiful.",
    whatYouGet: [
      "The joy of selfless service",
      "A beautiful, clean community space",
      "Free prasadam lunch",
      "Volunteer hours certificate (if needed)",
    ],
    whatToBring: "Comfortable clothes, water bottle, and a smile",
    gitaReference: "Chapter 3, Verse 19",
    galleryUrls: [],
    testimonial:
      "Volunteering with Gita Life was the most fulfilling Saturday morning I've had in years.",
    testimonialAuthor: "Jordan M., teacher",
  },

  /* ---- Upstate / Retreat ---- */
  {
    id: "retreat-harriman",
    title: "Weekend of the Soul",
    category: "Retreat",
    type: "program",
    description:
      "A transformative weekend retreat in the Harriman State Park mountains — meditation at sunrise, philosophy by the campfire, and prasadam under the stars.",
    longitude: -74.1077,
    latitude: 41.2273,
    date: new Date("2026-05-16T10:00:00Z"),
    endDate: new Date("2026-05-17T16:00:00Z"),
    imageUrl: null,
    subtitle: "Unplug, reflect, transform",
    address: "Harriman State Park, Stony Point, NY 10980",
    venueName: "Harriman State Park",
    duration: "Full weekend (Sat 10am – Sun 4pm)",
    level: "All levels — perfect for a first retreat",
    capacity: 60,
    status: "published",
    featured: true,
    whatToExpect: [
      "Sunrise meditation by the lake",
      "In-depth Bhagavad Gita workshop sessions",
      "Nature hikes with philosophical discussions",
      "Campfire kirtan under the stars",
      "All meals: freshly prepared vegetarian prasadam",
    ],
    whyAttend:
      "Step away from screens, notifications, and the city grind. This weekend is a rare chance to immerse yourself in nature, deep philosophy, and genuine human connection. Past attendees call it 'life-changing' — and they mean it.",
    whatYouGet: [
      "A complete mental and spiritual reset",
      "Deep friendships forged in shared experience",
      "Practical Gita wisdom you'll use for years",
      "Nature immersion and digital detox",
      "All meals and accommodation included",
    ],
    whatToBring: "Sleeping bag, hiking shoes, warm layers, and a journal",
    lectureTopic: "The Eternal Self — Beyond the Body and Mind",
    gitaReference: "Chapter 2, Verses 11-30",
    speakerName: "Vrindavan Das",
    speakerTitle: "Retreat Leader & Vedic Scholar",
    speakerBio:
      "A Vedic scholar and experienced retreat leader who has guided hundreds of young seekers through transformative weekend experiences. Vrindavan brings warmth, depth, and humor to every session.",
    speakerImageUrl: null,
    galleryUrls: [],
    testimonial:
      "I was skeptical about a 'spiritual retreat' but this weekend genuinely changed the trajectory of my life. The conversations by the campfire were more valuable than any therapy session.",
    testimonialAuthor: "Sam L., product designer",
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
