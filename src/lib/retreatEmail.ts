/**
 * retreatEmail.ts — mail for retreats (src/data/retreats.ts). Sent from
 * no-reply@gitalifenyc.com with the warm-paper template from
 * programEmail.ts.
 *
 *  1. Confirmation — at registration: dates, venue, what they owe, and
 *     the Zelle details (QR + number + suggested memo) whenever the
 *     attendee hasn't told us they've paid. Carries a calendar invite
 *     for the whole weekend and the door QR entry pass.
 *  2. Reminders — the day before and the morning of, sent by
 *     /api/cron/reminders. Repeats the Zelle block while payment is
 *     still outstanding, with a one-click unsubscribe.
 */

import { sendEmail, ticketQrAttachment, type SendOutcome } from "@/lib/email";
import { PROGRAMS_FROM_EMAIL } from "@/data/weeklyPrograms";
import {
  buttonPair,
  detailRow,
  shell,
  siteUrl,
  unsubscribeUrl,
  P,
} from "@/lib/programEmail";
import {
  formatUsd,
  retreatDatesLabel,
  retreatDayLabel,
  retreatMapsUrl,
  retreatPrice,
  retreatTimeLabel,
  zelleMemo,
  type Occupation,
  type RetreatConfig,
} from "@/data/retreats";
import type { RetreatReminderKind } from "@/lib/retreat";

/** Retreat accent — the site's deep gold. */
const ACCENT = "#A8842A";

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

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function retreatPageUrl(retreat: RetreatConfig): string {
  return `${siteUrl()}/retreat/${retreat.slug}`;
}

export function retreatIcs(retreat: RetreatConfig): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gita Life NYC//Retreats//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${retreat.id}@gitalifenyc.com`,
    `DTSTAMP:${utcStamp(new Date().toISOString())}`,
    `DTSTART:${utcStamp(retreat.startIso)}`,
    `DTEND:${utcStamp(retreat.endIso)}`,
    `SUMMARY:${icsEscape(`${retreat.title} — Gita Life NYC`)}`,
    `DESCRIPTION:${icsEscape(`${retreat.description}\n\n${retreat.timingNote}\n\n${retreatPageUrl(retreat)}`)}`,
    `LOCATION:${icsEscape(`${retreat.venueName}, ${retreat.address}`)}`,
    `URL:${retreatPageUrl(retreat)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function retreatGoogleCalendarUrl(retreat: RetreatConfig): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${retreat.title} — Gita Life NYC`,
    dates: `${utcStamp(retreat.startIso)}/${utcStamp(retreat.endIso)}`,
    details: `${retreat.description}\n\n${retreat.timingNote}\n\n${retreatPageUrl(retreat)}`,
    location: `${retreat.venueName}, ${retreat.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* ------------------------------------------------------------------ */
/*  Shared blocks                                                      */
/* ------------------------------------------------------------------ */

function qrFilename(retreat: RetreatConfig): string {
  return `${retreat.id}-entry-pass.png`;
}

function entryPassHtml(): string {
  return `<div style="margin-top:22px;padding:20px;background:rgba(168,132,42,0.08);border:1px solid rgba(168,132,42,0.35);border-radius:14px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${ACCENT};font-family:Arial,Helvetica,sans-serif;">Your entry pass</p>
    <img src="cid:ticket-qr" width="160" height="160" alt="Check-in QR code" style="display:inline-block;margin-top:14px;border-radius:12px;background:#ffffff;padding:10px;border:1px solid ${P.line};" />
    <p style="margin:14px 0 0;font-size:12.5px;line-height:1.6;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">
      Show this QR when you arrive — one scan checks you in. Your phone screen is fine.
    </p>
  </div>`;
}

/** The Zelle payment block — only rendered while payment is outstanding. */
function zelleHtml(retreat: RetreatConfig, name: string, amount: number): string {
  const z = retreat.zelle;
  const memo = zelleMemo(retreat, name);
  const qr = z.qrUrl
    ? `<img src="${siteUrl()}${z.qrUrl}" width="150" height="150" alt="Zelle QR code" style="display:inline-block;margin-top:14px;border-radius:12px;background:#ffffff;padding:8px;border:1px solid ${P.line};" />`
    : "";
  const number = z.phone
    ? `<p style="margin:14px 0 0;font-size:22px;font-weight:bold;letter-spacing:1px;color:${P.ink};font-family:Arial,Helvetica,sans-serif;">${escapeHtml(z.phone)}</p>
       <p style="margin:2px 0 0;font-size:12px;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">Zelle recipient: <strong style="color:${P.ink};">${escapeHtml(z.recipientName)}</strong></p>`
    : `<p style="margin:14px 0 0;font-size:13px;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">Zelle details are on the registration page.</p>`;
  return `<div style="margin-top:22px;padding:20px;background:rgba(217,105,26,0.07);border:1px solid rgba(217,105,26,0.35);border-radius:14px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B85308;font-family:Arial,Helvetica,sans-serif;">Payment due · ${formatUsd(amount)}</p>
    <p style="margin:10px 0 0;font-size:13.5px;line-height:1.6;color:${P.ink};font-family:Arial,Helvetica,sans-serif;">
      Your spot is held once your <strong>${formatUsd(amount)}</strong> Zelle payment comes through.
    </p>
    ${qr}
    ${number}
    <p style="margin:14px 0 0;font-size:12.5px;line-height:1.6;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">
      Please put <strong style="color:${P.ink};">${escapeHtml(memo)}</strong> in the memo so we can match your payment.<br/>
      Already sent it? <a href="${retreatPageUrl(retreat)}" style="color:#B85308;font-weight:bold;">Let us know here</a> — submit the form again with the same email and tick “I've sent my Zelle payment”.
    </p>
  </div>`;
}

function zelleText(retreat: RetreatConfig, name: string, amount: number): string {
  const z = retreat.zelle;
  return `PAYMENT DUE: ${formatUsd(amount)} via Zelle
