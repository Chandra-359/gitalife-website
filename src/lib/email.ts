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
import { EVENT } from "@/data/bhajanClubbing";

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

function confirmationHtml(d: ConfirmationDetails): string {
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
        Your pass is confirmed. Show this email at the door — the name on the list is all we need.
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
  attachments?: { filename: string; content: string; contentType: string }[];
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
    await t.sendMail({
      from: env("SMTP_FROM") || env("SMTP_USER"),
      // Replies land in the event inbox unless SMTP_REPLY_TO overrides it
      replyTo: env("SMTP_REPLY_TO") || EVENT.contactEmail,
      to: d.to,
      subject:
        d.seva === "paid"
          ? `Payment received — you're in at ${EVENT.title} ${EVENT.volume} 🔥`
          : `You're in! ${EVENT.title} ${EVENT.volume} — ${EVENT.dateLabel}`,
      html: confirmationHtml(d),
      text: confirmationText(d),
      attachments: [
        {
          filename: "bhajan-clubbing.ics",
          content: eventIcs(),
          contentType: "text/calendar; method=PUBLISH",
        },
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
