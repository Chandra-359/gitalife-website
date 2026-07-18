/**
 * bhajanClubbing.ts — Single source of truth for the Bhajan Clubbing event page.
 *
 * WHERE TO EDIT EACH THING:
 *  - Date/time/venue         → EVENT (startIso/endIso drive the countdown + JSON-LD)
 *  - Artists                 → LINEUP (cards show photo + name only; bio/instrument/
 *                              style reveal on hover — no set times or headliner tags)
 *  - Artist photos           → LINEUP[].photo — drop a 3:4 portrait in public/lineup/
 *                              and set e.g. photo: "/lineup/dj-keshava.jpg". Tiles
 *                              without a photo render a neon monogram poster.
 *  - Registration capacity   → EVENT.capacity (server-side only — never shown on the page)
 *  - Ticket price            → TIERS[0].priceUsd (charged via Square checkout)
 *  - Free prasadam section   → PRASADAM
 *  - Share message           → SHARE (used by WhatsApp/X/copy-link buttons)
 *  - Social profiles         → SOCIALS (footer follow buttons)
 *
 * The registration API (src/app/api/bhajanclubbing/route.ts) upserts a Program
 * row with EVENT.programId so RSVPs appear in the existing admin dashboard.
 */

export type AccentToken = "gold" | "saffron" | "peacock" | "lotus";

export interface ClubArtist {
  id: string;
  name: string;
  bio: string;           // one-liner — what kind of artist they are
  instrument: string;    // hover-reveal: what they play
  style: string;         // hover-reveal: their bhajan style
  tags: string[];        // instruments / style chips
  accent: AccentToken;
  /** 3:4 portrait served from public/, e.g. "/lineup/dj-keshava.jpg". */
  photo?: string;
  /**
   * CSS object-position for the photo inside the 3:4 tile — set this when the
   * subject isn't centered in the source image (e.g. "20% center" pulls the
   * crop toward the left of a landscape shot). Defaults to center.
   */
  photoPosition?: string;
}

export const EVENT = {
  /** Fixed Program id — keeps every registration attached to one DB row.
   *  Kept at the original (pre-spelling-fix) value so existing RSVPs stay linked. */
  programId: "bajan-clubbing-vol-01",
  volume: "Vol. 01",
  title: "Bhajan Clubbing",
  tagline: "Temple soul. Club energy.",
  description:
    "One night where the bass is a mridanga, the drop is a mantra, and nobody needs a drink to dance. Live kirtan, a room full of voices, and free packed prasadam from Sri Sri Radha Govinda Temple — a completely sattvic night.",
  dateLabel: "Saturday, August 15, 2026",
  timeLabel: "6:00 PM – 9:00 PM",
  doorsLabel: "Doors 6:00 PM",
  startIso: "2026-08-15T18:00:00-04:00",
  endIso: "2026-08-15T21:00:00-04:00",
  venue: {
    name: "Jersey City, NJ",
    address: "Exact venue announced soon — registered guests hear it first",
    /** Map pin — city-center until the exact venue is announced. */
    lat: 40.7178,
    lng: -74.0431,
    mapsUrl: "https://maps.google.com/?q=Jersey+City,+NJ",
    transit: "PATH-friendly — exact stop and directions land with the venue announcement",
    note: "Comfortable clothes you can move in. Festival fits loudly encouraged.",
  },
  /** Server-side booking cap — enforced by the API, not shown on the page. */
  capacity: 200,
  priceLabel: "$49.99",
  /** Canonical URL used for social sharing + JSON-LD. */
  url: "https://www.gitalifenyc.com/bhajanclubbing",
} as const;

export const VIBE_FACTS: { icon: "music" | "food" | "sparkle" | "handshake"; title: string; detail: string; accent: AccentToken }[] = [
  {
    icon: "music",
    title: "Live kirtan",
    detail: "Harmonium, mridanga and kartals on a concert-grade sound system.",
    accent: "saffron",
  },
  {
    icon: "sparkle",
    title: "A sattvic rave",
    detail: "All the energy of a club night, completely pure — the high is the chant.",
    accent: "gold",
  },
  {
    icon: "food",
    title: "Free prasadam",
    detail: "Packed prasadam from Sri Sri Radha Govinda Temple — free for every guest.",
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
    name: "HG Govinda Krishna Das (GKD)",
    bio: "Highly energetic — call-and-response kirtan that leads the room deep into the maha-mantra and builds until everyone is on their feet.",
    instrument: "Voice · Harmonium",
    style: "High-energy call-and-response kirtan",
    tags: ["Kirtan", "Harmonium", "Maha-mantra"],
    accent: "saffron",
    photo: "/lineup/GKD 3.png",
  },
  {
    id: "srikar-prabhuji",
    name: "Srikar",
    bio: "Soulful — heartfelt bhajans that ease the room into one voice.",
    instrument: "Voice · Mridanga",
    style: "Soulful bhajans building into kirtan",
    tags: ["Kirtan", "Bhajan", "Mridanga"],
    accent: "peacock",
    photo: "/lineup/srikar-prabhuji.jpg",
  },
  {
    id: "mayuri-gandharvika",
    name: "Mayuri Gandharvika",
    bio: "Sweet and meditative — melodious bhajans sung from the heart that draw the whole room gently into the chant.",
    instrument: "Voice",
    style: "Sweet, meditative bhajan and kirtan",
    tags: ["Kirtan", "Bhajan", "Vocals"],
    accent: "lotus",
    photo: "/lineup/mayuri-gandharvika.jpg",
    // Landscape source with the singer on the left third — keep her face in frame.
    photoPosition: "20% center",
  },
];

