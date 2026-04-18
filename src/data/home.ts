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
/*  RETREATS (quarterly upstate immersions)                            */
/* ------------------------------------------------------------------ */
export interface Retreat {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  description: string;
  /** "upcoming" events show RSVP + Luma embed; "past" show gallery card. */
  status: "upcoming" | "past";
  /** Luma URL for upcoming retreats. */
  lumaUrl?: string;
  /** Comma-tagged highlight photos/quotes for past retreats. */
  pastHighlights?: string[];
  /** Optional alumni quote for past retreats. */
  quote?: string;
  quoteAuthor?: string;
}

export const RETREATS: Retreat[] = [
  {
    id: "summer-2026",
    title: "Summer Upstate Retreat",
    dateLabel: "Fri Jul 10 – Sun Jul 12, 2026",
    location: "Catskills, NY",
    description:
      "Three days of morning sadhana, kirtan under the stars, philosophy classes with senior devotees, and hikes through the Catskills. All meals prasadam.",
    status: "upcoming",
    lumaUrl: "",
  },
  {
    id: "winter-2026",
    title: "Winter Retreat",
    dateLabel: "January 2026",
    location: "Upstate NY",
    status: "past",
    description:
      "A weekend of bhajans, philosophy, and snow hikes. 42 devotees from 3 states gathered for the coldest — and most intimate — retreat yet.",
    pastHighlights: [
      "42 devotees attended",
      "3 hikes, 8 hours of kirtan",
      "Evening fire yajña",
    ],
    quote:
      "I went in exhausted from finals and left feeling like I had my mind back. The morning kirtans in the snow — I'll never forget that.",
    quoteAuthor: "Priya, NYU '25",
  },
  {
    id: "fall-2025",
    title: "Fall Foliage Retreat",
    dateLabel: "October 2025",
    location: "Hudson Valley, NY",
    status: "past",
    description:
      "Our largest retreat yet — 60 young devotees spent a weekend studying Bhagavad Gita Chapter 6 on meditation, surrounded by autumn color.",
    pastHighlights: [
      "60 devotees attended",
      "Gita Chapter 6 deep dive",
      "Nightly bonfire kirtans",
    ],
    quote:
      "The balance between philosophy, chanting, and just being in nature was exactly what I needed.",
    quoteAuthor: "Arjun, Columbia '26",
  },
];

/* ------------------------------------------------------------------ */
/*  VOLUNTEER LADDER                                                   */
/* ------------------------------------------------------------------ */
export interface VolunteerRung {
  tier: 1 | 2 | 3;
  title: string;
  commitment: string;
  description: string;
  examples: string[];
  cta: string;
  color: "gold" | "saffron" | "peacock" | "lotus" | "krishna";
}

export const VOLUNTEER_LADDER: VolunteerRung[] = [
  {
    tier: 1,
    title: "One-hour drop-in",
    commitment: "1 hour, any Sunday",
    description:
      "The easiest way to try seva. Show up, meet the team, help with a simple task, and stay for prasadam. No commitment.",
    examples: [
      "Help set up or clean up Sunday Harinam",
      "Greet guests at the Sunday feast",
      "Staff the book table for an hour at NYU",
    ],
    cta: "Come this Sunday",
    color: "gold",
  },
  {
    tier: 2,
    title: "Weekly seva",
    commitment: "2–4 hours a week",
    description:
      "Pick a day that works for your schedule. Weekly rhythm builds real friendship and lets you see the fruit of your service grow over weeks.",
    examples: [
      "Govinda's kitchen — prep or serve dinner one evening a week",
      "Teach a weekly youth Gita class at the temple",
      "Help run the weekly book distribution at Jersey City",
    ],
    cta: "Join a weekly team",
    color: "saffron",
  },
  {
    tier: 3,
    title: "Long-term stewardship",
    commitment: "ongoing, part of the core team",
    description:
      "For devotees who want to help lead — running a festival, teaching a class series, or owning a program end-to-end with mentorship from senior devotees.",
    examples: [
      "Lead the monthly Youth Festival crew",
      "Own the Newport Friday class",
      "Coordinate a retreat",
    ],
    cta: "Talk to us",
    color: "krishna",
  },
];

