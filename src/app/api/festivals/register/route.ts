import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { getOpenFestivalEvent } from "@/lib/festivals";
import { ensureSeededFestivalEvents } from "@/lib/myf";
import { sendFestivalConfirmation } from "@/lib/festivalEmail";
import { appendFestivalRegistrationToSheet, ensureFestivalSheetSetup } from "@/lib/sheets";

/**
 * Festival / dated-event registration.
 *
 * POST { eventId, name, email, phone, whatsapp?, location, organization?,
 *        hearAbout? }
 *
 * - Registration targets a published, still-upcoming dated event.
 * - Registrations are individual (one person per signup); capacity is
 *   enforced on total people, so legacy multi-guest rows still count.
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
    const whatsapp = String(body.whatsapp ?? "").trim().slice(0, 40);
    const location = String(body.location ?? "").trim().slice(0, 120);
    const organization = String(body.organization ?? "").trim().slice(0, 120);
    const hearAbout = String(body.hearAbout ?? "").trim().slice(0, 120);
    // Individual registrations — the form has no party-size field.
    const guests = 1;

    if (!name) {
      return NextResponse.json({ error: "Please tell us your name" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    // Mobile is mandatory — the door team needs a way to reach a party.
    // Accept any formatting but insist on a plausible digit count (E.164
    // tops out at 15).
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return NextResponse.json({ error: "A valid mobile number is required" }, { status: 400 });
    }
    // WhatsApp is optional (blank = same as mobile) but must look like a
    // number when given.
    const whatsappDigits = whatsapp.replace(/\D/g, "");
    if (whatsapp && (whatsappDigits.length < 7 || whatsappDigits.length > 15)) {
      return NextResponse.json(
        { error: "That WhatsApp number doesn't look right — leave it blank if it's the same as your mobile" },
        { status: 400 },
      );
    }
    if (!location) {
      return NextResponse.json({ error: "Please tell us your city and state" }, { status: 400 });
    }

    // Seeded events (src/data/myf.ts) may not be in the DB yet — e.g. a
    // registration racing the first page load after a deploy.
    await ensureSeededFestivalEvents(getPrismaClient());

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
          // guests untouched — legacy party-size registrations keep theirs
          name: name || existing.name,
          phone: phone || existing.phone,
          whatsapp: whatsapp || existing.whatsapp,
          location: location || existing.location,
          organization: organization || existing.organization,
        },
      });
    } else {
      const created = await db.rsvp.create({
        data: {
          name,
          email,
          phone: phone || null,
          whatsapp: whatsapp || null,
          location: location || null,
          organization: organization || null,
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
        guests: existing?.guests ?? guests,
        event,
        alreadyRegistered,
      }),
      alreadyRegistered
        ? // No new row, but still make sure the tab has its header row and
          // Follow-up dropdown (also retrofits tabs from before they existed)
          ensureFestivalSheetSetup(event.id, event.title).then(() => true)
        : appendFestivalRegistrationToSheet({
            eventId: event.id,
            event: event.title,
            name,
            email,
            phone,
            whatsapp,
            location,
            organization,
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
