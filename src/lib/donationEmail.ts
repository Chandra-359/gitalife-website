/**
 * donationEmail.ts — thank-you receipt for a verified /donate payment.
 *
 * Rides the shared SMTP transporter in src/lib/email.ts, so it's
 * best-effort like every other transactional send: an unconfigured or
 * failing mailbox never blocks the donation from being recorded (the
 * donor still has their Square receipt).
 *
 * Styled after the main site (warm cream card, Krishna indigo, saffron)
 * rather than the dark Bhajan Clubbing theme.
 */

import { sendEmail, type SendOutcome } from "@/lib/email";
import { DONATE, usd } from "@/data/donation";
import { PROGRAMS_FROM_EMAIL } from "@/data/weeklyPrograms";

export interface DonationReceiptDetails {
  to: string;
  /** Empty for anonymous gifts — the greeting falls back to "friend". */
  name: string;
  amountCents: number;
  /** True when the donor asked not to be named. */
  anonymous?: boolean;
}

/* Main-site palette, email-safe */
const S = {
  bg: "#B8AE94", // khadi paper
  card: "#FBF5E6", // cream
  ink: "#15224F", // Krishna indigo
  dim: "#4F4634", // warm gray-brown
  gold: "#A8842A",
  saffron: "#D9691A",
  line: "rgba(21,34,79,0.14)",
};

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid ${S.line};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${S.dim};">${label}</td>
    <td style="padding:9px 0;border-bottom:1px solid ${S.line};font-size:14px;font-weight:600;color:${S.ink};text-align:right;">${value}</td>
  </tr>`;
}

function receiptHtml(d: DonationReceiptDetails, dateLabel: string): string {
  const first = d.name.split(" ")[0] || "friend";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${S.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${S.bg};padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
    <tr><td style="padding:0 8px 18px;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${S.dim};font-family:Arial,Helvetica,sans-serif;">Gita Life NYC</p>
      <h1 style="margin:10px 0 0;font-size:30px;line-height:1.15;color:${S.ink};font-family:Georgia,'Times New Roman',serif;">
        Thank you, ${first} <span style="color:${S.saffron};">🙏</span>
      </h1>
    </td></tr>
    <tr><td style="background:${S.card};border:1px solid rgba(154,144,120,0.55);border-radius:16px;padding:28px;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0;font-size:14px;line-height:1.7;color:${S.dim};">
        Your donation just landed — and it goes straight to work: free weekly Gita programs,
        warm prasadam, kirtans, retreats, and festivals across NYC.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
        ${row("Donation", usd(d.amountCents))}
        ${d.anonymous ? row("Recorded as", "Anonymous") : ""}
        ${row("Date", dateLabel)}
        ${row("Payment", "Card via Square")}
      </table>
      <p style="margin:18px 0 0;padding:12px 16px;background:rgba(217,105,26,0.07);border:1px solid rgba(217,105,26,0.28);border-radius:10px;font-size:13px;line-height:1.65;color:${S.ink};">
        <strong>Keep this email for your records.</strong> Your Square payment receipt is on its way separately.
      </p>
      <p style="margin:18px 0 0;font-size:12.5px;line-height:1.7;color:${S.dim};">
        ${DONATE.note}
      </p>
      <p style="margin:14px 0 0;font-size:12.5px;line-height:1.7;color:${S.dim};">
        Questions about your donation? Write to us at
        <a href="mailto:${DONATE.contactEmail}" style="color:${S.gold};font-weight:bold;text-decoration:none;">${DONATE.contactEmail}</a>
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

function receiptText(d: DonationReceiptDetails, dateLabel: string): string {
  const first = d.name.split(" ")[0] || "friend";
  return `Thank you, ${first}!

Your donation to Gita Life NYC is confirmed.

Donation: ${usd(d.amountCents)}
${d.anonymous ? "Recorded as: Anonymous\n" : ""}Date: ${dateLabel}
Payment: Card via Square

Keep this email for your records — your Square payment receipt arrives separately.

${DONATE.note}

Questions? ${DONATE.contactEmail}
${DONATE.url}`;
}

export async function sendDonationReceipt(d: DonationReceiptDetails): Promise<SendOutcome> {
  const dateLabel = new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return sendEmail({
    // Same sender as every other transactional email on the site —
    // "Gita Life NYC <no-reply@gitalifenyc.com>" (domain must stay
    // verified with the SMTP provider). Replies land in a real inbox.
    from: PROGRAMS_FROM_EMAIL,
    to: d.to,
    replyTo: process.env.SMTP_REPLY_TO || DONATE.contactEmail,
    subject: `Thank you for your ${usd(d.amountCents)} donation — Gita Life NYC 🙏`,
    html: receiptHtml(d, dateLabel),
    text: receiptText(d, dateLabel),
  });
}
