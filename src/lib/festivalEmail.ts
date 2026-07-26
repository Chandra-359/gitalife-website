/**
 * festivalEmail.ts — mail for dated events (festivals, youth festival,
 * volunteering ops). Sent from no-reply@gitalifenyc.com.
 *
 *  1. Confirmation — at registration, with a single-occurrence calendar
 *     invite (.ics, UTC stamps — no recurrence) plus date, venue, and
 *     guest count.
 *  2. Reminder — the day before the event, sent by /api/cron/reminders,
 *     with the poster and a one-click unsubscribe.
 *
 * Reuses the warm-paper template scaffolding from programEmail.ts.
 */

import { sendEmail, type SendOutcome } from "@/lib/email";
import {
  PROGRAMS_CONTACT_EMAIL,
  PROGRAMS_FROM_EMAIL,
} from "@/data/weeklyPrograms";
import {
  buttonPair,
  contactLine,
  detailRow,
  shell,
  siteUrl,
  unsubscribeUrl,
  P,
} from "@/lib/programEmail";
import type { FestivalEventLive } from "@/lib/festivals";

const pad = (n: number) => String(n).padStart(2, "0");

const utcStamp = (iso: string) => {
  const d = new Date(iso);
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
};

const icsEscape = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export function festivalIcs(event: FestivalEventLive): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gita Life NYC//Festivals//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@gitalifenyc.com`,
    `DTSTAMP:${utcStamp(new Date().toISOString())}`,
    `DTSTART:${utcStamp(event.startAt)}`,
    `DTEND:${utcStamp(event.endAt)}`,
    `SUMMARY:${icsEscape(`${event.title} — Gita Life NYC`)}`,
    `DESCRIPTION:${icsEscape(`${event.description}\n\n${siteUrl()}/festival`)}`,
    `LOCATION:${icsEscape(`${event.venueName}, ${event.address}`)}`,
    `URL:${siteUrl()}/festival`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function festivalGoogleCalendarUrl(event: FestivalEventLive): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.title} — Gita Life NYC`,
    dates: `${utcStamp(event.startAt)}/${utcStamp(event.endAt)}`,
    details: `${event.description}\n\n${siteUrl()}/festival`,
    location: `${event.venueName}, ${event.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* ------------------------------------------------------------------ */
/*  1. Confirmation (at registration)                                  */
/* ------------------------------------------------------------------ */

export interface FestivalConfirmationDetails {
  to: string;
  name: string;
  rsvpId: string;
  guests: number;
  event: FestivalEventLive;
  alreadyRegistered?: boolean;
}

export async function sendFestivalConfirmation(d: FestivalConfirmationDetails): Promise<SendOutcome> {
  const { event } = d;
  const first = d.name.split(" ")[0];
  const gcal = festivalGoogleCalendarUrl(event);
  const unsub = unsubscribeUrl(d.rsvpId);
  const isVolunteering = event.category === "Volunteering";

  const intro = d.alreadyRegistered
    ? `You're already registered for <strong>${event.title}</strong> — here are your details and a fresh calendar invite.`
    : isVolunteering
      ? `Thank you for stepping up, ${first} — your spot on the <strong>${event.title}</strong> crew is confirmed.`
      : `Your spot at <strong>${event.title}</strong> is confirmed. Say your name at the door — that's your ticket.`;

  const body = `
    <h2 style="margin:0;font-size:20px;color:${P.ink};">${isVolunteering ? `You're on the crew, ${first} 🙌` : `You're in, ${first} 🎉`}</h2>
    <p style="margin:10px 0 0;font-size:13.5px;line-height:1.65;color:${P.dim};">${intro}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${detailRow("Event", event.title)}
      ${detailRow("Date", event.dateLabel)}
      ${detailRow("Time", event.timeLabel)}
      ${detailRow("Party", d.guests === 1 ? "Just you" : `${d.guests} people`)}
      ${detailRow("Venue", event.venueName)}
      ${detailRow("Address", event.address)}
    </table>
    ${buttonPair(event.accent, { href: gcal, label: "Add to Google Calendar" }, { href: event.mapsUrl, label: "Get directions" })}
    <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:${P.dim};">
      The invite is attached for your calendar. We'll send one reminder the day
      before${isVolunteering ? " with everything you need to know" : " — free entry, prasadam included"}.
    </p>
    ${contactLine()}`;

  const footer = `<p style="margin:0;font-size:11px;line-height:1.7;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">
    Don't want event reminders? <a href="${unsub}" style="color:${P.dim};text-decoration:underline;">Unsubscribe with one click</a> — your registration stays.
  </p>`;

  const text = `${isVolunteering ? `You're on the crew, ${first}!` : `You're in, ${first}!`}

Event: ${event.title}
Date: ${event.dateLabel}
Time: ${event.timeLabel}
Party: ${d.guests === 1 ? "Just you" : `${d.guests} people`}
Venue: ${event.venueName}
Address: ${event.address}

Add to Google Calendar: ${gcal}
Directions: ${event.mapsUrl}

We'll send one reminder the day before.
Unsubscribe from reminders (your registration stays): ${unsub}

Questions? ${PROGRAMS_CONTACT_EMAIL}
${siteUrl()}/festival`;

  return sendEmail({
    from: PROGRAMS_FROM_EMAIL,
    replyTo: PROGRAMS_CONTACT_EMAIL,
    to: d.to,
    subject: d.alreadyRegistered
      ? `You're already registered — ${event.title}, ${event.dateLabel}`
      : `You're in! ${event.title} — ${event.dateLabel}`,
    html: shell(event.accent, "Gita Life NYC · Festivals & Gatherings", event.title, body, footer),
    text,
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    attachments: [
      {
        filename: `${event.id}.ics`,
        content: festivalIcs(event),
        contentType: "text/calendar; method=PUBLISH",
      },
    ],
  });
}

/* ------------------------------------------------------------------ */
/*  2. Day-before reminder (cron)                                      */
/* ------------------------------------------------------------------ */

export interface FestivalReminderDetails {
  to: string;
  name: string;
  rsvpId: string;
  event: FestivalEventLive;
}

export async function sendFestivalReminder(d: FestivalReminderDetails): Promise<SendOutcome> {
  const { event } = d;
  const first = d.name.split(" ")[0];
  const unsub = unsubscribeUrl(d.rsvpId);

  const poster = event.posterUrl
    ? `<img src="${event.posterUrl}" alt="${event.title} poster" width="504" style="display:block;width:100%;max-width:504px;border-radius:12px;margin:0 0 20px;border:1px solid ${P.line};" />`
    : "";

  const highlights = event.highlights.length
    ? `<ul style="margin:14px 0 0;padding:0 0 0 18px;font-size:13px;line-height:1.8;color:${P.dim};">
         ${event.highlights.map((h) => `<li>${h}</li>`).join("")}
       </ul>`
    : "";

  const body = `
    ${poster}
    <h2 style="margin:0;font-size:20px;color:${P.ink};">Tomorrow, ${first}!</h2>
    <p style="margin:10px 0 0;font-size:13.5px;line-height:1.65;color:${P.dim};">${event.description}</p>
    ${highlights}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${detailRow("When", `${event.dateLabel} · ${event.timeLabel}`)}
      ${detailRow("Venue", event.venueName)}
      ${detailRow("Address", event.address)}
    </table>
    ${buttonPair(event.accent, { href: event.mapsUrl, label: "Get directions" }, { href: `${siteUrl()}/festival`, label: "Event details" })}
    ${contactLine()}`;

  const footer = `<p style="margin:0;font-size:11px;line-height:1.7;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">
    You're receiving this because you registered for ${event.title}.
    <a href="${unsub}" style="color:${P.dim};text-decoration:underline;">Unsubscribe from reminders</a>.
  </p>`;

  const text = `Tomorrow, ${first}!

${event.title}
${event.dateLabel} · ${event.timeLabel}
${event.venueName}, ${event.address}

${event.description}

Directions: ${event.mapsUrl}
Details: ${siteUrl()}/festival

Unsubscribe from reminders: ${unsub}
Questions? ${PROGRAMS_CONTACT_EMAIL}`;

  return sendEmail({
    from: PROGRAMS_FROM_EMAIL,
    replyTo: PROGRAMS_CONTACT_EMAIL,
    to: d.to,
    subject: `Tomorrow: ${event.title} — ${event.timeLabel}`,
    html: shell(event.accent, "Gita Life NYC · Event Reminder", event.title, body, footer),
    text,
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
