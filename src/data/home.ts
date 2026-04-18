/**
 * home.ts — Homepage content: weekly schedule, events, impact stats,
 * explore categories, and featured hero slides.
 *
 * WHERE TO EDIT EACH THING:
 *  - Weekly schedule → WEEKLY_SCHEDULE (keep source of truth here for now;
 *    wire up to Google Sheet later via src/lib/schedule.ts)
 *  - Monthly festival Luma link → FEATURED_EVENT.lumaUrl
 *  - Impact numbers → IMPACT_STATS
 *  - Hero rotation → HERO_SLIDES
 */

/* ------------------------------------------------------------------ */
/*  WEEKLY SCHEDULE                                                    */
/* ------------------------------------------------------------------ */
export interface WeeklyClass {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  time: string;
  title: string;
  location: string;
  neighborhood: string;
  kind: "gita-class" | "harinam" | "japa" | "book-reading";
  /** Optional full address (used on the /classes page) */
  address?: string;
  /** Optional short "what to expect" blurb */
  blurb?: string;
  /** Optional Google Maps URL */
  mapsUrl?: string;
}

export interface ClassLocation {
  slug: string;
  name: string;
  neighborhood: string;
  address: string;
  mapsUrl: string;
  color: "gold" | "saffron" | "peacock" | "lotus" | "krishna";
  description: string;
  parking?: string;
  transit?: string;
}

export const CLASS_LOCATIONS: ClassLocation[] = [
  {
    slug: "newport",
    name: "Newport",
    neighborhood: "Jersey City, NJ",
    address: "Newport, Jersey City, NJ",
    mapsUrl: "https://maps.google.com/?q=Newport+Jersey+City",
    color: "saffron",
    description:
      "Our Friday evening Gita class in a cozy Newport apartment — perfect for young professionals in Jersey City. Small group discussion, kirtan, and a home-cooked dinner.",
    transit: "PATH to Newport station — 2 min walk",
  },
  {
    slug: "jersey-city",
    name: "Jersey City",
    neighborhood: "Jersey City, NJ",
    address: "Jersey City, NJ",
    mapsUrl: "https://maps.google.com/?q=Jersey+City",
    color: "gold",
    description:
      "Saturday evening class in the heart of Jersey City. Ideal for students at NJIT and Rutgers. Expect scripture study, kirtan, and prasadam.",
    transit: "PATH or bus lines within walking distance",
  },
  {
    slug: "iskcon-brooklyn",
    name: "ISKCON Brooklyn",
    neighborhood: "Brooklyn, NY",
    address: "305 Schermerhorn Street, Brooklyn, NY",
    mapsUrl: "https://maps.google.com/?q=ISKCON+Brooklyn",
    color: "krishna",
    description:
      "Our home temple — Sunday morning class in a historic 50-year-old ISKCON center. Deities, kirtan, full temple experience, and Govinda's prasadam feast.",
    transit: "2, 3, 4, 5, B, Q trains — Hoyt-Schermerhorn or Atlantic",
  },
];

export const WEEKLY_SCHEDULE: WeeklyClass[] = [
  {
    day: "Friday",
    time: "7:00 PM",
    title: "Bhagavad Gita Class",
    location: "Newport",
    neighborhood: "Jersey City, NJ",
    kind: "gita-class",
  },
  {
    day: "Saturday",
    time: "7:00 PM",
    title: "Bhagavad Gita Class",
    location: "Jersey City",
    neighborhood: "Jersey City, NJ",
    kind: "gita-class",
  },
  {
    day: "Sunday",
    time: "10:00 AM",
    title: "Bhagavad Gita Class",
    location: "ISKCON Brooklyn",
    neighborhood: "Brooklyn, NY",
    kind: "gita-class",
  },
  {
    day: "Sunday",
    time: "3:00 PM",
    title: "Harinam Sankirtan",
    location: "NYC Streets",
    neighborhood: "Manhattan",
    kind: "harinam",
  },
];

/* ------------------------------------------------------------------ */
/*  FEATURED EVENT (Monthly festival or quarterly retreat)            */
/* ------------------------------------------------------------------ */
export interface FeaturedEventData {
  kind: "festival" | "retreat";
  title: string;
  dateLabel: string;        // e.g. "Saturday, April 26"
  timeLabel: string;        // e.g. "5:00 PM – 10:00 PM"
  location: string;
  description: string;
  highlights: string[];
  /** Luma event URL — embed via iframe. Leave empty to show internal RSVP fallback. */
  lumaUrl: string;
  /** Public RSVP page to link to as fallback */
  rsvpUrl?: string;
  imageUrl: string;
  spotsLeft?: number;
  totalSpots?: number;
}

export const FEATURED_EVENT: FeaturedEventData = {
  kind: "festival",
  title: "April Youth Festival",
  dateLabel: "Saturday, April 26",
  timeLabel: "5:00 PM – 10:00 PM",
  location: "ISKCON Brooklyn Temple",
  description:
    "Our monthly gathering of young devotees — kirtan, a fireside talk, prasadam feast, and dance under the stars.",
  highlights: [
    "Opening kirtan with temple musicians",
    "Talk: Finding purpose through the Gita",
    "Prasadam feast (fully vegetarian)",
    "Open mic + community dance",
  ],
  /** TODO: replace with your real Luma URL — e.g. https://lu.ma/gitalife-apr26 */
  lumaUrl: "",
  imageUrl: "/krishna-arjuna-chariot.jpg",
  spotsLeft: 35,
  totalSpots: 80,
};