/* ------------------------------------------------------------------ */
/*  IMPACT STORY (for /impact scrolling narrative)                     */
/* ------------------------------------------------------------------ */
export interface ImpactStory {
  anchor: string;        // URL hash, e.g. "books"
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  stat?: { number: string; label: string };
  color: "gold" | "saffron" | "peacock" | "lotus" | "krishna";
}

export const IMPACT_STORIES: ImpactStory[] = [
  {
    anchor: "books",
    eyebrow: "Book Distribution Marathon",
    heading: "12,457 copies of the Bhagavad Gita, handed out in person",
    paragraphs: [
      "Every December, devotees across NYC, New Jersey, and the surrounding boroughs join a month-long push called the Marathon — a tradition in the ISKCON movement going back 50 years.",
      "Our chapter alone distributed 12,457 books in the 2025 marathon, through weekly book tables at NYU, Jersey City, and Newport, and through street sankirtan in Manhattan. Each book is offered with a conversation — the point was never just the number.",
    ],
    stat: { number: "12,457", label: "books in 2025" },
    color: "peacock",
  },
  {
    anchor: "govindas",
    eyebrow: "Govinda's Kitchen",
    heading: "340 fully vegetarian meals a day, sanctified and served",
    paragraphs: [
      "Govinda's, the temple restaurant at ISKCON Brooklyn, has served sanctified prasadam to New Yorkers of every faith for decades. Every meal is cooked in the temple kitchen and offered to the Deities before being served.",
      "On a typical weekday we serve around 340 meals; Sundays, after the feast, over 500. No one is ever turned away hungry — a long-standing ISKCON tradition.",
    ],
    stat: { number: "340", label: "meals served daily" },
    color: "saffron",
  },
  {
    anchor: "classes",
    eyebrow: "Weekly Classes",
    heading: "52 Bhagavad Gita classes across 3 neighborhoods",
    paragraphs: [
      "Newport on Fridays. Jersey City on Saturdays. ISKCON Brooklyn on Sundays. Three standing gatherings every week of every year — that's 156 classes in 2025.",
      "Our Friday Newport group started as four friends in a living room; it now hosts 25–30 devotees weekly. The growth is the point — scripture spreads by word of mouth, one invitation at a time.",
    ],
    stat: { number: "156", label: "classes in 2025" },
    color: "gold",
  },
  {
    anchor: "retreats",
    eyebrow: "Quarterly Retreats",
    heading: "4 weekend retreats, upstate, for focused sadhana",
    paragraphs: [
      "Four times a year we pause everything and spend a weekend upstate — no phones, no screens, just morning kirtan, philosophy, hiking, and the community we've built.",
      "For many attendees, it's their first real taste of concentrated spiritual practice. Alumni consistently call it the most transformative weekend of their year.",
    ],
    stat: { number: "4", label: "retreats per year" },
    color: "lotus",
  },
];

/* ------------------------------------------------------------------ */
/*  IMPACT TIMELINE (milestones)                                       */
/* ------------------------------------------------------------------ */
export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
}

export const IMPACT_TIMELINE: TimelineMilestone[] = [
  {
    year: "2023",
    title: "First Newport class launched",
    description:
      "Four friends started meeting in a Newport apartment for weekly Gita study.",
  },
  {
    year: "2024",
    title: "Jersey City + NYU book table",
    description:
      "Added Saturday class in Jersey City and began weekly book distribution at NYU.",
  },
  {
    year: "2024",
    title: "First upstate retreat",
    description:
      "22 devotees joined our first weekend retreat in the Catskills.",
  },
  {
    year: "2025",
    title: "10,000 books milestone",
    description:
      "Crossed 10,000 books distributed in a single calendar year.",
  },
  {
    year: "2025",
    title: "Monthly Youth Festival",
    description:
      "Launched the monthly festival at ISKCON Brooklyn — now averaging 80+ attendees.",
  },
  {
    year: "2026",
    title: "Where we are today",
    description:
      "52 classes a year across 3 locations, 4 quarterly retreats, 12 monthly festivals, and 340 daily prasadam meals.",
  },
];

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
