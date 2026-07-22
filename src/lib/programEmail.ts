/**
 * programEmail.ts — mail for the weekly programs.
 *
 * Two messages, both sent from no-reply@gitalifenyc.com:
 *
 *  1. Welcome — sent once at registration. Carries a RECURRING calendar
 *     invite (.ics with an RRULE + a proper America/New_York VTIMEZONE,
 *     so the weekly slot survives DST) plus venue, transit, and timing.
 *  2. Weekly reminder — sent the day before each class by the cron at
 *     /api/cron/reminders. Features this week's topic and poster from
 *     the /admin/weekly console, and a one-click unsubscribe link
 *     (also advertised via the List-Unsubscribe header).
 *
 * Warm khadi-paper styling to match the site — intentionally distinct
 * from the neon Bhajan Clubbing receipts in email.ts.
 */

import { sendEmail, type SendOutcome } from "@/lib/email";
import {
  PROGRAMS_CONTACT_EMAIL,
  PROGRAMS_FROM_EMAIL,
  SITE_URL,
  type WeeklyProgram,
} from "@/data/weeklyPrograms";
import {
  nextOccurrence,
  occurrenceLabel,
  unsubscribeToken,
  type Occurrence,
  type WeeklyProgramLive,
} from "@/lib/weeklyPrograms";

const BYDAY: Record<WeeklyProgram["dayOfWeek"], string> = {
  Sunday: "SU", Monday: "MO", Tuesday: "TU", Wednesday: "WE",
  Thursday: "TH", Friday: "FR", Saturday: "SA",
};

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, "");
}

export function unsubscribeUrl(rsvpId: string): string {
  return `${siteUrl()}/api/programs/unsubscribe?rsvp=${encodeURIComponent(rsvpId)}&token=${unsubscribeToken(rsvpId)}`;
}

/* ------------------------------------------------------------------ */
/*  Calendar payloads                                                  */
/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, "0");

/** Local (floating-in-TZID) stamp: 20260306T190000 */
function localStamp(o: Occurrence, minutesLater = 0): string {
  const d = new Date(Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute) + minutesLater * 60_000);
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`
  );
}

const icsEscape = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/**
 * Recurring weekly invite. TZID + VTIMEZONE keep the class pinned to
 * its Eastern wall-clock time across DST changes.
 */
export function weeklyInviteIcs(program: WeeklyProgram, o: Occurrence): string {
  const now = new Date();
  const dtstamp =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gita Life NYC//Weekly Programs//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/New_York",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "TZNAME:EDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "TZNAME:EST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${program.id}@gitalifenyc.com`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=America/New_York:${localStamp(o)}`,
    `DTEND;TZID=America/New_York:${localStamp(o, program.durationMinutes)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[program.dayOfWeek]}`,
    `SUMMARY:${icsEscape(`${program.title} — Gita Life NYC`)}`,
    `DESCRIPTION:${icsEscape(`${program.description}\n\n${program.transit}\n\n${siteUrl()}/programs`)}`,
    `LOCATION:${icsEscape(`${program.venueName}, ${program.address}`)}`,
    `URL:${siteUrl()}/programs`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(program: WeeklyProgram, o: Occurrence): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${program.title} — Gita Life NYC`,
    dates: `${localStamp(o)}/${localStamp(o, program.durationMinutes)}`,
    ctz: "America/New_York",
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[program.dayOfWeek]}`,
    details: `${program.description}\n\n${program.transit}\n\n${siteUrl()}/programs`,
    location: `${program.venueName}, ${program.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* ------------------------------------------------------------------ */
/*  Shared template scaffolding — warm paper look                      */
/* ------------------------------------------------------------------ */

const P = {
  bg: "#EFE8D6",     // paper
  card: "#FBF5E6",   // cream card
  ink: "#15224F",    // indigo ink
  dim: "#6B5F45",    // warm secondary
  line: "rgba(21,34,79,0.14)",
  gold: "#A8842A",
};

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid ${P.line};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${P.dim};vertical-align:top;white-space:nowrap;">${label}</td>
    <td style="padding:9px 0 9px 18px;border-bottom:1px solid ${P.line};font-size:14px;font-weight:600;color:${P.ink};text-align:right;">${value}</td>
  </tr>`;
}

function shell(accent: string, kicker: string, headline: string, bodyHtml: string, footerHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${P.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${P.bg};padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
    <tr><td style="padding:0 8px 18px;text-align:center;font-family:Georgia,'Times New Roman',serif;">
      <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">${kicker}</p>
      <h1 style="margin:10px 0 0;font-size:30px;line-height:1.15;color:${P.ink};font-weight:600;">${headline}</h1>
    </td></tr>
    <tr><td style="background:${P.card};border:1px solid ${P.line};border-top:4px solid ${accent};border-radius:16px;padding:28px;font-family:Arial,Helvetica,sans-serif;">
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:18px 8px 0;text-align:center;">
      ${footerHtml}
      <p style="margin:12px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">
        Gita Life NYC · A community initiative under ISKCON
      </p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

function buttonPair(accent: string, primary: { href: string; label: string }, secondary: { href: string; label: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
    <tr>
      <td style="border-radius:999px;background:${accent};">
        <a href="${primary.href}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:bold;color:#FFFFFF;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${primary.label}</a>
      </td>
      <td style="width:10px;"></td>
      <td style="border-radius:999px;border:1px solid ${P.line};">
        <a href="${secondary.href}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:bold;color:${P.ink};text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${secondary.label}</a>
      </td>
    </tr>
  </table>`;
}

