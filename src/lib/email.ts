/**
 * email.ts — transactional email over the org's own domain mailbox.
 *
 * Works with any host that exposes SMTP (cPanel, Zoho, Namecheap,
 * Google Workspace, Microsoft 365, …). Configure via env:
 *
 *   SMTP_HOST    mail server hostname            (required)
 *   SMTP_PORT    587 (STARTTLS, default) or 465  (optional)
 *   SMTP_USER    mailbox login                   (required)
 *   SMTP_PASS    mailbox password / app password (required)
 *   SMTP_FROM    display From, e.g. "Gita Life NYC <hello@gitalifenyc.com>"
 *                (optional — defaults to SMTP_USER)
 *   SMTP_REPLY_TO  where replies land, e.g. a monitored Gmail inbox
 *                  (optional — set this when SMTP_FROM is a send-only
 *                  address on a transactional service like Resend)
 *
 * Sending is best-effort: when SMTP isn't configured or the send fails,
 * callers get `false` back and the registration flow carries on.
 */

import nodemailer, { type Transporter } from "nodemailer";
import QRCode from "qrcode";
import { EVENT } from "@/data/bhajanClubbing";
import { ticketScanUrl } from "@/lib/ticket";

/** Read an SMTP env var, stripping wrapping quotes — dashboard UIs (Vercel)
 *  store values verbatim, so a value pasted with the quotes from .env.example
 *  ("smtp.resend.com") would otherwise silently break DNS/auth/From. */
function env(name: string): string | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) return undefined;
  return raw.replace(/^(["'])([\s\S]*)\1$/, "$2").trim() || undefined;
}

export function emailConfigured(): boolean {
  return !!(env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS"));
}

/** Password-free view of the effective SMTP config, for logs and the
 *  admin diagnostic endpoint. */
export function smtpSummary() {
  return {
    host: env("SMTP_HOST") ?? null,
    port: env("SMTP_PORT") ?? "587",
    user: env("SMTP_USER") ?? null,
    from: env("SMTP_FROM") ?? env("SMTP_USER") ?? null,
    replyTo: env("SMTP_REPLY_TO") ?? EVENT.contactEmail,
  };
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!emailConfigured()) return null;
  if (transporter) return transporter;
  const port = parseInt(env("SMTP_PORT") || "587", 10);
  transporter = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure: port === 465, // 465 = implicit TLS; 587/25 upgrade via STARTTLS
    auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") },
  });
  return transporter;
}

