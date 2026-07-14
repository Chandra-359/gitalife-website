/**
 * bajanClubbing.ts — Single source of truth for the Bhajan Clubbing event page.
 *
 * WHERE TO EDIT EACH THING:
 *  - Date/time/venue         → EVENT (startIso/endIso drive the countdown + JSON-LD)
 *  - Artists                 → LINEUP (`headliner: true` gets the badge + accent glow)
 *  - Artist photos           → LINEUP[].photo — drop a 3:4 portrait in public/lineup/
 *                              and set e.g. photo: "/lineup/dj-keshava.jpg". Tiles
 *                              without a photo render a neon monogram poster.
 *  - Run of show             → NIGHT_FLOW
 *  - Registration capacity   → EVENT.capacity (enforced server-side too)
 *  - Ticket price            → TIERS[0].priceUsd (charged via Square checkout)
 *  - Share message           → SHARE (used by WhatsApp/X/copy-link buttons)
 *
 * The registration API (src/app/api/bajanclubbing/route.ts) upserts a Program
 * row with EVENT.programId so RSVPs appear in the existing admin dashboard.
 */

export type AccentToken = "gold" | "saffron" | "peacock" | "lotus";

export interface ClubArtist {
  id: string;
  name: string;
  role: string;          // e.g. "Headline Kirtan", "Mantra-House DJ"
  setTime: string;       // e.g. "9:15 PM"
  bio: string;           // one-liner
  instrument: string;    // hover-reveal: what they play
  style: string;         // hover-reveal: their bhajan style
  tags: string[];        // instruments / style chips
  accent: AccentToken;
  headliner?: boolean;
  /** 3:4 portrait served from public/, e.g. "/lineup/dj-keshava.jpg". */
  photo?: string;
}

export interface NightFlowStop {
  time: string;
  title: string;
  detail: string;
  accent: AccentToken;
}

export const EVENT = {
  /** Fixed Program id — keeps every registration attached to one DB row. */
  programId: "bajan-clubbing-vol-01",
  volume: "Vol. 01",
  title: "Bhajan Clubbing",
  tagline: "Temple soul. Club energy.",
  description:
    "One night where the bass is a mridanga, the drop is a mantra, and nobody needs a drink to dance. Live kirtan, devotional DJ sets, a sattvic mocktail bar, and packed prasadam — a completely sattvic night.",
  dateLabel: "Saturday, August 15, 2026",
  timeLabel: "6:00 PM – 10:00 PM",
  doorsLabel: "Doors 6:00 PM",
  startIso: "2026-08-15T18:00:00-04:00",
  endIso: "2026-08-15T22:00:00-04:00",
  venue: {
    name: "Jersey City, NJ",
    address: "Exact venue announced soon — registered guests hear it first",
    mapsUrl: "https://maps.google.com/?q=Jersey+City,+NJ",
    transit: "PATH-friendly — exact stop and directions land with the venue announcement",
    note: "Comfortable clothes you can move in. Festival fits loudly encouraged.",
  },
  capacity: 200,
  priceLabel: "$49.99",
  /** Canonical URL used for social sharing + JSON-LD. */
  url: "https://www.gitalifenyc.com/bajanclubbing",
} as const;

export const VIBE_FACTS: { icon: "music" | "food" | "sparkle" | "handshake"; title: string; detail: string; accent: AccentToken }[] = [
  {
    icon: "music",
    title: "Live kirtan × DJ",
    detail: "Harmonium and mridanga meet mantra-house edits on a concert rig.",
    accent: "saffron",
  },
  {
    icon: "sparkle",
    title: "A sattvic rave",
    detail: "Smoke, lasers and LED walls. Everything pure — the high is the chant.",
    accent: "gold",
  },
  {
    icon: "food",
    title: "Sattvic mocktail bar",
    detail: "Rose lassi mocktails, fresh fruit coolers, and packed prasadam to take home.",
    accent: "lotus",
  },
  {
    icon: "handshake",
    title: "Everyone's invited",
    detail: "First-timers, families, seekers, skeptics. No experience needed.",
    accent: "peacock",
  },
];

