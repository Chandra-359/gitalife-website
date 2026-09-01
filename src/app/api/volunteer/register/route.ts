import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { getVolunteerDriveLive, resolveShiftKeys } from "@/lib/volunteer";
import { findVolunteerDrive } from "@/data/volunteer";
import { sendVolunteerConfirmation } from "@/lib/volunteerEmail";
import { appendVolunteerSignupToSheet } from "@/lib/sheets";
import { checkFormGuard, FORM_GUARD_MESSAGES } from "@/lib/formGuard";

/**
 * Volunteer drive signup.
 *
 * POST { driveId, name, email, phone, whatsapp?, location, occupation,
 *        shiftKeys: string[], notes? }
 *
 * - Signups target a published drive from src/data/volunteer.ts; shift
 *   keys are validated against its config (stale ones are dropped).
 * - One signup per email per drive: re-submitting REPLACES the chosen
 *   shifts (the "edit my shifts" path) and re-sends the confirmation.
 * - Shift capacities are coordinator targets for the admin fill board,
 *   not caps — signups never block on them.
 * - Confirmation email carries every shift plus a calendar invite; each
 *   submission also lands as an audit row on the drive's Google Sheet
 *   tab ("Signed up" / "Updated shifts").
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Spam guard — bots stuffing the honeypot get a FAKE success (so
    // they move on quietly); missing/forged/too-fast tokens get a
    // humane retry message. Real signups are unaffected.
    const guard = checkFormGuard(body);
    if (!guard.ok) {
      if (guard.reason === "honeypot") {
        return NextResponse.json({ ok: true, alreadyRegistered: false, emailed: true });
      }
      return NextResponse.json({ error: FORM_GUARD_MESSAGES[guard.reason] }, { status: 400 });
    }

    const driveId = String(body.driveId ?? "");
    const name = String(body.name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 255);
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const whatsapp = String(body.whatsapp ?? "").trim().slice(0, 40);
    const location = String(body.location ?? "").trim().slice(0, 120);
    const occupation = String(body.occupation ?? "").trim().slice(0, 40);
    const notes = String(body.notes ?? "").trim().slice(0, 500);
    const submittedKeys: string[] = Array.isArray(body.shiftKeys)
      ? body.shiftKeys.filter((k: unknown): k is string => typeof k === "string").slice(0, 40)
      : [];

    if (!name) {
      return NextResponse.json({ error: "Please tell us your name" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    // Mobile is mandatory — coordinators need a way to reach the crew.
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
    if (!occupation) {
      return NextResponse.json(
        { error: "Please tell us whether you're a student or working" },
        { status: 400 },
      );
    }

    const config = findVolunteerDrive(driveId);
    if (!config || config.status !== "published") {
      return NextResponse.json(
        { error: "This drive isn't open for signups" },
        { status: 400 },
      );
    }

    const drive = await getVolunteerDriveLive(driveId);
    if (!drive) {
      return NextResponse.json(
        { error: "This drive isn't open for signups" },
        { status: 400 },
      );
    }

    // Stale keys (a shift edited out of the config since page load) are
    // dropped; an empty result means nothing valid was picked.
    const shifts = resolveShiftKeys(drive, submittedKeys);
    if (shifts.length === 0) {
      return NextResponse.json(
        { error: "Pick at least one shift — refresh the page if the list looks off" },
        { status: 400 },
      );
    }

    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { error: "Signups are briefly offline — please try again in a few minutes" },
        { status: 503 },
      );
    }

    const existing = await db.volunteerSignup.findUnique({
      where: { email_driveId: { email, driveId } },
    });

    // Shift capacities are coordinator TARGETS (the /admin/volunteers
    // fill board tracks them) — extra hands are never turned away, so
    // signups don't block on them.
    const shiftKeys = shifts.map((s) => s.key);
    const alreadyRegistered = !!existing;

    if (existing) {
      await db.volunteerSignup.update({
        where: { id: existing.id },
        data: {
          status: "confirmed",
          name: name || existing.name,
          phone: phone || existing.phone,
          whatsapp: whatsapp || existing.whatsapp,
          location: location || existing.location,
          occupation: occupation || existing.occupation,
          notes: notes || existing.notes,
          shiftKeys,
        },
      });
    } else {
      await db.volunteerSignup.create({
        data: {
          driveId,
          name,
          email,
          phone,
          whatsapp: whatsapp || null,
          location,
          occupation,
          notes: notes || null,
          shiftKeys,
        },
      });
    }

    const shiftSummary = shifts
      .map((s) => `${s.activityTitle} — ${s.dayChip} · ${s.timeLabel}`)
      .join("\n");

    const [emailOutcome] = await Promise.all([
      sendVolunteerConfirmation({
        to: email,
        name,
        drive,
        shifts,
        alreadyRegistered,
      }),
      appendVolunteerSignupToSheet(
        {
          driveId,
          drive: drive.title,
          name,
          email,
          phone,
          whatsapp,
          location,
          occupation,
          shifts: shiftSummary,
          notes,
          status: alreadyRegistered ? "Updated shifts" : "Signed up",
        },
        config.sheetTab,
      ),
    ]);

    if (!emailOutcome.ok) {
      console.error(`Volunteer confirmation to ${email} for ${driveId} failed:`, emailOutcome.error);
    }

    return NextResponse.json({
      ok: true,
      alreadyRegistered,
      emailed: emailOutcome.ok,
      shifts: shifts.map((s) => ({
        activityTitle: s.activityTitle,
        dayChip: s.dayChip,
        timeLabel: s.timeLabel,
      })),
    });
  } catch (error) {
    if (
      typeof error === "object" && error !== null &&
      "code" in error && (error as { code: string }).code === "P2002"
    ) {
      // Unique-constraint race on (email, driveId) — treat as a repeat
      return NextResponse.json({ ok: true, alreadyRegistered: true, emailed: false });
    }
    console.error("Volunteer signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong — please try again" },
      { status: 500 },
    );
  }
}
