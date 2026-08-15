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
 *  - Artist socials          → LINEUP[].socials — Instagram / YouTube icon links
 *                              rendered beneath each poster.
 *  - Registration capacity   → EVENT.capacity (hard seat cap, enforced server-side)
 *  - Seats-left urgency copy → SEATS_LEFT_THRESHOLD + seatMeter() (the
 *                              "only N left" / "sold out" banners on the page)
 *  - Suggested donation      → PRICE_PHASES (early-bird deadline + amounts) and
 *                              GROUP_DISCOUNT — computeOrder() is the single
 *                              source of truth for what Square charges, and
 *                              every "from $X" label on the page derives from
 *                              the phase in effect, so copy can't drift from
 *                              the amount actually charged
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
  /** Official artist profiles — rendered as icon links beneath the poster. */
  socials?: {
    instagram?: string;
    youtube?: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Suggested donation — phased amounts                                */
/*                                                                     */
/*  Everything the organisers may want to tune based on registrations  */
/*  lives right here:                                                  */
/*   - Extend early bird from Aug 2 to Aug 5 → change endsAtIso to     */
/*     "2026-08-06T00:00:00-04:00" and deadlineLabel to "August 5".    */
/*   - Drop the final-week amount from $30 back to $25 → change        */
/*     amountUsd on the "last-week" phase.                             */
/*  Client display and the Square charge both flow through             */
/*  computeOrder(), and the "from $X" marketing labels (hero, sticky   */
/*  bar, tickets copy, social metadata) derive from the live phase —   */
/*  so one edit here updates the whole pipeline.                       */
/* ------------------------------------------------------------------ */
export interface PricePhase {
  id: string;
  /** Marketing name — shown on the page and on the Square receipt. */
  label: string;
  /** Suggested minimum donation per ticket, in USD. */
  amountUsd: number;
  /** Exclusive end — the phase is active while now < endsAtIso.
   *  Omit on the final phase (runs through the event). */
  endsAtIso?: string;
  /** Human copy for the deadline, e.g. "August 2". */
  deadlineLabel?: string;
}

export const PRICE_PHASES: PricePhase[] = [
  {
    id: "early-bird",
    label: "Early bird",
    amountUsd: 25,
    // Through end of day Sunday, August 2 (ET).
    endsAtIso: "2026-08-03T00:00:00-04:00",
    deadlineLabel: "August 2",
  },
  {
    id: "last-week",
    label: "Final weeks",
    amountUsd: 30,
  },
];

/** The phase in effect right now (falls back to the final phase). */
export function activePhase(now: Date = new Date()): PricePhase {
  return (
    PRICE_PHASES.find((p) => !p.endsAtIso || now < new Date(p.endsAtIso)) ??
    PRICE_PHASES[PRICE_PHASES.length - 1]
  );
}

/** Phase in effect when this module loaded — build time on the server,
 *  page-load time in the browser. Drives the static "from $X" labels
 *  below; the amount actually charged is always recomputed per order
 *  via computeOrder(). */
const CURRENT_PHASE = activePhase();

export const EVENT = {
  /** Fixed Program id — keeps every registration attached to one DB row.
   *  Kept at the original (pre-spelling-fix) value so existing RSVPs stay linked. */
  programId: "bajan-clubbing-vol-01",
  volume: "Vol. 01",
  title: "Bhajan Clubbing",
  tagline: "Temple soul. Club energy.",
  description:
    "One night where the bass is a mridanga, the drop is a mantra, and the whole room dances as one. Live kirtan, a room full of voices, and free packed prasadam from Sri Sri Radha Govinda Temple — a completely sattvic night.",
  dateLabel: "Saturday, August 15, 2026",
  timeLabel: "6:00 PM – 9:00 PM",
  doorsLabel: "Doors 6:00 PM",
  startIso: "2026-08-15T18:00:00-04:00",
  endIso: "2026-08-15T21:00:00-04:00",
  venue: {
    name: "Saint Dominic Academy",
    address: "2572 John F. Kennedy Blvd, Jersey City, NJ 07304",
    lat: 40.72472,
    lng: -74.07333,
    mapsUrl: "https://maps.google.com/?q=Saint+Dominic+Academy,+2572+John+F.+Kennedy+Blvd,+Jersey+City,+NJ+07304",
    transit: "PATH to Journal Square, then a short ride down Kennedy Blvd — NJ Transit buses stop along the boulevard",
    note: "Comfortable clothes you can move in. Festival fits loudly encouraged.",
  },
  /** Hard booking cap for the night, counted in guests (not rows).
   *  Enforced server-side by the registration + checkout APIs, and
   *  surfaced on the page through seatMeter() once seats run low. */
  capacity: 140,
  /** Event inbox — shown on the page + confirmation email, and used as the
   *  Reply-To on confirmations unless SMTP_REPLY_TO overrides it. */
  contactEmail: "bhajanclubbing@gitalifenyc.com",
  /** Short marketing label — hero, sticky bar, social metadata. */
  donationLabel: `Suggested donation from $${CURRENT_PHASE.amountUsd}`,
  /** Compact variant for tight spots (mobile sticky bar). */
  donationShortLabel: `From $${CURRENT_PHASE.amountUsd}`,
  /** Canonical URL used for social sharing + JSON-LD. */
  url: "https://www.gitalifenyc.com/bhajanclubbing",
} as const;

/* ------------------------------------------------------------------ */
/*  Seats-left meter — the public face of EVENT.capacity               */
/* ------------------------------------------------------------------ */
/**
 * How few seats must be left before the page starts saying so. Above
 * this the meter stays silent (no point advertising a half-empty room);
 * at or below it every ticket surface shows "only N left"; at zero the
 * page flips to sold out. Raise it to start the urgency push earlier.
 */
export const SEATS_LEFT_THRESHOLD = 40;

export interface SeatMeter {
  tone: "urgent" | "sold-out";
  /** Tight copy for the mobile sticky bar / hero pill. */
  short: string;
  /** Full sentence for the tickets section banner. */
  long: string;
}

/**
 * Public seat copy for a live remaining count (from GET /api/bhajanclubbing).
 * Returns null when there's nothing to say — plenty left, or the count is
 * unknown because the DB is offline, in which case the page falls back to
 * its normal copy rather than inventing a number.
 */
export function seatMeter(remaining: number | null | undefined): SeatMeter | null {
  if (remaining == null || !Number.isFinite(remaining)) return null;
  if (remaining <= 0) {
    return { tone: "sold-out", short: "Sold out", long: "Sold out — every seat is claimed" };
  }
  if (remaining > SEATS_LEFT_THRESHOLD) return null;
  const seats = `${remaining} seat${remaining === 1 ? "" : "s"}`;
  return {
    tone: "urgent",
    short: `Only ${remaining} left`,
    long: `Hurry — only ${seats} left`,
  };
}

export const LINEUP: ClubArtist[] = [
  {
    id: "govinda-krishna-prabhuji",
    name: "Govinda Krishna Das (GKD)",
    bio: "Highly energetic — call-and-response kirtan that leads the room deep into the maha-mantra and builds until everyone is on their feet.",
    instrument: "Voice · Harmonium",
    style: "High-energy call-and-response kirtan",
    tags: ["Kirtan", "Harmonium", "Maha-mantra"],
    accent: "saffron",
    photo: "/lineup/GKD 3.png",
    socials: {
      instagram: "https://www.instagram.com/govindkrsnadas",
      youtube: "https://www.youtube.com/channel/UCJptatOLkds0ovqvFc86rjA",
    },
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
    // Add socials.youtube here once his channel URL is confirmed.
    socials: {
      instagram: "https://www.instagram.com/srikar.music",
    },
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
    socials: {
      instagram: "https://www.instagram.com/mayurigandharvika",
      youtube: "https://www.youtube.com/@MayuriGandharvika",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Ticket — single paid tier, charged via Square checkout             */
/* ------------------------------------------------------------------ */
export interface TicketTier {
  id: string;
  name: string;
  tag: string;
  priceUsd: number; // 0 = free — the amount actually charged comes from PRICE_PHASES
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
    tag: `From $${CURRENT_PHASE.amountUsd}`,
    // Suggested donation for the live phase — must stay > 0 so the checkout
    // route still recognises this as the paid tier. The amount actually
    // charged always comes from computeOrder()/PRICE_PHASES.
    priceUsd: CURRENT_PHASE.amountUsd,
    blurb: "One ticket, the whole night: the floor, the chant, the prasadam.",
    perks: ["Full floor access", "Live kirtan all night", "Free packed prasadam"],
    accent: "saffron",
  },
];

/* ------------------------------------------------------------------ */
/*  Group discount + order math                                        */
/* ------------------------------------------------------------------ */
/** Celebrate with your family & friends — 5% off on 4 or 5 tickets. */
export const GROUP_DISCOUNT = {
  minTickets: 4,
  percent: 5,
  name: "Family & friends discount",
  blurb: "Celebrate with your family & friends — book 4 or 5 tickets together and get 5% off.",
} as const;

/** Guard-rail for the optional extra donation (USD). */
export const MAX_EXTRA_DONATION_USD = 1000;

/** Shown wherever we talk about money — tickets section, FAQ. */
export const DONATION_NOTE =
  "This is a nonprofit, volunteer-led community event. All proceeds are used solely to cover event costs and support future spiritual and community initiatives. If you feel inspired by our mission, you are welcome to make an additional voluntary donation.";

/** A validated promo code, as returned by /api/bhajanclubbing/promo. */
export interface PromoDiscount {
  code: string;
  kind: "percent" | "fixed";
  /** 1–100, set when kind === "percent". */
  percentOff?: number;
  /** Discount per order in cents, set when kind === "fixed". */
  amountOffCents?: number;
}

/** "SAVE10 (10% off)" / "FRIEND5 ($5.00 off)" — shown in the order summary. */
export function promoLabel(promo: PromoDiscount): string {
  return promo.kind === "percent"
    ? `${promo.code} (${promo.percentOff}% off)`
    : `${promo.code} (${usd(promo.amountOffCents ?? 0)} off)`;
}

export interface OrderBreakdown {
  phase: PricePhase;
  /** Suggested donation per ticket before any discount, in cents. */
  baseUnitCents: number;
  /** Per-ticket amount actually charged (post group discount), in cents. */
  unitCents: number;
  groupDiscount: boolean;
  /** Total saved by the group discount, in cents. */
  discountCents: number;
  /** The promo code applied to this order, if any. */
  promo: PromoDiscount | null;
  /** Total saved by the promo code, in cents (never exceeds the ticket subtotal). */
  promoCents: number;
  /** Optional extra voluntary donation, in cents. */
  donationCents: number;
  totalCents: number;
}

/**
 * The one place order math happens — used by the ticket flow for display
 * and by the checkout API for the actual Square charge, so the number on
 * the pay button always matches the card charge.
 *
 * A promo code stacks after the group discount and only ever reduces the
 * ticket subtotal — the optional extra donation is always charged in full.
 */
export function computeOrder(
  qty: number,
  extraDonationUsd = 0,
  now: Date = new Date(),
  promo: PromoDiscount | null = null,
): OrderBreakdown {
  const phase = activePhase(now);
  const baseUnitCents = Math.round(phase.amountUsd * 100);
  const groupDiscount = qty >= GROUP_DISCOUNT.minTickets;
  // 5% off per ticket — exact cents for $25 (→ $23.75) and $30 (→ $28.50)
  const unitCents = groupDiscount
    ? Math.round(baseUnitCents * (1 - GROUP_DISCOUNT.percent / 100))
    : baseUnitCents;
  const ticketCents = unitCents * qty;
  const rawPromoCents = !promo
    ? 0
    : promo.kind === "percent"
      ? Math.round(ticketCents * (Math.min(100, Math.max(0, promo.percentOff ?? 0)) / 100))
      : Math.max(0, promo.amountOffCents ?? 0);
  const promoCents = Math.min(ticketCents, rawPromoCents);
  const safeDonation = Number.isFinite(extraDonationUsd)
    ? Math.min(MAX_EXTRA_DONATION_USD, Math.max(0, extraDonationUsd))
    : 0;
  const donationCents = Math.round(safeDonation * 100);
  return {
    phase,
    baseUnitCents,
    unitCents,
    groupDiscount,
    discountCents: (baseUnitCents - unitCents) * qty,
    promo: promoCents > 0 ? promo : null,
    promoCents,
    donationCents,
    totalCents: ticketCents - promoCents + donationCents,
  };
}

/** "$23.75"-style formatter for cent amounts. */
export const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

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
    q: "Is the ticket a price or a donation?",
    a: `Admission is a suggested minimum donation, not a price. ${DONATION_NOTE}`,
  },
  {
    q: "What is your refund policy?",
    a: "All ticket sales are final and are non-refundable. As this is a nonprofit community event, all proceeds directly support the community and future programs. Refunds will only be issued if the event is cancelled by the organizers. If you have any questions, please contact us before purchasing your ticket.",
    links: [{ label: EVENT.contactEmail, href: `mailto:${EVENT.contactEmail}` }],
  },
  {
    q: "How can I contact the organizers?",
    a: "For any questions about the event, your registration, or your donation, write to us — a volunteer will get back to you:",
    links: [{ label: EVENT.contactEmail, href: `mailto:${EVENT.contactEmail}` }],
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