/* ------------------------------------------------------------------ */
/*  Calendar helpers                                                   */
/* ------------------------------------------------------------------ */
const toCalStamp = (iso: string) =>
  new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function googleCalendarUrl(): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${EVENT.title} — ${EVENT.volume}`,
    dates: `${toCalStamp(EVENT.startIso)}/${toCalStamp(EVENT.endIso)}`,
    details: `${EVENT.description}\n\n${EVENT.url}`,
    location: `${EVENT.venue.name}, ${EVENT.venue.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function eventIcs(): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gita Life NYC//Bhajan Clubbing//EN",
    "BEGIN:VEVENT",
    `UID:${EVENT.programId}@gitalifenyc.com`,
    `DTSTAMP:${toCalStamp(EVENT.startIso)}`,
    `DTSTART:${toCalStamp(EVENT.startIso)}`,
    `DTEND:${toCalStamp(EVENT.endIso)}`,
    `SUMMARY:${EVENT.title} — ${EVENT.volume}`,
    `DESCRIPTION:${EVENT.description.replace(/,/g, "\\,")}`,
    `LOCATION:${`${EVENT.venue.name}, ${EVENT.venue.address}`.replace(/,/g, "\\,")}`,
    `URL:${EVENT.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/* ------------------------------------------------------------------ */
/*  Templates                                                          */
/* ------------------------------------------------------------------ */
export interface ConfirmationDetails {
  to: string;
  name: string;
  tierName: string;
  guests: number;
  /** "paid" → payment-receipt copy (every ticket is paid via Square). */
  seva?: "paid" | null;
  /** When set (and a ticket secret is configured), the email carries the
   *  door check-in QR for this registration. */
  rsvpId?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Door QR ticket                                                     */
/* ------------------------------------------------------------------ */

export interface TicketQrAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
  /** Always "ticket-qr" — reference it as <img src="cid:ticket-qr" />. */
  cid: string;
}

/** Inline QR PNG for a registration, as a CID attachment — or null when
 *  the ticket secret isn't configured. Shared by every event's emails
 *  (Bhajan Clubbing here, dated events in festivalEmail.ts). */
export async function ticketQrAttachment(
  rsvpId: string,
  filename = "bhajan-clubbing-ticket.png",
): Promise<TicketQrAttachment | null> {
  const url = ticketScanUrl(rsvpId);
  if (!url) return null;
  try {
    const png = await QRCode.toBuffer(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 480,
      color: { dark: "#000000", light: "#ffffff" },
    });
    return { filename, content: png, contentType: "image/png", cid: "ticket-qr" };
  } catch (error) {
    console.error("Ticket QR generation failed (email goes out without it):", error);
    return null;
  }
}

function ticketQrHtml(guests: number): string {
  return `<div style="margin-top:24px;padding:20px;background:rgba(255,178,92,0.06);border:1px solid rgba(255,178,92,0.35);border-radius:14px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${S.amber};font-family:Arial,Helvetica,sans-serif;">Your door ticket</p>
    <img src="cid:ticket-qr" width="180" height="180" alt="Check-in QR code" style="display:inline-block;margin-top:14px;border-radius:12px;background:#ffffff;padding:10px;" />
    <p style="margin:14px 0 0;font-size:12.5px;line-height:1.6;color:${S.dim};font-family:Arial,Helvetica,sans-serif;">
      Show this QR at the door — one scan checks in ${guests === 1 ? "you" : `your whole party of ${guests}`}.<br/>
      Arrive together; no printout needed, your phone screen is fine.
    </p>
  </div>`;
}

const S = {
  bg: "#0B0620",
  card: "#150A38",
  ink: "#F4EFFF",
  dim: "#BCB3D6",
  amber: "#FFB25C",
  saffron: "#FF7A1A",
  line: "rgba(244,239,255,0.14)",
};

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid ${S.line};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${S.dim};">${label}</td>
    <td style="padding:9px 0;border-bottom:1px solid ${S.line};font-size:14px;font-weight:600;color:${S.ink};text-align:right;">${value}</td>
  </tr>`;
}

