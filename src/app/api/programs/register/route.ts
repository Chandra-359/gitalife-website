import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { getWeeklyProgramConfig } from "@/data/weeklyPrograms";
import {
  ensureWeeklyProgram,
  getWeeklyPrograms,
} from "@/lib/weeklyPrograms";
import { sendProgramWelcome } from "@/lib/programEmail";
import { appendWeeklyRegistrationToSheet } from "@/lib/sheets";

/**
 * Weekly program registration — register once, come every week.
 *
 * POST { programId, name, email, phone?, hearAbout? }
 *
 * - New email for this program → RSVP is created, a welcome email with a
 *   recurring calendar invite goes out from no-reply@, and one row lands
 *   on the check-in Google Sheet.
 * - Email already registered → nothing is duplicated (unique constraint
 *   on email+programId is the backstop); we simply re-send the welcome
 *   email with the invite and tell the client `alreadyRegistered`.
 *   Re-registering also switches weekly reminders back on — it's the
 *   clearest "I want back in" signal we can get.
 *
 * Email + sheet are best-effort: the database row is the registration.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const programId = String(body.programId ?? "");
    const name = String(body.name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 255);
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const hearAbout = String(body.hearAbout ?? "").trim().slice(0, 120);

    const config = getWeeklyProgramConfig(programId);
    if (!config) {
      return NextResponse.json({ error: "Unknown program" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Please tell us your name" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { error: "Registration is briefly offline — please try again in a few minutes" },
        { status: 503 },
      );
    }

    await ensureWeeklyProgram(db, config);

    const existing = await db.rsvp.findUnique({
      where: { email_programId: { email, programId } },
    });

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
          // Keep the freshest contact details on file
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
          hearAbout: hearAbout || null,
          emailOptIn: true,
          programId,
        },
      });
      rsvpId = created.id;
    }

    // Fetch the live merged program (topic/poster) for the email body.
    const live = (await getWeeklyPrograms()).find((p) => p.id === programId)!;

    const [emailOutcome] = await Promise.all([
      sendProgramWelcome({
        to: email,
        name,
        rsvpId,
        program: live,
        alreadyRegistered,
      }),
      alreadyRegistered
        ? Promise.resolve(true) // don't duplicate the check-in row
        : appendWeeklyRegistrationToSheet({
            program: config.title,
            name,
            email,
            phone,
            hearAbout,
          }),
    ]);

    if (!emailOutcome.ok) {
      console.error(`Welcome email to ${email} for ${programId} failed:`, emailOutcome.error);
    }

    return NextResponse.json({
      ok: true,
      alreadyRegistered,
      emailed: emailOutcome.ok,
    });
  } catch (error) {
    // Unique-constraint race: two tabs submitting at once — treat as registered.
    if (
      typeof error === "object" && error !== null &&
      "code" in error && (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ ok: true, alreadyRegistered: true, emailed: false });
    }
    console.error("Program registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong — please try again" },
      { status: 500 },
    );
  }
}