function contactLine(): string {
  return `<p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:${P.dim};">
    Questions? Write to us at
    <a href="mailto:${PROGRAMS_CONTACT_EMAIL}" style="color:${P.gold};font-weight:bold;text-decoration:none;">${PROGRAMS_CONTACT_EMAIL}</a>
    — a volunteer will get back to you.
  </p>`;
}

/* ------------------------------------------------------------------ */
/*  1. Welcome email (sent once, at registration)                      */
/* ------------------------------------------------------------------ */

export interface WelcomeDetails {
  to: string;
  name: string;
  rsvpId: string;
  program: WeeklyProgramLive;
  /** True when the person was already registered and asked again. */
  alreadyRegistered?: boolean;
}

export async function sendProgramWelcome(d: WelcomeDetails): Promise<SendOutcome> {
  const { program } = d;
  const o = nextOccurrence(program);
  const first = d.name.split(" ")[0];
  const nextLabel = `${occurrenceLabel(o)} · ${program.timeLabel}`;
  const gcal = googleCalendarUrl(program, o);
  const unsub = unsubscribeUrl(d.rsvpId);

  const topicBlock = program.lectureTopic
    ? `<p style="margin:18px 0 0;padding:12px 16px;background:rgba(168,132,42,0.09);border:1px solid rgba(168,132,42,0.3);border-radius:10px;font-size:13px;line-height:1.6;color:${P.ink};">
         <strong>This week's topic:</strong> ${program.lectureTopic}${program.gitaReference ? ` <span style="color:${P.dim};">(${program.gitaReference})</span>` : ""}
       </p>`
    : "";

  const intro = d.alreadyRegistered
    ? `You're already on the list for <strong>${program.title}</strong> — no need to register twice. Here are your details and a fresh calendar invite.`
    : `Your seat at <strong>${program.title}</strong> is saved — once. That's it: no weekly sign-ups, no tickets. Just come.`;

  const body = `
    <h2 style="margin:0;font-size:20px;color:${P.ink};">Welcome, ${first} 🙏</h2>
    <p style="margin:10px 0 0;font-size:13.5px;line-height:1.65;color:${P.dim};">${intro}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${detailRow("Every", `${program.dayOfWeek}s, ${program.timeLabel}`)}
      ${detailRow("Next class", nextLabel)}
      ${detailRow("Venue", program.venueName)}
      ${detailRow("Address", program.address)}
      ${detailRow("Getting there", program.transit)}
    </table>
    ${topicBlock}
    ${buttonPair(program.accent, { href: gcal, label: "Add to Google Calendar" }, { href: program.mapsUrl, label: "Get directions" })}
    <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:${P.dim};">
      The attached invite repeats weekly, so ${program.dayOfWeek} evenings are yours from here on.
      We'll also send a short reminder with each week's topic the day before class.
    </p>
    ${contactLine()}`;

  const footer = `<p style="margin:0;font-size:11px;line-height:1.7;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">
    Don't want weekly reminders? <a href="${unsub}" style="color:${P.dim};text-decoration:underline;">Unsubscribe with one click</a> — your registration stays.
  </p>`;

  const text = `Welcome, ${first}!

${d.alreadyRegistered ? "You're already registered — no need to sign up twice. Here are your details again." : `Your seat at ${program.title} is saved — no weekly sign-ups needed.`}

Every: ${program.dayOfWeek}s, ${program.timeLabel}
Next class: ${nextLabel}
Venue: ${program.venueName}
Address: ${program.address}
Getting there: ${program.transit}
${program.lectureTopic ? `\nThis week's topic: ${program.lectureTopic}${program.gitaReference ? ` (${program.gitaReference})` : ""}\n` : ""}
Add to Google Calendar: ${gcal}
Directions: ${program.mapsUrl}

The attached invite repeats weekly. We'll send a reminder with each week's topic the day before class.
Unsubscribe from reminders (your registration stays): ${unsub}

Questions? ${PROGRAMS_CONTACT_EMAIL}
${siteUrl()}/programs`;

  return sendEmail({
    from: PROGRAMS_FROM_EMAIL,
    replyTo: PROGRAMS_CONTACT_EMAIL,
    to: d.to,
    subject: d.alreadyRegistered
      ? `You're already in — ${program.title}, ${program.dayOfWeek}s ${program.timeLabel}`
      : `You're in! ${program.title} — every ${program.dayOfWeek}, ${program.timeLabel}`,
    html: shell(
      program.accent,
      "Gita Life NYC · Weekly Program",
      program.title,
      body,
      footer,
    ),
    text,
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    attachments: [
      {
        filename: `${program.slug}-weekly.ics`,
        content: weeklyInviteIcs(program, o),
        contentType: "text/calendar; method=PUBLISH",
      },
    ],
  });
}

