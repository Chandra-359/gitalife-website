/**
 * Shared program data fetching logic
 *
 * Used by both the homepage (preview) and the /programs page (full list).
 */

import { prisma } from "@/lib/prisma";
import type { Program } from "@/data/programs";

/** Hardcoded fallback data used when the database is unavailable */
export const FALLBACK_PROGRAMS: Program[] = [
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
    subtitle: "Connecting through sacred sound",
    address: "Hamilton Park, Jersey City, NJ 07302",
    duration: "2.5 hours",
    level: "Beginner-friendly",
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
      "A dedicated monk with 10+ years of teaching Bhagavad Gita wisdom to young professionals across NYC.",
    speakerImageUrl: null,
    galleryUrls: [],
    testimonial:
      "This kirtan evening completely changed how I handle stress at work. The mantra meditation was so peaceful.",
    testimonialAuthor: "Priya S., software engineer",
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
    subtitle: "Ancient wisdom for modern minds",
    address: "The Loft at Journal Square, Jersey City, NJ 07306",
    duration: "2 hours",
    level: "All levels welcome",
    whatToExpect: [
      "Interactive discussion on a Bhagavad Gita chapter",
      "Practical exercises for applying wisdom daily",
      "Small-group breakout conversations",
      "Light refreshments and chai",
    ],
    whyAttend:
      "The Bhagavad Gita is the ultimate life manual — join a circle of curious minds and discover how 5,000-year-old wisdom applies to your life.",
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
      "Former Wall Street analyst turned spiritual educator. 7 years facilitating Gita study circles.",
    speakerImageUrl: null,
    galleryUrls: [],
    testimonial:
      "Nothing hit me like the Gita discussions here. Nitai makes it so accessible and relevant.",
    testimonialAuthor: "Marcus T., graduate student",
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
    subtitle: "The biggest spiritual gathering for young NYC",
    address: "Tompkins Square Park, East Village, NYC 10009",
    duration: "5 hours",
    level: "Everyone welcome — bring your friends!",
    whatToExpect: [
      "Live kirtan performance with a full band",
      "Inspiring talks by young monks and leaders",
      "Massive vegetarian feast for 300+ people",
      "Creative workshops: yoga, art, meditation",
    ],
    whyAttend:
      "The Youth Festival is a vibrant celebration of music, wisdom, and community. The energy of a concert with the depth of a retreat.",
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
      "Internationally recognized kirtan artist passionate about making spiritual culture exciting for young people.",
    speakerImageUrl: null,
    galleryUrls: [],
    testimonial:
      "I came with zero expectations and left with a completely new perspective on life.",
    testimonialAuthor: "Aisha K., college senior",
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
    subtitle: "Your midweek oasis of calm",
    address: "Near Bryant Park, Midtown Manhattan, NYC 10018",
    duration: "2 hours",
    level: "Beginner-friendly",
    whatToExpect: [
      "Intimate acoustic kirtan in a calm setting",
      "Guided breathing and mantra meditation",
      "Vegetarian dinner cooked with love",
      "Short talk on managing stress through the Gita",
    ],
    whyAttend:
      "This intimate evening is the antidote to Midtown chaos: gentle kirtan, nourishing food, and a space to breathe deeply.",
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
      "A dedicated monk with 10+ years of teaching Bhagavad Gita wisdom to young professionals across NYC.",
    speakerImageUrl: null,
    galleryUrls: [],
    testimonial:
      "After a brutal day in finance, this was exactly what I needed. The kirtan melted my stress away.",
    testimonialAuthor: "David R., investment banker",
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
    subtitle: "Unplug, reflect, transform",
    address: "Harriman State Park, Stony Point, NY 10980",
    duration: "Full weekend (Sat 10am - Sun 4pm)",
    level: "All levels — perfect for a first retreat",
    whatToExpect: [
      "Sunrise meditation by the lake",
      "In-depth Bhagavad Gita workshop sessions",
      "Nature hikes with philosophical discussions",
      "Campfire kirtan under the stars",
      "All meals: freshly prepared vegetarian prasadam",
    ],
    whyAttend:
      "Step away from screens and the city grind. This weekend is a rare chance to immerse yourself in nature, deep philosophy, and genuine connection.",
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
      "Experienced retreat leader who has guided hundreds of young seekers through transformative weekend experiences.",
    speakerImageUrl: null,
    galleryUrls: [],
    testimonial:
      "This weekend genuinely changed the trajectory of my life. The campfire conversations were more valuable than any therapy session.",
    testimonialAuthor: "Sam L., product designer",
  },
];

export async function getPrograms(): Promise<Program[]> {
  if (!prisma) {
    console.warn("DATABASE_URL not set — using fallback program data");
    return FALLBACK_PROGRAMS;
  }

  try {
    const rows = await prisma.program.findMany({
      orderBy: { date: "asc" },
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      longitude: row.longitude,
      latitude: row.latitude,
      date: row.date.toISOString(),
      imageUrl: row.imageUrl,
      subtitle: row.subtitle,
      address: row.address,
      duration: row.duration,
      level: row.level,
      whatToExpect: row.whatToExpect,
      whyAttend: row.whyAttend,
      whatYouGet: row.whatYouGet,
      whatToBring: row.whatToBring,
      lectureTopic: row.lectureTopic,
      gitaReference: row.gitaReference,
      speakerName: row.speakerName,
      speakerTitle: row.speakerTitle,
      speakerBio: row.speakerBio,
      speakerImageUrl: row.speakerImageUrl,
      galleryUrls: row.galleryUrls,
      testimonial: row.testimonial,
      testimonialAuthor: row.testimonialAuthor,
    }));
  } catch {
    console.warn("Database query failed — using fallback program data");
    return FALLBACK_PROGRAMS;
  }
}
