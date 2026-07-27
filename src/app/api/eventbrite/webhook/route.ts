import { NextResponse } from "next/server";
import { appendEventbriteAttendeeToSheet, sheetsConfigured } from "@/lib/sheets";

/**
 * Eventbrite → Google Sheets sync.
 *
 * Eventbrite calls this endpoint whenever an order is placed; we fetch
 * the order's attendees from the Eventbrite API and append one row per
 * attendee to the check-in spreadsheet (same columns as festival
 * registrations, so both sources read as one door list).
 *
 * Setup:
 *  1. Get a private token: eventbrite.com → Account Settings →
 *     Developer Links → API Keys → "Private token". Set it as
 *     EVENTBRITE_PRIVATE_TOKEN.
 *  2. Set EVENTBRITE_WEBHOOK_SECRET to any random string.
 *  3. In Eventbrite → Account Settings → Webhooks, add a webhook:
 *       URL:     https://www.gitalifenyc.com/api/eventbrite/webhook?secret=<that string>
 *       Event:   order.placed
 *       (scope it to your organization; "all events" is fine)
 *
 * Security: Eventbrite doesn't sign webhook payloads, so we (a) require
 * the shared secret in the URL and (b) never trust the payload body —
 * the only thing taken from it is the api_url, which must point at
 * www.eventbriteapi.com and is re-fetched with our own token. A forged
 * request can therefore only make us re-sync a real order.
 *
 * Delivery is at-least-once and a mid-order failure makes Eventbrite
 * retry the whole order, so duplicate rows are possible; the order id in
 * the "Heard Via" column makes them easy to spot. The sheet is a door
 * list — Eventbrite itself stays the source of truth.
 */

const EVENTBRITE_API_HOST = "www.eventbriteapi.com";

interface EventbriteAttendee {
  cancelled?: boolean;
  refunded?: boolean;
  ticket_class_name?: string;
  profile?: { name?: string; email?: string; cell_phone?: string };
}

interface EventbriteOrder {
  id?: string;
  name?: string;
  email?: string;
  event?: { name?: { text?: string } };
  attendees?: EventbriteAttendee[];
}

export async function POST(request: Request) {
  const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
  const secret = process.env.EVENTBRITE_WEBHOOK_SECRET;

  if (secret) {
    const provided = new URL(request.url).searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Bad secret" }, { status: 401 });
    }
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body?.config?.action ?? "");
  const apiUrl = String(body?.api_url ?? "");

  // Only order.placed carries registrations; ack everything else
  // (including Eventbrite's "test" ping) so it isn't retried.
  if (action !== "order.placed") {
    return NextResponse.json({ ok: true, skipped: action || "no action" });
  }

  if (!token || !sheetsConfigured()) {
    console.error("Eventbrite webhook received but sync isn't configured (need EVENTBRITE_PRIVATE_TOKEN + Google Sheets credentials)");
    return NextResponse.json({ ok: true, skipped: "not configured" });
  }

  let orderUrl: URL;
  try {
    orderUrl = new URL(apiUrl);
  } catch {
    return NextResponse.json({ error: "Bad api_url" }, { status: 400 });
  }
  if (orderUrl.protocol !== "https:" || orderUrl.hostname !== EVENTBRITE_API_HOST) {
    return NextResponse.json({ error: "Bad api_url" }, { status: 400 });
  }

  try {
    orderUrl.searchParams.set("expand", "attendees,event");
    const res = await fetch(orderUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error("Eventbrite order fetch failed:", res.status, await res.text());
      // 5xx → Eventbrite retries later; a 404/410 order is gone for good.
      const retryable = res.status >= 500 || res.status === 429;
      return NextResponse.json(
        { error: "Order fetch failed" },
        { status: retryable ? 502 : 200 },
      );
    }

    const order = (await res.json()) as EventbriteOrder;
    const eventName = order.event?.name?.text || "Eventbrite event";
    const attendees = (order.attendees ?? []).filter((a) => !a.cancelled && !a.refunded);

    // No attendee expansion (rare) — fall back to one row for the buyer.
    if (attendees.length === 0 && (order.name || order.email)) {
      attendees.push({ profile: { name: order.name, email: order.email } });
    }

    const results = await Promise.all(
      attendees.map((a) =>
        appendEventbriteAttendeeToSheet({
          event: eventName,
          name: a.profile?.name || order.name || "",
          email: a.profile?.email || order.email || "",
          phone: a.profile?.cell_phone || "",
          ticket: a.ticket_class_name || "",
          orderId: order.id || "",
        }),
      ),
    );

    const appended = results.filter(Boolean).length;
    if (appended < attendees.length) {
      console.error(`Eventbrite sheet sync: ${appended}/${attendees.length} rows appended for order ${order.id}`);
      return NextResponse.json({ error: "Sheet append failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, appended });
  } catch (error) {
    console.error("Eventbrite webhook error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 502 });
  }
}