/* ------------------------------------------------------------------ */
/*  2. Weekly reminder (sent by the cron, day before class)            */
/* ------------------------------------------------------------------ */

export interface ReminderDetails {
  to: string;
  name: string;
  rsvpId: string;
  program: WeeklyProgramLive;
}

export async function sendProgramReminder(d: ReminderDetails): Promise<SendOutcome> {
  const { program } = d;
  const o = nextOccurrence(program);
  const first = d.name.split(" ")[0];
  const dateLabel = occurrenceLabel(o);
  const unsub = unsubscribeUrl(d.rsvpId);

  const poster = program.posterUrl
    ? `<img src="${program.posterUrl}" alt="${program.title} poster" width="504" style="display:block;width:100%;max-width:504px;border-radius:12px;margin:0 0 20px;border:1px solid ${P.line};" />`
    : "";

  const topic = program.lectureTopic
    ? `<p style="margin:14px 0 0;font-size:16px;line-height:1.5;color:${P.ink};font-weight:600;">
         “${program.lectureTopic}”
       </p>
       ${program.gitaReference ? `<p style="margin:4px 0 0;font-size:12.5px;color:${P.dim};">${program.gitaReference}</p>` : ""}`
    : `<p style="margin:14px 0 0;font-size:14px;line-height:1.6;color:${P.dim};">Kirtan, wisdom, and prasadam — same time, same place.</p>`;

  const speaker = program.speakerName
    ? `<p style="margin:10px 0 0;font-size:12.5px;color:${P.dim};">with <strong style="color:${P.ink};">${program.speakerName}</strong>${program.speakerTitle ? ` · ${program.speakerTitle}` : ""}</p>`
    : "";

  const body = `
    ${poster}
    <h2 style="margin:0;font-size:20px;color:${P.ink};">See you tomorrow, ${first}</h2>
    <p style="margin:8px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${P.dim};">This week at ${program.name}</p>
    ${topic}
    ${speaker}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${detailRow("When", `${dateLabel} · ${program.timeLabel}`)}
      ${detailRow("Venue", program.venueName)}
      ${detailRow("Address", program.address)}
      ${detailRow("Getting there", program.transit)}
    </table>
    ${buttonPair(program.accent, { href: program.mapsUrl, label: "Get directions" }, { href: `${siteUrl()}/programs`, label: "Program details" })}
    ${contactLine()}`;

  const footer = `<p style="margin:0;font-size:11px;line-height:1.7;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">
    You're receiving this because you registered for ${program.title}.
    <a href="${unsub}" style="color:${P.dim};text-decoration:underline;">Unsubscribe from weekly reminders</a>.
  </p>`;

  const text = `See you tomorrow, ${first}!

This week at ${program.name}:
${program.lectureTopic ? `"${program.lectureTopic}"${program.gitaReference ? ` (${program.gitaReference})` : ""}` : "Kirtan, wisdom, and prasadam — same time, same place."}
${program.speakerName ? `with ${program.speakerName}${program.speakerTitle ? ` · ${program.speakerTitle}` : ""}` : ""}

When: ${dateLabel} · ${program.timeLabel}
Venue: ${program.venueName}
Address: ${program.address}
Getting there: ${program.transit}

Directions: ${program.mapsUrl}
Program details: ${siteUrl()}/programs

Unsubscribe from weekly reminders: ${unsub}
Questions? ${PROGRAMS_CONTACT_EMAIL}`;

  return sendEmail({
    from: PROGRAMS_FROM_EMAIL,
    replyTo: PROGRAMS_CONTACT_EMAIL,
    to: d.to,
    subject: program.lectureTopic
      ? `Tomorrow at ${program.name}: ${program.lectureTopic}`
      : `Tomorrow: ${program.title} — ${program.timeLabel}`,
    html: shell(
      program.accent,
      "Gita Life NYC · Weekly Reminder",
      program.title,
      body,
      footer,
    ),
    text,
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