function confirmationHtml(d: ConfirmationDetails, withQr = false): string {
  const sevaBlock =
    d.seva === "paid"
      ? `<p style="margin:18px 0 0;padding:12px 16px;background:rgba(77,255,166,0.08);border:1px solid rgba(77,255,166,0.35);border-radius:10px;font-size:13px;line-height:1.6;color:${S.ink};">
           <strong>Payment received — thank you.</strong> Your ticket covers the whole night: live kirtan and free packed prasadam. Your Square receipt is on its way separately.
         </p>`
      : "";

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${S.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${S.bg};padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
    <tr><td style="padding:0 8px 18px;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${S.dim};font-family:Arial,Helvetica,sans-serif;">Gita Life NYC presents</p>
      <h1 style="margin:10px 0 0;font-size:34px;line-height:1.1;color:${S.ink};font-family:Arial Black,Arial,Helvetica,sans-serif;">
        Bhajan <span style="color:${S.saffron};">Clubbing</span>
      </h1>
      <p style="margin:8px 0 0;font-size:13px;color:${S.dim};font-family:Arial,Helvetica,sans-serif;">${EVENT.tagline}</p>
    </td></tr>
    <tr><td style="background:${S.card};border:1px solid ${S.line};border-radius:16px;padding:28px;font-family:Arial,Helvetica,sans-serif;">
      <h2 style="margin:0;font-size:20px;color:${S.ink};">You're on the list, ${d.name.split(" ")[0]} 🎟️</h2>
      <p style="margin:10px 0 0;font-size:13.5px;line-height:1.65;color:${S.dim};">
        ${withQr
          ? "Your pass is confirmed. Show the QR code below at the door for the fastest check-in."
          : "Your pass is confirmed. Show this email at the door — the name on the list is all we need."}
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
        ${row("Pass", d.tierName)}
        ${row("Crew", d.guests === 1 ? "Just you" : `${d.guests} people`)}
        ${row("Date", EVENT.dateLabel)}
        ${row("Time", `${EVENT.timeLabel} · ${EVENT.doorsLabel}`)}
        ${row("Venue", EVENT.venue.name)}
        ${row("Address", EVENT.venue.address)}
      </table>
      ${sevaBlock}
      ${withQr ? ticketQrHtml(d.guests) : ""}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
        <tr>
          <td style="border-radius:999px;background:${S.saffron};">
            <a href="${googleCalendarUrl()}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:bold;color:#1C0A02;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Add to Google Calendar</a>
          </td>
          <td style="width:10px;"></td>
          <td style="border-radius:999px;border:1px solid ${S.line};">
            <a href="${EVENT.venue.mapsUrl}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:bold;color:${S.ink};text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Get directions</a>
          </td>
        </tr>
      </table>
      <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:${S.dim};">
        ${EVENT.venue.transit}.<br/>
        ${EVENT.venue.note} Come early. 100% sattvic, free packed prasadam included.
      </p>
      <p style="margin:14px 0 0;font-size:12px;line-height:1.7;color:${S.dim};">
        Questions about the event or your registration? Write to us at
        <a href="mailto:${EVENT.contactEmail}" style="color:${S.amber};font-weight:bold;text-decoration:none;">${EVENT.contactEmail}</a>
        — a volunteer will get back to you.
      </p>
    </td></tr>
    <tr><td style="padding:18px 8px 0;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${S.dim};font-family:Arial,Helvetica,sans-serif;">
        Gita Life NYC · A community initiative under ISKCON
      </p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

function confirmationText(d: ConfirmationDetails): string {
  const seva =
    d.seva === "paid"
      ? "\nPayment received — thank you! Your ticket covers the whole night, free packed prasadam included.\n"
      : "";
  return `You're on the list, ${d.name.split(" ")[0]}!

${EVENT.title} — ${EVENT.volume}
${EVENT.tagline}

Pass: ${d.tierName}
Crew: ${d.guests === 1 ? "Just you" : `${d.guests} people`}
Date: ${EVENT.dateLabel}
Time: ${EVENT.timeLabel} (${EVENT.doorsLabel})
Venue: ${EVENT.venue.name}, ${EVENT.venue.address}
${seva}
Directions: ${EVENT.venue.mapsUrl}
${EVENT.venue.transit}

Questions? Write to us at ${EVENT.contactEmail}

100% sattvic · free packed prasadam included
${EVENT.url}`;
}

/* ------------------------------------------------------------------ */
/*  Senders (best-effort — never throw)                                */
/* ------------------------------------------------------------------ */
export interface SendOutcome {
  ok: boolean;
  /** Transport/SMTP error text when ok is false — e.g. Resend rejecting an
   *  unverified From domain, or bad credentials. */
  error?: string;
}

/** Connection + auth handshake only, no message sent. */
export async function verifySmtpConnection(): Promise<SendOutcome> {
  const t = getTransporter();
  if (!t) return { ok: false, error: "SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing)" };
  try {
    await t.verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export interface RawEmail {
  /** Overrides SMTP_FROM — must be on the domain verified with the provider. */
  from?: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
  attachments?: { filename: string; content: string | Buffer; contentType: string; cid?: string }[];
}

/** Generic transactional send over the shared transporter. Never throws. */
export async function sendEmail(msg: RawEmail): Promise<SendOutcome> {
  const t = getTransporter();
  if (!t) return { ok: false, error: "SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing)" };
  try {
    await t.sendMail({
      from: msg.from || env("SMTP_FROM") || env("SMTP_USER"),
      replyTo: msg.replyTo || env("SMTP_REPLY_TO") || undefined,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      headers: msg.headers,
      attachments: msg.attachments,
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Email to ${msg.to} ("${msg.subject}") failed:`, message);
    return { ok: false, error: message };
  }
}

export async function sendClubbingConfirmationDetailed(d: ConfirmationDetails): Promise<SendOutcome> {
  const t = getTransporter();
  if (!t) return { ok: false, error: "SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing)" };
  try {
    // Door QR rides along whenever we know which registration this is
    const qr = d.rsvpId ? await ticketQrAttachment(d.rsvpId) : null;
    await t.sendMail({
      from: env("SMTP_FROM") || env("SMTP_USER"),
      // Replies land in the event inbox unless SMTP_REPLY_TO overrides it
      replyTo: env("SMTP_REPLY_TO") || EVENT.contactEmail,
      to: d.to,
      subject:
        d.seva === "paid"
          ? `Payment received — you're in at ${EVENT.title} ${EVENT.volume} 🔥`
          : `You're in! ${EVENT.title} ${EVENT.volume} — ${EVENT.dateLabel}`,
      html: confirmationHtml(d, !!qr),
      text: confirmationText(d),
      attachments: [
        {
          filename: "bhajan-clubbing.ics",
          content: eventIcs(),
          contentType: "text/calendar; method=PUBLISH",
        },
        ...(qr ? [qr] : []),
      ],
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Confirmation email to ${d.to} failed with SMTP config ${JSON.stringify(smtpSummary())}:`, message);
    return { ok: false, error: message };
  }
}

export async function sendClubbingConfirmation(d: ConfirmationDetails): Promise<boolean> {
  return (await sendClubbingConfirmationDetailed(d)).ok;
}

/* ------------------------------------------------------------------ */
/*  Standalone QR ticket email — for registrations made before QR       */
/*  tickets existed (sent from the admin check-in page)                 */
/* ------------------------------------------------------------------ */
export interface TicketEmailDetails {
  to: string;
  name: string;
  guests: number;
  rsvpId: string;
}

export async function sendTicketQrEmail(d: TicketEmailDetails): Promise<SendOutcome> {
  const t = getTransporter();
  if (!t) return { ok: false, error: "SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing)" };
  const qr = await ticketQrAttachment(d.rsvpId);
  if (!qr) return { ok: false, error: "Ticket QR not configured (TICKET_QR_SECRET / AUTH_SECRET missing)" };
  const first = d.name.split(" ")[0];
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:${S.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${S.bg};padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
    <tr><td style="padding:0 8px 18px;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${S.dim};font-family:Arial,Helvetica,sans-serif;">Gita Life NYC presents</p>
      <h1 style="margin:10px 0 0;font-size:34px;line-height:1.1;color:${S.ink};font-family:Arial Black,Arial,Helvetica,sans-serif;">
        Bhajan <span style="color:${S.saffron};">Clubbing</span>
      </h1>
    </td></tr>
    <tr><td style="background:${S.card};border:1px solid ${S.line};border-radius:16px;padding:28px;font-family:Arial,Helvetica,sans-serif;">
      <h2 style="margin:0;font-size:20px;color:${S.ink};">Your door ticket is here, ${first} 🎟️</h2>
      <p style="margin:10px 0 0;font-size:13.5px;line-height:1.65;color:${S.dim};">
        We've upgraded check-in: show this QR at the door on ${EVENT.dateLabel} and you're straight in — no name lookup needed.
      </p>
      ${ticketQrHtml(d.guests)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
        ${row("Crew", d.guests === 1 ? "Just you" : `${d.guests} people`)}
        ${row("Date", EVENT.dateLabel)}
        ${row("Time", `${EVENT.timeLabel} · ${EVENT.doorsLabel}`)}
        ${row("Venue", EVENT.venue.name)}
      </table>
      <p style="margin:18px 0 0;font-size:12px;line-height:1.7;color:${S.dim};">
        Lost this email on the night? No stress — we can still check you in by name.
        Questions? <a href="mailto:${EVENT.contactEmail}" style="color:${S.amber};font-weight:bold;text-decoration:none;">${EVENT.contactEmail}</a>
      </p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
  const text = `Your door ticket for ${EVENT.title} ${EVENT.volume}, ${first}!

Show the attached QR code (bhajan-clubbing-ticket.png) at the door for the fastest check-in — one scan covers ${d.guests === 1 ? "you" : `your whole party of ${d.guests}`}.

Date: ${EVENT.dateLabel}
Time: ${EVENT.timeLabel} (${EVENT.doorsLabel})
Venue: ${EVENT.venue.name}, ${EVENT.venue.address}

Lost this email on the night? We can still check you in by name.
Questions? ${EVENT.contactEmail}`;
  return sendEmail({
    replyTo: env("SMTP_REPLY_TO") || EVENT.contactEmail,
    to: d.to,
    subject: `Your door QR ticket — ${EVENT.title} ${EVENT.volume}, ${EVENT.dateLabel}`,
    html,
    text,
    attachments: [qr],
  });
}

/* ------------------------------------------------------------------ */
/*  Event reminder — sent to every confirmed registration shortly       */
/*  before the night, with the door QR attached (admin batch-send)      */
/* ------------------------------------------------------------------ */

/** Reminder-specific copy — timing/parking guidance for the night. */
const REMINDER = {
  /** "tomorrow, August 15" — the blast goes out the day before the event. */
  whenLabel: "tomorrow, August 15",
  checkinLabel: "5:00 PM",
  programLabel: "6:00 PM",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Saint+Dominic+Academy%2C+2572+John+F+Kennedy+Blvd%2C+Jersey+City%2C+NJ+07304",
} as const;

export async function sendClubbingReminderEmail(d: TicketEmailDetails): Promise<SendOutcome> {
  const t = getTransporter();
  if (!t) return { ok: false, error: "SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing)" };
  const qr = await ticketQrAttachment(d.rsvpId);
  if (!qr) return { ok: false, error: "Ticket QR not configured (TICKET_QR_SECRET / AUTH_SECRET missing)" };
  const first = d.name.split(" ")[0];
  const b = (s: string) => `<strong style="color:${S.ink};">${s}</strong>`;
  const para = `margin:16px 0 0;font-size:13.5px;line-height:1.7;color:${S.dim};`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:${S.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${S.bg};padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
    <tr><td style="padding:0 8px 18px;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${S.dim};font-family:Arial,Helvetica,sans-serif;">Gita Life NYC presents</p>
      <h1 style="margin:10px 0 0;font-size:34px;line-height:1.1;color:${S.ink};font-family:Arial Black,Arial,Helvetica,sans-serif;">
        Bhajan <span style="color:${S.saffron};">Clubbing</span>
      </h1>
      <p style="margin:8px 0 0;font-size:13px;color:${S.dim};font-family:Arial,Helvetica,sans-serif;">${EVENT.tagline}</p>
    </td></tr>
    <tr><td style="background:${S.card};border:1px solid ${S.line};border-radius:16px;padding:28px;font-family:Arial,Helvetica,sans-serif;">
      <h2 style="margin:0;font-size:20px;color:${S.ink};">Hi ${first},</h2>
      <p style="${para}">
        Just a friendly reminder that your ${b("Bhajan Clubbing")} event is
        ${b(REMINDER.whenLabel)}, at ${b(EVENT.venue.name)}!
      </p>
      <p style="${para}">
        📍 ${b("Venue:")} ${EVENT.venue.name}<br/>
        <span style="display:inline-block;padding-left:24px;">${EVENT.venue.address}</span>
      </p>
      <p style="${para}">
        🗺️ ${b("Google Maps:")}
        <a href="${REMINDER.mapsUrl}" style="color:${S.amber};font-weight:bold;text-decoration:underline;">Open directions</a>
      </p>
      <p style="${para}">
        ⏰ ${b(`Check-in starts at ${REMINDER.checkinLabel}`)}, and the program will start
        ${b(`sharply at ${REMINDER.programLabel}`)}. Please plan to arrive early and allow
        enough time for check-in before the program begins.
      </p>
      <p style="${para}">
        🚗 ${b("Parking:")} There are ${b("very limited parking spots")} available at the
        venue. Please plan ahead and allow extra time to find parking nearby and walk to
        the venue.
      </p>
      ${ticketQrHtml(d.guests)}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
        <tr>
          <td style="border-radius:999px;background:${S.saffron};">
            <a href="${REMINDER.mapsUrl}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:bold;color:#1C0A02;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Get directions</a>
          </td>
          <td style="width:10px;"></td>
          <td style="border-radius:999px;border:1px solid ${S.line};">
            <a href="${googleCalendarUrl()}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:bold;color:${S.ink};text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Add to calendar</a>
          </td>
        </tr>
      </table>
      <p style="${para}text-align:center;">
        We look forward to seeing everyone tomorrow! 🙏
      </p>
      <p style="margin:18px 0 0;font-size:12px;line-height:1.7;color:${S.dim};">
        Can't find this email on the night? No stress — we can check you in by name.
        Questions? <a href="mailto:${EVENT.contactEmail}" style="color:${S.amber};font-weight:bold;text-decoration:none;">${EVENT.contactEmail}</a>
      </p>
    </td></tr>
    <tr><td style="padding:18px 8px 0;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${S.dim};font-family:Arial,Helvetica,sans-serif;">
        Gita Life NYC · A community initiative under ISKCON
      </p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
  const text = `Hi ${first},

Just a friendly reminder that your Bhajan Clubbing event is ${REMINDER.whenLabel}, at ${EVENT.venue.name}!

📍 Venue: ${EVENT.venue.name}
${EVENT.venue.address}

🗺️ Google Maps: ${REMINDER.mapsUrl}

⏰ Check-in starts at ${REMINDER.checkinLabel}, and the program will start sharply at ${REMINDER.programLabel}. Please plan to arrive early and allow enough time for check-in before the program begins.

🚗 Parking: There are very limited parking spots available at the venue. Please plan ahead and allow extra time to find parking nearby and walk to the venue.

Your door QR ticket is attached (bhajan-clubbing-ticket.png) — show it at the door and one scan covers ${d.guests === 1 ? "you" : `your whole party of ${d.guests}`}.

We look forward to seeing everyone tomorrow! 🙏

Can't find this email on the night? We can check you in by name.
Questions? ${EVENT.contactEmail}`;
  return sendEmail({
    replyTo: env("SMTP_REPLY_TO") || EVENT.contactEmail,
    to: d.to,
    subject: `Reminder: ${EVENT.title} ${EVENT.volume} is ${REMINDER.whenLabel} — your QR ticket inside 🎟️`,
    html,
    text,
    attachments: [
      {
        filename: "bhajan-clubbing.ics",
        content: eventIcs(),
        contentType: "text/calendar; method=PUBLISH",
      },
      qr,
    ],
  });
}

/* ------------------------------------------------------------------ */
/*  Post-event thank-you — personal note + feedback form               */
/*                                                                     */
/*  Deliberately plain: white background, simple type, no poster       */
/*  header — it should read like a note a volunteer typed, not a       */
/*  marketing blast. Only the feedback button gets brand color.        */
/* ------------------------------------------------------------------ */

/** Where "Share your thoughts" points — the on-site feedback page, whose
 *  responses land in the "reviews" tab of the registrations spreadsheet. */
export const FEEDBACK_FORM_URL = `${EVENT.url}/feedback`;

export interface ThanksEmailDetails {
  to: string;
  name: string;
}

export async function sendClubbingThanksEmail(d: ThanksEmailDetails): Promise<SendOutcome> {
  const first = d.name.split(" ")[0];
  const p = `margin:18px 0 0;font-size:15px;line-height:1.75;color:#2b2b33;`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f4f0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f0;padding:36px 12px;">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;border:1px solid #e8e3da;">
    <tr><td style="padding:36px 34px;font-family:Georgia,'Times New Roman',serif;">
      <p style="margin:0;font-size:15px;line-height:1.75;color:#2b2b33;">Hi ${first},</p>
      <p style="${p}">
        We're still coming down from Saturday night. The whole hall singing as one voice,
        hands in the air through the final kirtan — that wasn't us on stage, that was
        <em>you</em>.
      </p>
      <p style="${p}">
        Thank you for being part of Bhajan Clubbing Vol.&nbsp;01. The whole night was
        put together by volunteers, and seeing the room full made every late planning
        night worth it.
      </p>
      <p style="${p}">
        If Saturday left you wanting more, here's what we're up to all year:
      </p>
      <ul style="margin:14px 0 0;padding-left:22px;font-size:15px;line-height:1.75;color:#2b2b33;">
        <li style="margin-top:6px;">Weekly Gita nights in Newport, Jersey City &amp; Brooklyn — discussion, kirtan, dinner</li>
        <li style="margin-top:6px;">A bigger youth festival every month</li>
        <li style="margin-top:6px;">Retreats a few times a year, out of the city noise</li>
        <li style="margin-top:6px;">Volunteering — join the crew behind nights like Saturday</li>
      </ul>
      <p style="${p}">
        All of it runs on INSPIRE, our charity program — contributions keep the Gita
        classes, events like this one, the retreats, and the free prasadam going. If
        you'd like to support us:
        <a href="https://www.gitalifenyc.com/donate" style="color:#E8751A;font-weight:bold;text-decoration:underline;">gitalifenyc.com/donate</a>
      </p>
      <p style="${p}">
        And whenever you're in Brooklyn — we also run Govinda's, a volunteer-run
        restaurant serving the best dosas and Indian food. Come by:
        <a href="https://govindaskitchen.us/" style="color:#E8751A;font-weight:bold;text-decoration:underline;">govindaskitchen.us</a>
      </p>
      <p style="${p}">
        Tell us how the night was for you, and what you'd like to be part of — two
        minutes, and we read every response.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto 0;">
        <tr><td style="border-radius:999px;background:#E8751A;">
          <a href="${FEEDBACK_FORM_URL}" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Share your thoughts</a>
        </td></tr>
      </table>
      <p style="margin:26px 0 0;font-size:15px;line-height:1.75;color:#2b2b33;">
        Until next time — keep the mantra with you.
      </p>
      <p style="${p}">
        With gratitude,<br/>
        <strong>The Gita Life NYC volunteers</strong>
      </p>
      <p style="margin:26px 0 0;padding-top:18px;border-top:1px solid #eee9e0;font-size:13px;line-height:1.7;color:#8a8577;font-family:Arial,Helvetica,sans-serif;">
        P.S. If you took photos or videos, tag
        <a href="https://www.instagram.com/gitalifenyc" style="color:#E8751A;font-weight:bold;text-decoration:none;">@gitalifenyc</a>
        — we'd love to see the night through your eyes. And if the form button doesn't
        work, here's the link:
        <a href="${FEEDBACK_FORM_URL}" style="color:#E8751A;text-decoration:underline;">${FEEDBACK_FORM_URL}</a>
      </p>
    </td></tr>
  </table>
  <p style="margin:16px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a39e90;font-family:Arial,Helvetica,sans-serif;">
    Gita Life NYC · A community initiative under ISKCON
  </p>
</td></tr>
</table>
</body></html>`;
  const text = `Hi ${first},

We're still coming down from Saturday night. The whole hall singing as one voice, hands in the air through the final kirtan — that wasn't us on stage, that was you.

Thank you for being part of Bhajan Clubbing Vol. 01. The whole night was put together by volunteers, and seeing the room full made every late planning night worth it.

If Saturday left you wanting more, here's what we're up to all year:

- Weekly Gita nights in Newport, Jersey City & Brooklyn — discussion, kirtan, dinner
- A bigger youth festival every month
- Retreats a few times a year, out of the city noise
- Volunteering — join the crew behind nights like Saturday

All of it runs on INSPIRE, our charity program — contributions keep the Gita classes, events like this one, the retreats, and the free prasadam going. If you'd like to support us: https://www.gitalifenyc.com/donate

And whenever you're in Brooklyn — we also run Govinda's, a volunteer-run restaurant serving the best dosas and Indian food. Come by: https://govindaskitchen.us/

Tell us how the night was for you, and what you'd like to be part of — two minutes, and we read every response:

${FEEDBACK_FORM_URL}

Until next time — keep the mantra with you.

With gratitude,
The Gita Life NYC volunteers

P.S. If you took photos or videos, tag @gitalifenyc on Instagram — we'd love to see the night through your eyes.`;
  return sendEmail({
    replyTo: env("SMTP_REPLY_TO") || EVENT.contactEmail,
    to: d.to,
    subject: "Thank you for Saturday night",
    html,
    text,
  });
}
