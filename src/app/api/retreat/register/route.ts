import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { findRetreatBySlug, formatUsd, isOccupation, retreatPrice } from "@/data/retreats";
import { ensureRetreatPrograms } from "@/lib/retreat";
import { sendRetreatConfirmation } from "@/lib/retreatEmail";
import { appendRetreatRegistrationToSheet, markRetreatSheetPaymentReported } from "@/lib/sheets";
import { checkFormGuard, FORM_GUARD_MESSAGES } from "@/lib/formGuard";

/**
 * Retreat registration (src/data/retreats.ts).
 *
 * POST { slug, name, email, phone, whatsapp?, location, occupation,
 *        organization, notes?, paymentSent? }
 *
 * - One registration per email per retreat: a repeat re-sends the
 *   confirmation and updates the details — including flipping the
 *   payment status to "reported" when they tick "I've sent it" — instead
 *   of duplicating.
 * - Payment is by Zelle outside the site; the amount comes from the
 *   occupation (student vs working) and the retreat's price list.
 * - Each new registration lands as a row on the retreat's Google Sheet
 *   tab; a later "I've paid" re-submission flips that row's Payment cell.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Spam guard — bots stuffing the honeypot get a FAKE success (so
    // they move on quietly); missing/forged/too-fast tokens get a
    // humane retry message. Real registrations are unaffected.
    const guard = checkFormGuard(body);
    if (!guard.ok) {
      if (guard.reason === "honeypot") {
        return NextResponse.json({ ok: true, alreadyRegistered: false, emailed: true });
      }
      return NextResponse.json({ error: FORM_GUARD_MESSAGES[guard.reason] }, { status: 400 });
    }

    const slug = String(body.slug ?? "");
    const name = String(body.name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 255);
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const whatsapp = String(body.whatsapp ?? "").trim().slice(0, 40);
    const location = String(body.location ?? "").trim().slice(0, 120);
    const organization = String(body.organization ?? "").trim().slice(0, 120);
    const notes = String(body.notes ?? "").trim().slice(0, 500);
    const occupation = body.occupation;
    const paymentSent = body.paymentSent === true;

    const retreat = findRetreatBySlug(slug);
    if (!retreat || retreat.status === "draft") {
      return NextResponse.json({ error: "This retreat isn't open for registration" }, { status: 400 });
    }
    if (retreat.status === "closed") {
      return NextResponse.json(
        { error: "Registration for this retreat has closed — write to us if you still need a spot" },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json({ error: "Please tell us your name" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return NextResponse.json({ error: "A valid mobile number is required" }, { status: 400 });
    }
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
    if (!isOccupation(occupation)) {
      return NextResponse.json({ error: "Let us know if you're a student or working" }, { status: 400 });
    }
    if (!organization) {
      return NextResponse.json(
        { error: occupation === "Student" ? "Which university are you at?" : "Where do you work?" },
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

    // The retreat's Program row may not exist yet (first registration
    // after a deploy) — registrations attach to it.
    await ensureRetreatPrograms(db);

    const amount = retreatPrice(retreat, occupation);
    // Same "[tier · PAID] free text" convention the check-in board parses
    // for Bhajan Clubbing, so the door board shows tier + paid at a glance.
    const noteTag = `[${occupation} · ${formatUsd(amount)}${paymentSent ? " · PAID" : ""}]`;
    const noteText = [noteTag, notes].filter(Boolean).join(" ");

    const existing = await db.rsvp.findUnique({
      where: { email_programId: { email, programId: retreat.id } },
    });

    if (retreat.capacity != null && !(existing?.status === "confirmed")) {
      const taken = await db.rsvp.count({ where: { programId: retreat.id, status: "confirmed" } });
      if (taken >= retreat.capacity) {
        return NextResponse.json({ error: "This retreat is full" }, { status: 400 });
      }
    }

    let rsvpId: string;
    let alreadyRegistered = false;
    // Once reported, a payment stays reported even if the box is left
    // unticked on a later re-submission.
    const paymentReported = paymentSent || existing?.paymentStatus === "reported";
    const paymentStatus = paymentReported ? "reported" : "pending";

    if (existing) {
      alreadyRegistered = true;
      rsvpId = existing.id;
      await db.rsvp.update({
        where: { id: existing.id },
        data: {
          status: "confirmed",
          remindersEnabled: true,
          remindersOptOutAt: null,
          name: name || existing.name,
          phone: phone || existing.phone,
          whatsapp: whatsapp || existing.whatsapp,
          location: location || existing.location,
          organization: organization || existing.organization,
          occupation,
          paymentStatus,
          notes: paymentReported && !paymentSent ? existing.notes : noteText,
        },
      });
    } else {
      const created = await db.rsvp.create({
        data: {
          name,
          email,
          phone,
          whatsapp: whatsapp || null,
          location,
          organization,
          occupation,
          paymentStatus,
          notes: noteText,
          guests: 1,
          emailOptIn: true,
          programId: retreat.id,
        },
      });
      rsvpId = created.id;
    }

    const [emailOutcome] = await Promise.all([
      sendRetreatConfirmation({
        to: email,
        name,
        rsvpId,
        retreat,
        occupation,
        paymentReported,
        alreadyRegistered,
      }),
      alreadyRegistered
        ? // No new row — but a fresh "I've paid" flips the existing row's
          // Payment cell so organizers see it without re-checking the DB
          paymentSent && existing?.paymentStatus !== "reported"
          ? markRetreatSheetPaymentReported(retreat.sheetTab, email)
          : Promise.resolve(false)
        : appendRetreatRegistrationToSheet({
            sheetTab: retreat.sheetTab,
            name,
            email,
            phone,
            whatsapp,
            location,
            occupation,
            organization,
            amount: formatUsd(amount),
            payment: paymentSent ? "Reported by attendee" : "Not paid",
            notes,
          }),
    ]);

    if (!emailOutcome.ok) {
      console.error(`Retreat confirmation to ${email} for ${retreat.id} failed:`, emailOutcome.error);
    }

    return NextResponse.json({
      ok: true,
      alreadyRegistered,
      emailed: emailOutcome.ok,
      paymentReported,
      amount,
    });
  } catch (error) {
    if (
      typeof error === "object" && error !== null &&
      "code" in error && (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ ok: true, alreadyRegistered: true, emailed: false });
    }
    console.error("Retreat registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong — please try again" },
      { status: 500 },
    );
  }
}