${z.phone ? `Zelle number: ${z.phone} (recipient: ${z.recipientName})` : "Zelle details: see the registration page"}
Memo: ${zelleMemo(retreat, name)}
Already sent it? Submit the form again with the same email and tick "I've sent my Zelle payment": ${retreatPageUrl(retreat)}`;
}

function paidHtml(amount: number): string {
  return `<p style="margin:18px 0 0;padding:12px 16px;background:rgba(0,109,91,0.08);border:1px solid rgba(0,109,91,0.35);border-radius:10px;font-size:13px;line-height:1.6;color:${P.ink};">
    <strong>Thanks for sending your ${formatUsd(amount)} Zelle payment.</strong> We'll match it up on our end — nothing else to do.
  </p>`;
}

function contactHtml(retreat: RetreatConfig): string {
  return `<p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:${P.dim};">
    Questions? Write to us at
    <a href="mailto:${retreat.contactEmail}" style="color:${P.gold};font-weight:bold;text-decoration:none;">${retreat.contactEmail}</a>
    — a volunteer will get back to you.
  </p>`;
}

function detailsTable(retreat: RetreatConfig, occupation: Occupation, amount: number): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${detailRow("Retreat", retreat.title)}
      ${detailRow("Dates", retreatDatesLabel(retreat))}
      ${detailRow("Timing", retreat.timingNote)}
      ${detailRow("Venue", retreat.venueName)}
      ${detailRow("Address", retreat.address)}
      ${retreat.specialGuest ? detailRow("Special guest", retreat.specialGuest) : ""}
      ${detailRow("Registered as", `${occupation} · ${formatUsd(amount)}`)}
    </table>`;
}

function detailsText(retreat: RetreatConfig, occupation: Occupation, amount: number): string {
  return `Retreat: ${retreat.title}
Dates: ${retreatDatesLabel(retreat)}
Timing: ${retreat.timingNote}
Venue: ${retreat.venueName}
Address: ${retreat.address}
${retreat.specialGuest ? `Special guest: ${retreat.specialGuest}\n` : ""}Registered as: ${occupation} · ${formatUsd(amount)}`;
}

/* ------------------------------------------------------------------ */
/*  1. Confirmation (at registration)                                  */
/* ------------------------------------------------------------------ */

