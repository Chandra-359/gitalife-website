export interface Program {
  id: string;
  title: string;
  category: "Kirtan & Prasadam" | "Retreat" | "Wisdom Session" | "Youth Festival";
  description: string;
  longitude: number;
  latitude: number;
  date: string;
}

/** Category → accent color mapping used by markers and UI */
export const CATEGORY_COLORS: Record<Program["category"], { bg: string; glow: string }> = {
  "Kirtan & Prasadam": { bg: "#E8751A", glow: "rgba(232, 117, 26, 0.45)" },
  Retreat:             { bg: "#D4A843", glow: "rgba(212, 168, 67, 0.45)" },
  "Wisdom Session":    { bg: "#1A5C5E", glow: "rgba(26, 92, 94, 0.55)" },
  "Youth Festival":    { bg: "#e94560", glow: "rgba(233, 69, 96, 0.45)" },
};

export const PROGRAMS: Program[] = [
  /* ---- Jersey City ---- */
  {
    id: "jc-kirtan-grove",
    title: "Kirtan by the Grove",
    category: "Kirtan & Prasadam",
    description:
      "An evening of soul-stirring kirtan and home-cooked prasadam at the heart of Jersey City's Hamilton Park neighborhood.",
    longitude: -74.0445,
    latitude: 40.7265,
    date: "2026-04-05",
  },
  {
    id: "jc-wisdom-exchange",
    title: "Gita Wisdom Exchange",
    category: "Wisdom Session",
    description:
      "A deep-dive discussion circle exploring the Bhagavad Gita's practical wisdom for modern life. Held in a cozy Journal Square loft.",
    longitude: -74.0631,
    latitude: 40.7328,
    date: "2026-04-12",
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
    date: "2026-04-19",
  },
  {
    id: "nyc-midtown-kirtan",
    title: "Midtown Mantra Night",
    category: "Kirtan & Prasadam",
    description:
      "Escape the Midtown rush with an intimate kirtan session and vegetarian dinner near Bryant Park.",
    longitude: -73.9845,
    latitude: 40.7536,
    date: "2026-04-26",
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
    date: "2026-05-16",
  },
];
