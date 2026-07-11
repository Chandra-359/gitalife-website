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
 *  - Front Row cap            → TIERS[].tierLimit (guests counted, server-enforced)
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
    "One night where the bass is a mridanga, the drop is a mantra, and nobody needs a drink to dance. Live kirtan, devotional DJ sets, a chai + mocktail bar, and a midnight prasadam feast — completely alcohol-free.",
  dateLabel: "Saturday, August 15, 2026",
  timeLabel: "7:00 PM – 11:00 PM",
  doorsLabel: "Doors 7:00 PM",
  startIso: "2026-08-15T19:00:00-04:00",
  endIso: "2026-08-15T23:00:00-04:00",
  venue: {
    name: "The Great Hall, ISKCON Brooklyn",
    address: "305 Schermerhorn Street, Downtown Brooklyn, NY",
    mapsUrl: "https://maps.google.com/?q=ISKCON+Brooklyn+305+Schermerhorn+Street",
    transit: "2, 3, 4, 5, B, Q trains — Hoyt-Schermerhorn or Atlantic Terminal",
    note: "Comfortable clothes you can move in. Festival fits loudly encouraged.",
  },
  capacity: 200,
  priceLabel: "Free with pass",
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
    title: "Lights, no liquor",
    detail: "Smoke, lasers and LED walls. Zero alcohol — the high is the chant.",
    accent: "gold",
  },
  {
    icon: "food",
    title: "Chai + mocktail bar",
    detail: "Masala chai on tap, lassi mocktails, and a midnight prasadam feast.",
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
    id: "mantra-collective",
    name: "The Mantra Collective",
    role: "Headline Kirtan",
    setTime: "9:15 PM",
    bio: "Six voices, one harmonium, and a wall of mridanga — the call-and-response set that ends with the whole room on its feet.",
    instrument: "Harmonium · Mridanga · Kartals",
    style: "High-energy nagar kirtan, stadium scale",
    tags: ["Kirtan", "Harmonium", "Mridanga", "Kartals"],
    accent: "saffron",
    headliner: true,
  },
  {
    id: "dj-keshava",
    name: "DJ Keshava",
    role: "Mantra-House DJ",
    setTime: "7:30 PM",
    bio: "Devotional classics re-cut over deep house and lo-fi beats. The warm-up and the afterglow.",
    instrument: "Decks · Sampler",
    style: "Mantra-house & lo-fi bhajan edits",
    tags: ["DJ set", "Mantra-house", "Lo-fi bhajan"],
    accent: "peacock",
  },
  {
    id: "radhika-rane",
    name: "Radhika Rane",
    role: "Candlelight Bhajans",
    setTime: "8:00 PM",
    bio: "Slow, soulful Mirabai and Surdas bhajans under low light — the breath before the storm.",
    instrument: "Voice · Tanpura",
    style: "Mirabai & Surdas bhajans, unplugged",
    tags: ["Vocals", "Tanpura", "Bhajan"],
    accent: "lotus",
  },
  {
    id: "nitai-rhythm-crew",
    name: "Nitai Rhythm Crew",
    role: "Percussion Storm",
    setTime: "8:45 PM",
    bio: "Tabla versus mridanga versus dhol. A ten-minute rhythm battle that turns the floor into one heartbeat.",
    instrument: "Tabla · Mridanga · Dhol",
    style: "Taal battle — cycles that climb until the room shakes",
    tags: ["Tabla", "Mridanga", "Dhol"],
    accent: "gold",
  },
  {
    id: "bansuri-blue",
    name: "Bansuri Blue",
    role: "Ambient Flute",
    setTime: "Doors",
    bio: "Krishna's instrument over slow ambient pads while the room fills — the sound of the Yamuna at dusk.",
    instrument: "Bansuri · Ambient pads",
    style: "Raga-ambient, Vrindavan twilight",
    tags: ["Bansuri", "Ambient", "Raga"],
    accent: "peacock",
  },
  {
    id: "kirtan-shakti",
    name: "Kirtan Shakti",
    role: "Women-Led Chorus",
    setTime: "10:00 PM",
    bio: "A twelve-voice chorus that closes the night — one mantra, a hundred harmonies, zero dry eyes.",
    instrument: "Voices · Kartals · Harmonium",
    style: "Layered choral kirtan, slow-build ecstatics",
    tags: ["Chorus", "Kirtan", "Harmonies"],
    accent: "lotus",
  },
];