export interface RetreatConfirmationDetails {
  to: string;
  name: string;
  rsvpId: string;
  retreat: RetreatConfig;
  occupation: Occupation;
  /** True when the attendee ticked "I've sent my Zelle payment". */
  paymentReported: boolean;
  /** Re-submission by an already-registered email. */
  alreadyRegistered?: boolean;
}

export async function sendRetreatConfirmation(d: RetreatConfirmationDetails): Promise<SendOutcome> {
  const { retreat } = d;
  const first = d.name.split(" ")[0];
  const amount = retreatPrice(retreat, d.occupation);
  const gcal = retreatGoogleCalendarUrl(retreat);
  const maps = retreatMapsUrl(retreat);
  const unsub = unsubscribeUrl(d.rsvpId);
  const qr = await ticketQrAttachment(d.rsvpId, qrFilename(retreat));

  const intro = d.alreadyRegistered
    ? `You're already registered for <strong>${retreat.title}</strong> — here are your details again${d.paymentReported ? "" : ", and the payment info in case you still need it"}.`
    : `Your registration for <strong>${retreat.title}</strong> is in. ${d.paymentReported ? "Payment noted — see you at the farm." : "One more step: send your payment by Zelle below and you're all set."}`;

  const body = `
    <h2 style="margin:0;font-size:20px;color:${P.ink};">${d.alreadyRegistered ? `You're on the list, ${first}` : `See you at the farm, ${first} 🌿`}</h2>
    <p style="margin:10px 0 0;font-size:13.5px;line-height:1.65;color:${P.dim};">${intro}</p>
    ${detailsTable(retreat, d.occupation, amount)}
    ${d.paymentReported ? paidHtml(amount) : zelleHtml(retreat, d.name, amount)}
    ${qr ? entryPassHtml() : ""}
    ${buttonPair(ACCENT, { href: gcal, label: "Add to Google Calendar" }, { href: maps, label: "Get directions" })}
    <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:${P.dim};">
      The calendar invite for the whole weekend is attached. We'll send a reminder the day
      before and one on the morning of the retreat.
    </p>
    ${contactHtml(retreat)}`;

  const footer = `<p style="margin:0;font-size:11px;line-height:1.7;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">
    Don't want the reminders? <a href="${unsub}" style="color:${P.dim};text-decoration:underline;">Unsubscribe with one click</a> — your registration stays.
  </p>`;

  const text = `${d.alreadyRegistered ? `You're on the list, ${first}!` : `See you at the farm, ${first}!`}

${detailsText(retreat, d.occupation, amount)}

${d.paymentReported ? `Thanks for sending your ${formatUsd(amount)} Zelle payment — we'll match it up on our end.` : zelleText(retreat, d.name, amount)}
${qr ? "\nYour QR entry pass is attached — show it when you arrive.\n" : ""}
Add to Google Calendar: ${gcal}
Directions: ${maps}

We'll send a reminder the day before and one on the morning of the retreat.
Unsubscribe from reminders (your registration stays): ${unsub}

Questions? ${retreat.contactEmail}
${retreatPageUrl(retreat)}`;

  return sendEmail({
    from: PROGRAMS_FROM_EMAIL,
    replyTo: retreat.contactEmail,
    to: d.to,
    subject: d.alreadyRegistered
      ? `You're registered — ${retreat.title}, ${retreatDatesLabel(retreat)}`
      : d.paymentReported
        ? `You're in! ${retreat.title} — ${retreatDatesLabel(retreat)}`
        : `Almost there — send your Zelle payment for ${retreat.title}`,
    html: shell(ACCENT, "Gita Life NYC · Retreat", retreat.title, body, footer),
    text,
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    attachments: [
      {
        filename: `${retreat.id}.ics`,
        content: retreatIcs(retreat),
        contentType: "text/calendar; method=PUBLISH",
      },
      ...(qr ? [qr] : []),
    ],
  });
}

/* ------------------------------------------------------------------ */
/*  2. Reminders — day before and morning of (cron)                    */
/* ------------------------------------------------------------------ */

