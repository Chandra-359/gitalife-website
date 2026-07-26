import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { getOpenFestivalEvent } from "@/lib/festivals";
import { sendFestivalConfirmation } from "@/lib/festivalEmail";
import { appendFestivalRegistrationToSheet } from "@/lib/sheets";

/**
 * Festival / dated-event registration.
 *
 * POST { eventId, name, email, phone?, guests?, hearAbout? }
 *
 * - Registration targets a published, still-upcoming dated event.
 * - Capacity is enforced on total people (sum of guests).
 * - One registration per email per event: repeats re-send the
 *   confirmation (and update the party size) instead of duplicating.
 * - Confirmation email carries a single-occurrence calendar invite from
 *   no-reply@; one reminder goes out the day before via the cron.
 * - Each new registration lands as a row on the check-in Google Sheet.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventId = String(body.eventId ?? "");
    const name = String(body.name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 255);
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const hearAbout = String(body.hearAbout ?? "").trim().slice(0, 120);
    const guests = Math.min(10, Math.max(1, parseInt(String(body.guests)) || 1));

    if (!name) {
      return NextResponse.json({ error: "Please tell us your name" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const event = await getOpenFestivalEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { error: "This event isn't open for registration" },
        { status: 400 },
      );
    }

    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { error: "Registration is briefly offline — please try again in a few minutes" },
        { status: 503 },
      );
    }

    const existing = await db.rsvp.findUnique({
      where: { email_programId: { email, programId: eventId } },
    });

    // Capacity on people, not signups — a party of 4 takes 4 spots.
    if (event.capacity != null) {
      const alreadyHeld = existing?.status === "confirmed" ? existing.guests : 0;
      const taken = event.registeredCount - alreadyHeld;
      if (taken + guests > event.capacity) {
        const remaining = event.capacity - taken;
        return NextResponse.json(
          {
            error:
              remaining > 0
                ? `Only ${remaining} spot${remaining === 1 ? "" : "s"} left — try a smaller group`
                : "This event is full",
          },
          { status: 400 },
        );
      }
    }

    let rsvpId: string;
    let alreadyRegistered = false;

    if (existing) {
      alreadyRegistered = true;
      rsvpId = existing.id;
      await db.rsvp.update({
        where: { id: existing.id },
        data: {
          status: "confirmed",
          remindersEnabled: true,
          remindersOptOutAt: null,
          guests, // latest party size wins — simplest mental model
          name: name || existing.name,
          phone: phone || existing.phone,
        },
      });
    } else {
      const created = await db.rsvp.create({
        data: {
          name,
          email,
          phone: phone || null,
          guests,
          hearAbout: hearAbout || null,
          emailOptIn: true,
          programId: eventId,
        },
      });
      rsvpId = created.id;
    }

    const [emailOutcome] = await Promise.all([
      sendFestivalConfirmation({
        to: email,
        name,
        rsvpId,
        guests,
        event,
        alreadyRegistered,
      }),
      alreadyRegistered
        ? Promise.resolve(true)
        : appendFestivalRegistrationToSheet({
            event: event.title,
            name,
            email,
            phone,
            guests,
            hearAbout,
          }),
    ]);

    if (!emailOutcome.ok) {
      console.error(`Festival confirmation to ${email} for ${eventId} failed:`, emailOutcome.error);
    }

    return NextResponse.json({
      ok: true,
      alreadyRegistered,
      emailed: emailOutcome.ok,
    });
  } catch (error) {
    if (
      typeof error === "object" && error !== null &&
      "code" in error && (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ ok: true, alreadyRegistered: true, emailed: false });
    }
    console.error("Festival registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong — please try again" },
      { status: 500 },
    );
  }
}
