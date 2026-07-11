import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { sendClubbingConfirmation } from "@/lib/email";
import { EVENT, TIERS } from "@/data/bajanClubbing";

/**
 * VIP Seva Pass checkout — Square Checkout API (payment links).
 *
 * Talks to Square's REST API directly (no SDK dependency). Configure via:
 *   SQUARE_ACCESS_TOKEN   required — from the Square developer dashboard
 *   SQUARE_LOCATION_ID    required — the seller location to credit
 *   SQUARE_ENVIRONMENT    "production" (default) or "sandbox"
 * Without credentials POST returns 503 and the client falls back to
 * pay-at-the-door.
 *
 *  POST → create a payment link whose order carries the registrant's
 *         email/name in metadata, then pin our own `order=<id>` onto the
 *         redirect URL so the return trip is verifiable no matter what
 *         params Square appends. Responds with the hosted checkout URL.
 *  GET  → ?order=<order_id>: confirm the order is actually paid before
 *         the page shows "Payment received", stamp PAID onto the
 *         registrant's RSVP notes for the admin table, and send the
 *         seva receipt email.
 */

function squareConfig() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!token || !locationId) return null;
  const base =
    process.env.SQUARE_API_BASE || // test override
    (process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? "https://connect.squareupsandbox.com"
      : "https://connect.squareup.com");
  return { token, locationId, base };
}

function squareHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function POST(request: Request) {
  try {
    const sq = squareConfig();
    if (!sq) {
      return NextResponse.json(
        { error: "Card payments aren't configured yet — seva donations are collected at the door" },
        { status: 503 },
      );
    }

    const { name, email, guests } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const vip = TIERS.find((t) => t.priceUsd > 0);
    if (!vip) return NextResponse.json({ error: "No paid tier configured" }, { status: 400 });

    const origin = request.headers.get("origin") ?? new URL(request.url).origin;
    const qty = Math.min(5, Math.max(1, parseInt(guests) || 1));

    const createRes = await fetch(`${sq.base}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: squareHeaders(sq.token),
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        order: {
          location_id: sq.locationId,
          reference_id: EVENT.programId,
          metadata: {
            event: EVENT.programId,
            email: String(email).slice(0, 255),
            name: String(name ?? "").slice(0, 255),
          },
          line_items: [
            {
              name: `${EVENT.title} ${EVENT.volume} — ${vip.name}`,
              quantity: String(qty),
              note: "Seva donation · funds the free midnight prasadam feast",
              base_price_money: { amount: vip.priceUsd * 100, currency: "USD" },
            },
          ],
        },
        checkout_options: {
          redirect_url: `${origin}/bajanclubbing?paid=1`,
          ask_for_shipping_address: false,
        },
        pre_populated_data: { buyer_email: String(email) },
      }),
    });

    const created = await createRes.json();
    const link = created?.payment_link;
    if (!createRes.ok || !link?.url) {
      console.error("Square checkout error:", created?.errors ?? created);
      return NextResponse.json(
        { error: "Couldn't start checkout — seva can be given at the door" },
        { status: 502 },
      );
    }

    // Pin the order id onto the redirect so the return is verifiable.
    // If the update is rejected we still have Square's own appended
    // params as a fallback — never fail the checkout over this.
    if (link.order_id) {
      try {
        await fetch(`${sq.base}/v2/online-checkout/payment-links/${link.id}`, {
          method: "PUT",
          headers: squareHeaders(sq.token),
          body: JSON.stringify({
            payment_link: {
              version: link.version,
              checkout_options: {
                redirect_url: `${origin}/bajanclubbing?paid=1&order=${encodeURIComponent(link.order_id)}`,
              },
            },
          }),
        });
      } catch (error) {
        console.error("Square redirect update failed (non-fatal):", error);
      }
    }

    return NextResponse.json({ url: link.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Couldn't start checkout" }, { status: 500 });
  }
}

/** Stamp PAID onto the payer's RSVP notes (idempotent). */
async function markRsvpPaid(email: string): Promise<{ newlyMarked: boolean; name: string | null; guests: number }> {
  const db = getPrismaClient();
  if (!db) return { newlyMarked: false, name: null, guests: 1 };
  const rsvp = await db.rsvp.findUnique({
    where: { email_programId: { email, programId: EVENT.programId } },
  });
  if (!rsvp) return { newlyMarked: false, name: null, guests: 1 };
  if (rsvp.notes?.includes("PAID")) return { newlyMarked: false, name: rsvp.name, guests: rsvp.guests };

  const vip = TIERS.find((t) => t.priceUsd > 0);
  const tag = vip ? `[${vip.name}]` : null;
  const notes =
    tag && rsvp.notes?.startsWith(tag)
      ? rsvp.notes.replace(tag, `[${vip!.name} · PAID]`)
      : `[PAID] ${rsvp.notes ?? ""}`.trim();
  await db.rsvp.update({ where: { id: rsvp.id }, data: { notes } });
  return { newlyMarked: true, name: rsvp.name, guests: rsvp.guests };
}

/** Pull the buyer email off the order, falling back to the payment record. */
async function orderBuyerEmail(
  sq: NonNullable<ReturnType<typeof squareConfig>>,
  order: { metadata?: Record<string, string>; tenders?: { payment_id?: string }[] },
): Promise<string | null> {
  if (order.metadata?.email) return order.metadata.email;
  const paymentId = order.tenders?.find((t) => t.payment_id)?.payment_id;
  if (!paymentId) return null;
  try {
    const res = await fetch(`${sq.base}/v2/payments/${paymentId}`, { headers: squareHeaders(sq.token) });
    const data = await res.json();
    return res.ok ? (data?.payment?.buyer_email_address ?? null) : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const sq = squareConfig();
    const orderId = new URL(request.url).searchParams.get("order");
    if (!sq || !orderId || !/^[A-Za-z0-9_-]{8,128}$/.test(orderId)) {
      return NextResponse.json({ paid: false }, { status: 400 });
    }

    const res = await fetch(`${sq.base}/v2/orders/${orderId}`, { headers: squareHeaders(sq.token) });
    const data = await res.json();
    if (!res.ok) {
      console.error("Square order lookup error:", data?.errors ?? data);
      return NextResponse.json({ paid: false }, { status: 502 });
    }

    const order = data?.order;
    const fullyPaid =
      order?.state === "COMPLETED" ||
      (order?.net_amount_due_money?.amount === 0 && (order?.tenders?.length ?? 0) > 0);
    const isThisEvent =
      order?.reference_id === EVENT.programId || order?.metadata?.event === EVENT.programId;
    if (!order || !fullyPaid || !isThisEvent) return NextResponse.json({ paid: false });

    const email = await orderBuyerEmail(sq, order);
    let name = order.metadata?.name || "";
    if (email) {
      try {
        const marked = await markRsvpPaid(email);
        name = name || marked.name || "";
        if (marked.newlyMarked) {
          const vip = TIERS.find((t) => t.priceUsd > 0);
          await sendClubbingConfirmation({
            to: email,
            name: name || "friend",
            tierName: vip?.name ?? "VIP Seva Pass",
            guests: marked.guests,
            seva: "paid",
          });
        }
      } catch (error) {
        // Verification already succeeded — a failed stamp/email shouldn't fail the page
        console.error("Post-payment bookkeeping failed:", error);
      }
    }

    return NextResponse.json({ paid: true, name: String(name) });
  } catch (error) {
    console.error("Checkout verify error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}
