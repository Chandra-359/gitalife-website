import { getPrismaClient } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/weeklyPrograms";
import { getWeeklyProgramConfig } from "@/data/weeklyPrograms";

/**
 * One-click unsubscribe from weekly program reminders.
 *
 *   GET  /api/programs/unsubscribe?rsvp=<id>&token=<hmac>          → opt out
 *   GET  …&resubscribe=1                                           → opt back in
 *   POST (same params) — RFC 8058 one-click, used by mail clients
 *
 * The token is an HMAC of the RSVP id (see src/lib/weeklyPrograms.ts),
 * so links can't be forged for other people. Unsubscribing only stops
 * reminder emails — the registration itself stays confirmed.
 */

function page(title: string, message: string, extraHtml = ""): Response {
  return new Response(
    `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Gita Life NYC</title></head>
<body style="margin:0;background:#EFE8D6;font-family:Georgia,'Times New Roman',serif;color:#15224F;">
  <div style="max-width:520px;margin:0 auto;padding:64px 24px;text-align:center;">
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#6B5F45;margin:0;">Gita Life NYC</p>
    <h1 style="font-size:30px;font-weight:600;margin:14px 0 0;">${title}</h1>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#4F4634;margin:14px 0 0;">${message}</p>
    ${extraHtml}
    <p style="margin:36px 0 0;"><a href="/programs" style="font-family:Arial,Helvetica,sans-serif;display:inline-block;background:#D9691A;color:#fff;text-decoration:none;font-weight:bold;font-size:13px;padding:12px 26px;border-radius:999px;">Back to programs</a></p>
  </div>
</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const rsvpId = url.searchParams.get("rsvp") ?? "";
  const token = url.searchParams.get("token") ?? "";
  const resubscribe = url.searchParams.get("resubscribe") === "1";

  if (!rsvpId || !token || !verifyUnsubscribeToken(rsvpId, token)) {
    return page(
      "That link didn't work",
      "This unsubscribe link looks incomplete or expired. Use the link at the bottom of any reminder email, or write to us and we'll take care of it.",
    );
  }

  const db = getPrismaClient();
  if (!db) {
    return page(
      "Please try again shortly",
      "We couldn't update your preferences just now. The link will keep working — try again in a few minutes.",
    );
  }

  const rsvp = await db.rsvp.findUnique({ where: { id: rsvpId } });
  if (!rsvp) {
    return page(
      "Nothing to change",
      "We couldn't find this registration — you may have already been removed.",
    );
  }

  await db.rsvp.update({
    where: { id: rsvpId },
    data: resubscribe
      ? { remindersEnabled: true, remindersOptOutAt: null }
      : { remindersEnabled: false, remindersOptOutAt: new Date() },
  });

  const programName = getWeeklyProgramConfig(rsvp.programId)?.title ?? "your program";

  if (resubscribe) {
    return page(
      "Reminders are back on",
      `You'll hear from us again the day before each ${programName} session. See you soon 🙏`,
    );
  }

  const resubUrl = `${url.pathname}?rsvp=${encodeURIComponent(rsvpId)}&token=${encodeURIComponent(token)}&resubscribe=1`;
  return page(
    "You're unsubscribed",
    `No more weekly reminders for ${programName}. Your registration is still saved — you're always welcome to just show up.`,
    `<p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B5F45;margin:18px 0 0;">Changed your mind? <a href="${resubUrl}" style="color:#A8842A;">Turn reminders back on</a>.</p>`,
  );
}

export async function GET(request: Request) {
  return handle(request);
}

/** RFC 8058 one-click unsubscribe (mail clients POST to the same URL). */
export async function POST(request: Request) {
  return handle(request);
}