/* ------------------------------------------------------------------ */
/*  Ticket tiers — free event; VIP is a seva donation via Stripe       */
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
    name: "General Vibes",
    tag: "Free",
    priceUsd: 0,
    blurb: "Everything that matters: the floor, the chant, the feast.",
    perks: ["Full floor access", "Chai + mocktail bar", "Midnight prasadam feast"],
    accent: "saffron",
  },
  {
    id: "frontrow",
    name: "Front Row Bhakti",
    tag: "Free · Limited",
    priceUsd: 0,
    blurb: "First two rows at the stage rail. For the ones who sing back loudest.",
    perks: ["Stage-rail spot", "Everything in General", "First in line for the feast"],
    accent: "peacock",
    limited: true,
    tierLimit: 40,
  },
  {
    id: "vip",
    name: "VIP Seva Pass",
    tag: "$21 donation",
    priceUsd: 21,
    blurb: "Backstage chai with the artists — and your donation funds the free feast.",
    perks: ["Backstage chai meet", "Reserved cushion seating", "Feast sponsor shout-out"],
    accent: "gold",
  },
];

export const NIGHT_FLOW: NightFlowStop[] = [
  {
    time: "7:00",
    title: "Doors + chai bar",
    detail: "Roll in, grab a masala chai or a rose lassi mocktail, find your people.",
    accent: "gold",
  },
  {
    time: "7:30",
    title: "DJ Keshava warms the room",
    detail: "Mantra-house edits while the lights come down.",
    accent: "peacock",
  },
  {
    time: "8:00",
    title: "Candlelight bhajans",
    detail: "Radhika Rane slows everything to a heartbeat.",
    accent: "lotus",
  },
  {
    time: "8:45",
    title: "Percussion storm",
    detail: "Nitai Rhythm Crew's tabla × mridanga battle.",
    accent: "gold",
  },
  {
    time: "9:15",
    title: "Headline kirtan",
    detail: "The Mantra Collective. Call-and-response until the walls sweat.",
    accent: "saffron",
  },
  {
    time: "10:30",
    title: "Midnight prasadam feast",
    detail: "A full sanctified feast from the temple kitchen. Stay and hang.",
    accent: "peacock",
  },
];

export const CLUB_FAQS: { q: string; a: string }[] = [
  {
    q: "Is it really alcohol-free?",
    a: "Completely. No bar, no BYOB — and nobody misses it. The energy comes from a few hundred people chanting over a serious sound system.",
  },
  {
    q: "I don't know any of the words. Is that okay?",
    a: "Perfect, actually. Kirtan is call-and-response: the artist sings a line, you sing it back. You'll have the melody by the second round.",
  },
  {
    q: "What do I wear?",
    a: "Whatever you can dance in. Kurtas, sneakers, festival fits — all welcome. Modest is appreciated since we're at the temple.",
  },
  {
    q: "How much does it cost?",
    a: "Nothing. Passes are free (capacity is capped, so grab one), and the midnight prasadam feast is included.",
  },
];

export const SHARE = {
  message:
    "I'm going to Bhajan Clubbing — a totally sober, totally electric kirtan night in Brooklyn. Live kirtan, DJ sets, chai bar, midnight feast. Aug 15. Free passes:",
  hashtags: "BhajanClubbing,GitaLifeNYC,KirtanNight",
} as const;
