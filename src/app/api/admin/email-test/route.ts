/**
 * /api/admin/email-test — SMTP diagnostic (admin only)
 *
 * GET ?to=<address> — checks the SMTP connection/auth, then sends a real
 * confirmation email to `to` (defaults to the signed-in admin's email).
 * Responds with the raw SMTP error and the effective (password-free)
 * config on failure, so misconfiguration — wrong credentials, an
 * unverified From domain on Resend, values pasted with quotes — is
 * visible in the browser instead of buried in function logs.
 *
 * Log in at /admin, then open /api/admin/email-test?to=you@example.com
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  emailConfigured,
  sendClubbingConfirmationDetailed,
  smtpSummary,
  verifySmtpConnection,
} from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = request.nextUrl.searchParams.get("to") || session.user.email || process.env.ADMIN_EMAIL || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Pass a valid address: ?to=you@example.com" }, { status: 400 });
  }

  const smtp = smtpSummary();
  if (!emailConfigured()) {
    return NextResponse.json(
      { ok: false, step: "config", smtp, error: "SMTP_HOST / SMTP_USER / SMTP_PASS are not all set" },
      { status: 503 },
    );
  }

  const connection = await verifySmtpConnection();
  if (!connection.ok) {
    return NextResponse.json({ ok: false, step: "connect", smtp, error: connection.error }, { status: 502 });
  }

  const sent = await sendClubbingConfirmationDetailed({
    to,
    name: "Email Test",
    tierName: "SMTP diagnostic",
    guests: 1,
    seva: null,
  });
  if (!sent.ok) {
    return NextResponse.json({ ok: false, step: "send", smtp, error: sent.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, to, smtp });
}
