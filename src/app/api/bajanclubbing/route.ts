import { NextResponse } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "@/lib/prisma";
import { EVENT, TIERS } from "@/data/bajanClubbing";

/**
 * Bhajan Clubbing registration API.
 *
 * Reuses the existing Program/Rsvp models: the event lives as a Program row
 * with the fixed id EVENT.programId (upserted on demand), so registrations
 * show up in the admin dashboard alongside every other RSVP.
 *
 * Capacity rules (all counted in guests, not rows):
 *  - EVENT.capacity caps the whole night.
 *  - Tiers with `tierLimit` (Front Row) are additionally capped; the tier a
 *    registration belongs to is recoverable from the "[Tier Name]" prefix
 *    stamped into notes, so no migration is needed.
 * Both checks run inside one transaction holding a per-event advisory
 * lock, so a burst of concurrent registrations queues instead of
 * overselling (or conflict-storming under serializable isolation).
 */

/** Tier tag stamped at the front of notes — also used to count tier usage. */
const tierTag = (tierName: string) => `[${tierName}]`;

/** Ensure the event's Program row exists and is current with the data file. */
async function ensureEventProgram(db: PrismaClient) {
  const data = {
    title: `${EVENT.title} — ${EVENT.volume}`,
    category: "Kirtan & Prasadam",
    description: EVENT.description,
    subtitle: EVENT.tagline,
    latitude: 40.6881,
    longitude: -73.9834,
    dayOfWeek: "Saturday",
    time: EVENT.timeLabel,
    venueName: EVENT.venue.name,
    address: EVENT.venue.address,
    duration: "4 hours",
    level: "All levels",
    capacity: EVENT.capacity,
    status: "published",
    featured: true,
  };
  return db.program.upsert({
    where: { id: EVENT.programId },
    update: data,
    create: { id: EVENT.programId, ...data },
  });
}

type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

/** Confirmed guest count for the event, optionally narrowed to one tier. */
async function countGuests(db: TxClient, tierName?: string) {
  const sum = await db.rsvp.aggregate({
    where: {
      programId: EVENT.programId,
      status: "confirmed",
      ...(tierName ? { notes: { startsWith: tierTag(tierName) } } : {}),
    },
    _sum: { guests: true },
  });
  return sum._sum.guests ?? 0;
}

/** GET — remaining passes (overall + per limited tier) for the live meter. */
export async function GET() {
  const offline = { capacity: EVENT.capacity, confirmed: null, remaining: null, tiers: null };
  try {
    const db = getPrismaClient();
    if (!db) return NextResponse.json(offline);

    const taken = await countGuests(db);
    const limitedTiers = TIERS.filter((t) => t.tierLimit);
    const tierEntries = await Promise.all(
      limitedTiers.map(async (t) => {
        const tierTaken = await countGuests(db, t.name);
        return [
          t.id,
          { limit: t.tierLimit, taken: tierTaken, remaining: Math.max(0, (t.tierLimit ?? 0) - tierTaken) },
        ] as const;
      }),
    );

    return NextResponse.json({
      capacity: EVENT.capacity,
      confirmed: taken,
      remaining: Math.max(0, EVENT.capacity - taken),
      tiers: Object.fromEntries(tierEntries),
    });
  } catch {
    return NextResponse.json(offline);
  }
}

/** Outcome of the transactional booking attempt. */
type BookingResult =
  | { ok: true; id: string }
  | { ok: false; reason: "event-full" | "tier-full"; remaining: number };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, guests, notes, tier, tierId } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { error: "Registration is briefly offline — DM us on Instagram and we'll save your spot" },
        { status: 503 },
      );
    }

    await ensureEventProgram(db);

    const guestCount = Math.min(5, Math.max(1, parseInt(guests) || 1));
    const tierDef =
      TIERS.find((t) => t.id === tierId) ??
      TIERS.find((t) => typeof tier === "string" && t.name === tier.trim());

    // Tier rides in notes so it shows in the admin table without a migration
    const tierLabel = tierDef
      ? tierTag(tierDef.name)
      : typeof tier === "string" && tier.trim()
        ? tierTag(tier.trim().slice(0, 40))
        : null;
    const combinedNotes = [tierLabel, notes || null].filter(Boolean).join(" ") || null;

    const book = (tx: TxClient) =>
      (async (): Promise<BookingResult> => {
        // One booking at a time for this event — released on commit/rollback.
        // (::text because Prisma can't deserialize the function's void return.)
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${EVENT.programId}))::text`;
        const taken = await countGuests(tx);
        if (taken + guestCount > EVENT.capacity) {
          return { ok: false, reason: "event-full", remaining: Math.max(0, EVENT.capacity - taken) };
        }
        if (tierDef?.tierLimit) {
          const tierTaken = await countGuests(tx, tierDef.name);
          if (tierTaken + guestCount > tierDef.tierLimit) {
            return { ok: false, reason: "tier-full", remaining: Math.max(0, tierDef.tierLimit - tierTaken) };
          }
        }
        const rsvp = await tx.rsvp.create({
          data: {
            name,
            email,
            phone: phone || null,
            guests: guestCount,
            notes: combinedNotes,
            programId: EVENT.programId,
          },
        });
        return { ok: true, id: rsvp.id };
      })();

    // Generous waits: during an on-sale burst, bookings queue behind the
    // advisory lock; each one holds it for only a few milliseconds.
    const result = await db.$transaction(book, { maxWait: 10_000, timeout: 15_000 });

    if (!result.ok) {
      const { reason, remaining } = result;
      if (reason === "tier-full" && tierDef) {
        return NextResponse.json(
          {
            error:
              remaining > 0
                ? `Only ${remaining} ${tierDef.name} pass${remaining === 1 ? "" : "es"} left — drop your crew size or pick another tier`
                : `${tierDef.name} is sold out — General Vibes still gets you everything that matters`,
          },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Only ${remaining} pass${remaining === 1 ? "" : "es"} left`
              : "Passes are sold out — join the door line at 6:45 PM",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { id: result.id, message: "Pass confirmed" },
      { status: 201 },
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You're already on the list — see you on the floor!" },
        { status: 409 },
      );
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error("Bhajan Clubbing registration error:", message, error);
    return NextResponse.json(
      { error: "Something went wrong — please try again" },
      { status: 500 },
    );
  }
}
