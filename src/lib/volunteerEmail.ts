/**
 * volunteerEmail.ts — mail for volunteer drive signups, sent from
 * no-reply@gitalifenyc.com.
 *
 * One confirmation per signup (repeats re-send it with the updated
 * shifts): the drive, every chosen shift with day + time, the venue,
 * and a calendar invite carrying one event per shift. Reuses the
 * warm-paper template scaffolding from programEmail.ts.
 */

import { sendEmail, type SendOutcome } from "@/lib/email";
import { PROGRAMS_CONTACT_EMAIL, PROGRAMS_FROM_EMAIL } from "@/data/weeklyPrograms";
import { buttonPair, contactLine, detailRow, shell, siteUrl, P } from "@/lib/programEmail";
import type { VolunteerDriveLive, VolunteerShiftLive } from "@/lib/volunteer";

/** Gold — volunteering's accent in the email shell. */
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

/** One VEVENT per chosen shift, so every seva lands on their calendar. */
export function volunteerIcs(drive: VolunteerDriveLive, shifts: VolunteerShiftLive[]): string {
  const now = utcStamp(new Date().toISOString());
  const events = shifts.map((s) =>
    [
      "BEGIN:VEVENT",
      `UID:${drive.id}-${s.key.replace(/[^A-Za-z0-9-]/g, "-")}@gitalifenyc.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${utcStamp(s.startIso)}`,
      `DTEND:${utcStamp(s.endIso)}`,
      `SUMMARY:${icsEscape(`Seva: ${s.activityTitle} — ${drive.festival}`)}`,
      `DESCRIPTION:${icsEscape(`${drive.title}\n\n${siteUrl()}/volunteer`)}`,
      `LOCATION:${icsEscape(`${drive.venueName}, ${drive.address}`)}`,
      `URL:${siteUrl()}/volunteer`,
      "END:VEVENT",
    ].join("\r\n"),
  );
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gita Life NYC//Volunteering//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export interface VolunteerConfirmationDetails {
  to: string;
  name: string;
  drive: VolunteerDriveLive;
  /** The shifts this signup now holds (post-update on repeats). */
  shifts: VolunteerShiftLive[];
  alreadyRegistered?: boolean;
}

export async function sendVolunteerConfirmation(
  d: VolunteerConfirmationDetails,
): Promise<SendOutcome> {
  const { drive, shifts } = d;
  const first = d.name.split(" ")[0];

  const intro = d.alreadyRegistered
    ? `We've updated your seva for <strong>${drive.title}</strong> — here's where you're signed up now, with a fresh calendar invite.`
    : `Thank you for stepping up, ${first} — you're on the <strong>${drive.festival}</strong> seva crew. Here's where you're signed up; a coordinator will reach out before your first shift.`;

  const shiftRows = shifts
    .map((s) => detailRow(s.activityTitle, `${s.dayChip} · ${s.timeLabel}`))
    .join("");

  const whatsappBlock = drive.whatsappUrl
    ? `<p style="margin:18px 0 0;font-size:13px;line-height:1.65;color:${P.dim};">
         Crew coordination happens on WhatsApp — <a href="${drive.whatsappUrl}" style="color:${P.gold};font-weight:bold;">join the group here</a>.
       </p>`
    : "";

  const body = `
    <h2 style="margin:0;font-size:20px;color:${P.ink};">You're on the crew, ${first} 🙌</h2>
    <p style="margin:10px 0 0;font-size:13.5px;line-height:1.65;color:${P.dim};">${intro}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${detailRow("Drive", drive.title)}
      ${shiftRows}
      ${detailRow("Venue", drive.venueName)}
      ${detailRow("Address", drive.address)}
    </table>
    ${whatsappBlock}
    ${buttonPair(ACCENT, { href: drive.mapsUrl, label: "Get directions" }, { href: `${siteUrl()}/volunteer`, label: "View or update your shifts" })}
    <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:${P.dim};">
      The attached invite puts every shift on your calendar. Plans changed?
      Just submit the form again with your new shifts — it updates, never duplicates.
    </p>
    ${contactLine()}`;

  const footer = `<p style="margin:0;font-size:11px;line-height:1.7;color:${P.dim};font-family:Arial,Helvetica,sans-serif;">
    You're receiving this because you signed up to volunteer at ${drive.venueName}.
  </p>`;

  const shiftText = shifts
    .map((s) => `- ${s.activityTitle}: ${s.dateLabel}, ${s.timeLabel}`)
    .join("\n");

  const text = `You're on the crew, ${first}!

Drive: ${drive.title}

Your shifts:
${shiftText}

Venue: ${drive.venueName}
Address: ${drive.address}
${drive.whatsappUrl ? `\nCrew WhatsApp group: ${drive.whatsappUrl}\n` : ""}
Directions: ${drive.mapsUrl}
Update your shifts any time: ${siteUrl()}/volunteer

Questions? ${PROGRAMS_CONTACT_EMAIL}`;

  return sendEmail({
    from: PROGRAMS_FROM_EMAIL,
    replyTo: PROGRAMS_CONTACT_EMAIL,
    to: d.to,
    subject: d.alreadyRegistered
      ? `Your seva is updated — ${drive.festival}`
      : `You're on the crew! ${drive.festival} — ${drive.datesLabel}`,
    html: shell(ACCENT, "Gita Life NYC · Seva & Volunteering", drive.title, body, footer),
    text,
    attachments: [
      {
        filename: `${drive.id}-seva.ics`,
        content: volunteerIcs(drive, shifts),
        contentType: "text/calendar; method=PUBLISH",
      },
    ],
  });
}