export interface RetreatReminderDetails {
  to: string;
  name: string;
  rsvpId: string;
  retreat: RetreatConfig;
  occupation: Occupation;
  paymentReported: boolean;
  kind: RetreatReminderKind;
}

export async function sendRetreatReminder(d: RetreatReminderDetails): Promise<SendOutcome> {
  const { retreat } = d;
  const first = d.name.split(" ")[0];
  const amount = retreatPrice(retreat, d.occupation);
  const maps = retreatMapsUrl(retreat);
  const unsub = unsubscribeUrl(d.rsvpId);
  const qr = await ticketQrAttachment(d.rsvpId, qrFilename(retreat));
  const isToday = d.kind === "day-of";
  const when = isToday ? "today" : "tomorrow";
  const startDay = retreatDayLabel(retreat.startIso);
  const startTime = retreatTimeLabel(retreat.startIso);

  const poster = `<img src="${siteUrl()}${retreat.posterUrl}" alt="${escapeHtml(retreat.title)} poster" width="504" style="display:block;width:100%;max-width:504px;border-radius:12px;margin:0 0 20px;border:1px solid ${P.line};" />`;

  const body = `
    ${poster}
    <h2 style="margin:0;font-size:20px;color:${P.ink};">${isToday ? `It's retreat day, ${first}!` : `Tomorrow, ${first}!`}</h2>
    <p style="margin:10px 0 0;font-size:13.5px;line-height:1.65;color:${P.dim};">
      ${retreat.title} ${isToday ? "starts" : "begins"} ${when} — ${startDay} at ${startTime}, ${retreat.venueName}. ${retreat.timingNote}.
    </p>
    <ul style="margin:14px 0 0;padding:0 0 0 18px;font-size:13px;line-height:1.8;color:${P.dim};">
      ${retreat.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
      ${retreat.specialGuest ? `<li>Special guest: ${escapeHtml(retreat.specialGuest)}</li>` : ""}
    </ul>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${detailRow("When", `${retreatDatesLabel(retreat)}`)}
      ${detailRow("Venue", retreat.venueName)}
      ${detailRow("Address", retreat.address)}
    </table>
    ${d.paymentReported ? "" : zelleHtml(retreat, d.name, amount)}
    ${qr ? entryPassHtml() : ""}
    ${buttonPair(ACCENT, { href: maps, label: "Get directions" }, { href: retreatPageUrl(retreat), label: "Retreat details" })}
    ${contactHtml(retreat)}`;

  const footer = `<p style="margin:0;font-size:11px;line-height:1.7;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">
    You're receiving this because you registered for ${retreat.title}.
    <a href="${unsub}" style="color:${P.dim};text-decoration:underline;">Unsubscribe from reminders</a>.
  </p>`;

  const text = `${isToday ? `It's retreat day, ${first}!` : `Tomorrow, ${first}!`}

${retreat.title} ${isToday ? "starts" : "begins"} ${when} — ${startDay} at ${startTime}.
${retreat.timingNote}.

When: ${retreatDatesLabel(retreat)}
Venue: ${retreat.venueName}
Address: ${retreat.address}
${retreat.specialGuest ? `Special guest: ${retreat.specialGuest}\n` : ""}
${d.paymentReported ? "" : `${zelleText(retreat, d.name, amount)}\n`}${qr ? "Your QR entry pass is attached — show it when you arrive.\n" : ""}
Directions: ${maps}
Details: ${retreatPageUrl(retreat)}

Unsubscribe from reminders: ${unsub}
Questions? ${retreat.contactEmail}`;

  return sendEmail({
    from: PROGRAMS_FROM_EMAIL,
    replyTo: retreat.contactEmail,
    to: d.to,
    subject: isToday
      ? `Today: ${retreat.title} — see you at ${retreat.venueName}`
      : `Tomorrow: ${retreat.title} — ${startDay}`,
    html: shell(ACCENT, isToday ? "Gita Life NYC · Today" : "Gita Life NYC · Tomorrow", retreat.title, body, footer),
    text,
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    attachments: qr ? [qr] : undefined,
  });
}