/* ------------------------------------------------------------------ */
/*  Free prasadam — dedicated section on the page                      */
/* ------------------------------------------------------------------ */
export const PRASADAM = {
  temple: "Sri Sri Radha Govinda Temple",
  title: "Free prasadam for every guest",
  detail:
    "Every ticket includes packed prasadam — a sanctified vegetarian feast prepared fresh at Sri Sri Radha Govinda Temple. Grab yours before you head home; it's our gift, completely free.",
  points: ["Cooked fresh at the temple", "100% vegetarian & sattvic", "Free with your ticket"],
} as const;

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
    perks: ["Full floor access", "Live kirtan all night", "Free packed prasadam"],
    accent: "saffron",
  },
];

/* ------------------------------------------------------------------ */
/*  Official Gita Life NYC profiles — hero buttons + FAQ links         */
/* ------------------------------------------------------------------ */
export const SOCIALS = {
  instagram: "https://www.instagram.com/gitalifenyc",
  youtube: "https://www.youtube.com/channel/UCgOD-piH4XFlphyEwLnpMCQ",
} as const;

export interface ClubFaq {
  q: string;
  a: string;
  /** Optional bullet list rendered after the intro line. */
  points?: string[];
  /** Optional contact/profile links rendered after the answer. */
  links?: { label: string; href: string }[];
}

export const CLUB_FAQS: ClubFaq[] = [
  {
    q: "What is Bhajan Clubbing?",
    a: "Bhajan Clubbing is an uplifting evening of live devotional music, community, meaningful conversations, and authentic vegetarian prasadam in a welcoming environment. Whether you're spiritually curious or simply looking for a unique cultural experience, you're welcome to join us.",
  },
  {
    q: "Who is this event for?",
    a: "This event is open to everyone. It is especially designed for young adults, working professionals, students, and married couples who are looking for an uplifting evening of music, community, and spiritual inspiration.",
  },
  {
    q: "What happens during the event?",
    a: "The evening includes:",
    points: [
      "Live bhajans and kirtan",
      "A short inspirational reflection",
      "Opportunities to connect with like-minded people",
      "A complimentary vegetarian prasadam meal",
    ],
  },
  {
    q: "Who is organizing this event?",
    a: "The event is organized by volunteers from Gita Life NYC, a local Bhakti community dedicated to sharing spiritual wisdom, devotional music, and authentic community experiences.",
  },
  {
    q: "What should I wear?",
    a: "There is no dress code. Comfortable casual or smart-casual attire is recommended.",
  },
  {
    q: "Is food included?",
    a: "Yes. A freshly prepared vegetarian prasadam meal is included with your admission. To help the event conclude on time and give guests added flexibility, the meal will be packed in a convenient to-go box and distributed after the program.",
  },
  {
    q: "What is your refund policy?",
    a: "All ticket sales are final and are non-refundable. As this is a nonprofit community event, all proceeds directly support the community and future programs. Refunds will only be issued if the event is cancelled by the organizers. If you have any questions, please contact us before purchasing your ticket.",
  },
  {
    q: "Are seats assigned?",
    a: "No. Your ticket reserves your admission to the event; however, individual seats are not assigned. You may choose any available seat upon arrival. We encourage you to arrive early for the best seat selection.",
  },
  {
    q: "Are there opportunities to stay connected after the event?",
    a: "Yes. If you enjoy the experience, you'll have the opportunity to join our weekly Bhagavad Gita discussion groups, kirtan gatherings, and future community events. You can stay connected through:",
    links: [
      { label: "Instagram — @gitalifenyc", href: SOCIALS.instagram },
      { label: "YouTube — Gita Life NYC", href: SOCIALS.youtube },
    ],
  },
];

export const SHARE = {
  message:
    "I'm going to Bhajan Clubbing — a totally sattvic, totally electric kirtan night in Jersey City. Live kirtan, free packed prasadam. Aug 15. Tickets:",
  hashtags: "BhajanClubbing,GitaLifeNYC,KirtanNight",
} as const;

/** Who's behind the night — shown in the page footer. */
export const ORGANIZER_NOTE =
  "Organized by a community of volunteers inspired by the Bhakti tradition, with experience facilitating Bhagavad Gita discussions and kirtan gatherings.";
