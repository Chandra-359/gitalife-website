/**
 * programs.ts — Mock data for Gita Life NYC program locations
 *
 * HOW TO ADD / EDIT PROGRAMS:
 * 1. Add a new object to the PROGRAMS array below.
 * 2. Each program needs: id, title, category, description, longitude, latitude, date.
 * 3. Use Google Maps to get exact lng/lat:
 *    → Right-click any spot → "What's here?" → copy the coordinates.
 *    → Format: longitude first (negative for NYC), then latitude.
 *
 * HOW TO ADD PHOTOS:
 * 1. Add an `image` field to the Program interface below (e.g., image: string).
 * 2. Place your images in /public/programs/ (e.g., /public/programs/kirtan.jpg).
 * 3. Set image: "/programs/kirtan.jpg" in each program object.
 * 4. Update ProgramPanel.tsx to use <Image src={program.image} /> instead of
 *    the gradient placeholder.
 *
 * HOW TO ADD NEW CATEGORIES:
 * 1. Add the new category string to the Program["category"] union type.
 * 2. Add a color entry to CATEGORY_COLORS.
 * 3. Add an icon to CATEGORY_ICON in ProgramMarker.tsx and ProgramPanel.tsx.
 */

export interface Program {
  id: string;
  title: string;
  category: "Kirtan & Prasadam" | "Retreat" | "Wisdom Session" | "Youth Festival";
  description: string;
  longitude: number;   // negative for NYC area (western hemisphere)
  latitude: number;    // positive for NYC area (northern hemisphere)
  date: string;        // ISO format: "YYYY-MM-DD"
}

/**
 * Category → accent color mapping
 *
 * Used by both ProgramMarker (dot color + glow) and ProgramPanel (badge, CTA).
 * `bg` is the solid fill; `glow` is the translucent halo / shadow color.
 *
 * TODO: Adjust these to match your final brand palette.
 */
export const CATEGORY_COLORS: Record<Program["category"], { bg: string; glow: string }> = {
  "Kirtan & Prasadam": { bg: "#E8751A", glow: "rgba(232, 117, 26, 0.45)" },   // Saffron
  Retreat:             { bg: "#D4A843", glow: "rgba(212, 168, 67, 0.45)" },     // Gold
  "Wisdom Session":    { bg: "#1A5C5E", glow: "rgba(26, 92, 94, 0.55)" },      // Deep Teal
  "Youth Festival":    { bg: "#e94560", glow: "rgba(233, 69, 96, 0.45)" },     // Crimson
};

/**
 * PROGRAMS — All program locations rendered as markers on the map.
 *
 * Spread across Jersey City, Manhattan, and one upstate retreat.
 * TODO: Replace these with your real program data.
 */
export const PROGRAMS: Program[] = [

  /* ================================================================ */
  /*  JERSEY CITY                                                      */
  /* ================================================================ */

  {
    id: "jc-kirtan-grove",
    title: "Kirtan by the Grove",
    category: "Kirtan & Prasadam",
    description:
      "An evening of soul-stirring kirtan and home-cooked prasadam at the heart of Jersey City's Hamilton Park neighborhood.",
    longitude: -74.0445,   // Hamilton Park area, JC
    latitude: 40.7265,
    date: "2026-04-05",    // TODO: Replace with real date
  },
  {
    id: "jc-wisdom-exchange",
    title: "Gita Wisdom Exchange",
    category: "Wisdom Session",
    description:
      "A deep-dive discussion circle exploring the Bhagavad Gita's practical wisdom for modern life. Held in a cozy Journal Square loft.",
    longitude: -74.0631,   // Journal Square, JC
    latitude: 40.7328,
    date: "2026-04-12",    // TODO: Replace with real date
  },

  /* ================================================================ */
  /*  MANHATTAN                                                        */
  /* ================================================================ */

  {
    id: "nyc-youth-festival",
    title: "NYC Youth Festival",
    category: "Youth Festival",
    description:
      "A high-energy gathering of hundreds of young seekers in the East Village — live music, philosophy talks, and an unforgettable feast.",
    longitude: -73.9857,   // East Village, Manhattan
    latitude: 40.7264,
    date: "2026-04-19",    // TODO: Replace with real date
  },
  {
    id: "nyc-midtown-kirtan",
    title: "Midtown Mantra Night",
    category: "Kirtan & Prasadam",
    description:
      "Escape the Midtown rush with an intimate kirtan session and vegetarian dinner near Bryant Park.",
    longitude: -73.9845,   // Near Bryant Park, Midtown
    latitude: 40.7536,
    date: "2026-04-26",    // TODO: Replace with real date
  },

  /* ================================================================ */
  /*  UPSTATE / RETREAT                                                */
  /* ================================================================ */

  {
    id: "retreat-harriman",
    title: "Weekend of the Soul",
    category: "Retreat",
    description:
      "A transformative weekend retreat in the Harriman State Park mountains — meditation at sunrise, philosophy by the campfire, and prasadam under the stars.",
    longitude: -74.1077,   // Harriman State Park, NY
    latitude: 41.2273,
    date: "2026-05-16",    // TODO: Replace with real date
  },
];