export const LINEUP: ClubArtist[] = [
  {
    id: "govinda-krishna-prabhuji",
    name: "HG Govinda Krishna Das",
    role: "Headline Kirtan",
    setTime: "7:30 PM",
    bio: "Leading the room deep into the maha-mantra — call-and-response kirtan that builds until everyone is on their feet.",
    instrument: "Voice · Harmonium",
    style: "High-energy call-and-response kirtan",
    tags: ["Kirtan", "Harmonium", "Maha-mantra"],
    accent: "saffron",
    headliner: true,
    photo: "/lineup/GKD 3.png",
  },
  {
    id: "srikar-prabhuji",
    name: "Srikar",
    role: "Opening Kirtan",
    setTime: "6:30 PM",
    bio: "Opens the night — soulful bhajans that ease the room from mocktail-bar chatter into one voice.",
    instrument: "Voice · Mridanga",
    style: "Soulful bhajans building into kirtan",
    tags: ["Kirtan", "Bhajan", "Mridanga"],
    accent: "peacock",
    photo: "/lineup/srikar-prabhuji.jpg",
  },
];

/* ------------------------------------------------------------------ */
/*  Ticket — single paid tier, charged via Square checkout             */
/* ------------------------------------------------------------------ */
export interface TicketTier {
  id: string;
  name: string;
  tag: string;
  priceUsd: number; // 0 = free
  blurb: string;
  perks: string[];
  accent: AccentToken;
  limited?: boolean;
  /** Hard cap for limited tiers, counted in guests. Enforced server-side. */
  tierLimit?: number;
}

export const TIERS: TicketTier[] = [
  {
    id: "general",
    name: "General Admission",
    tag: "$49.99",
    priceUsd: 49.99,
    blurb: "One ticket, the whole night: the floor, the chant, the prasadam.",
    perks: ["Full floor access", "Sattvic mocktail bar", "Packed prasadam"],
    accent: "saffron",
  },
];

export const NIGHT_FLOW: NightFlowStop[] = [
  {
    time: "6:00",
    title: "Doors + mocktail bar",
    detail: "Roll in, grab a rose lassi mocktail or a fresh fruit cooler, find your people.",
    accent: "gold",
  },
  {
    time: "6:30",
    title: "Srikar opens",
    detail: "Soulful bhajans that ease the room into one voice.",
    accent: "peacock",
  },
  {
    time: "7:30",
    title: "Headline kirtan",
    detail: "HG Govinda Krishna Das. Call-and-response until the walls sweat.",
    accent: "saffron",
  },
  {
    time: "9:15",
    title: "Packed prasadam",
    detail: "Sanctified packed prasadam to close the night. Grab yours, stay and hang.",
    accent: "peacock",
  },
];

export const CLUB_FAQS: { q: string; a: string }[] = [
  {
    q: "Is it really a fully sattvic night?",
    a: "Completely. Everything served is sattvic — pure, vegetarian, and intoxicant-free — and nobody misses a thing. The energy comes from a few hundred people chanting over a serious sound system.",
  },
  {
    q: "I don't know any of the words. Is that okay?",
    a: "Perfect, actually. Kirtan is call-and-response: the artist sings a line, you sing it back. You'll have the melody by the second round.",
  },
  {
    q: "What do I wear?",
    a: "Whatever you can dance in. Kurtas, sneakers, festival fits — all welcome. Modest is appreciated — it's still a devotional night.",
  },
  {
    q: "How much does it cost?",
    a: "$49.99 per person. That covers the whole night — live kirtan, the sattvic mocktail bar, and packed prasadam. Capacity is capped, so grab yours early.",
  },
];

export const SHARE = {
  message:
    "I'm going to Bhajan Clubbing — a totally sattvic, totally electric kirtan night in Jersey City. Live kirtan, sattvic mocktails, packed prasadam. Aug 15. Tickets:",
  hashtags: "BhajanClubbing,GitaLifeNYC,KirtanNight",
} as const;