/* ------------------------------------------------------------------ */
/*  IMPACT STATS                                                       */
/* ------------------------------------------------------------------ */
export interface ImpactStat {
  number: string;
  label: string;
  description: string;
}

export const IMPACT_STATS: ImpactStat[] = [
  {
    number: "12,457",
    label: "books distributed",
    description: "Sacred literature shared across Newport, Jersey City, and NYU campuses",
  },
  {
    number: "340",
    label: "meals served daily",
    description: "Prasadam served every day at Govinda's restaurant in ISKCON Brooklyn",
  },
  {
    number: "52",
    label: "weekly classes",
    description: "Gita classes held across 3 locations last year",
  },
  {
    number: "4",
    label: "retreats in 2025",
    description: "Weekend immersions in upstate New York",
  },
];

/* ------------------------------------------------------------------ */
/*  EXPLORE CATEGORIES (Airbnb-style icon grid)                        */
/* ------------------------------------------------------------------ */
export interface ExploreCategory {
  slug: string;
  title: string;
  blurb: string;
  href: string;
  icon: "book" | "music" | "gift" | "mountain" | "food" | "handshake" | "camera" | "trophy" | "calendar" | "lotus";
  color: "gold" | "saffron" | "peacock" | "lotus" | "krishna";
}

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    slug: "gita-classes",
    title: "Gita Classes",
    blurb: "3 weekly sessions across NJ & Brooklyn",
    href: "/classes",
    icon: "book",
    color: "gold",
  },
  {
    slug: "harinam",
    title: "Kirtan & Harinam",
    blurb: "Holy names on NYC streets every Sunday",
    href: "/classes#harinam",
    icon: "music",
    color: "saffron",
  },
  {
    slug: "book-distribution",
    title: "Book Distribution",
    blurb: "Sharing transcendental literature at NYU & Jersey City",
    href: "/impact#books",
    icon: "gift",
    color: "peacock",
  },
  {
    slug: "retreats",
    title: "Upstate Retreats",
    blurb: "Weekend immersions in nature, quarterly",
    href: "/retreats",
    icon: "mountain",
    color: "lotus",
  },
  {
    slug: "govindas",
    title: "Govinda's Kitchen",
    blurb: "Sanctified vegetarian meals at ISKCON Brooklyn",
    href: "/impact#govindas",
    icon: "food",
    color: "saffron",
  },
  {
    slug: "volunteer",
    title: "Volunteer",
    blurb: "Seva opportunities at the Brooklyn temple",
    href: "/volunteer",
    icon: "handshake",
    color: "krishna",
  },
  {
    slug: "gallery",
    title: "Photo Gallery",
    blurb: "Moments from our community on Instagram",
    href: "/gallery",
    icon: "camera",
    color: "lotus",
  },
  {
    slug: "impact",
    title: "Our Impact",
    blurb: "Book marathon, festivals, and community milestones",
    href: "/impact",
    icon: "trophy",
    color: "gold",
  },
];

/* ------------------------------------------------------------------ */
/*  HERO SLIDES (rotating)                                             */
/* ------------------------------------------------------------------ */
export interface HeroSlide {
  eyebrow: string;         // small tag above the heading
  heading: string;
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  /** Background image — use a static import path under /public */
  imageUrl: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "April Youth Festival · Sat Apr 26",
    heading: "Join us for an evening of kirtan, talks & prasadam",
    subheading:
      "Our monthly gathering of young devotees at ISKCON Brooklyn. Free and open to all.",
    primaryCtaLabel: "Reserve your spot",
    primaryCtaHref: "/festival",
    secondaryCtaLabel: "Watch recap",
    secondaryCtaHref: "https://www.youtube.com/@gitalifenyc",
    imageUrl: "/krishna-arjuna-chariot.jpg",
  },
  {
    eyebrow: "This Friday · 7 PM",
    heading: "Bhagavad Gita class in Newport",
    subheading:
      "Weekly scripture study, kirtan, and dinner together. No prior experience needed.",
    primaryCtaLabel: "See weekly schedule",
    primaryCtaHref: "/classes",
    secondaryCtaLabel: "What to expect",
    secondaryCtaHref: "/classes#what-to-expect",
    imageUrl: "/krishna-arjuna-chariot.jpg",
  },
  {
    eyebrow: "Students Living the Bhagavad Gita",
    heading: "In the heart of New York City",
    subheading:
      "A community of young devotees based at ISKCON Brooklyn — studying scripture, chanting, and serving every day.",
    primaryCtaLabel: "Explore what we do",
    primaryCtaHref: "#explore",
    secondaryCtaLabel: "Get connected",
    secondaryCtaHref: "/get-connected",
    imageUrl: "/krishna-arjuna-chariot.jpg",
  },
];

/* ------------------------------------------------------------------ */
/*  SOCIAL                                                             */
/* ------------------------------------------------------------------ */
export const INSTAGRAM_HANDLE = "gitalifenyc";
export const INSTAGRAM_URL = "https://www.instagram.com/gitalifenyc/";
export const YOUTUBE_URL = "https://www.youtube.com/@gitalifenyc";
