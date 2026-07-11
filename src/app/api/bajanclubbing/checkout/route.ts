import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { sendClubbingConfirmation } from "@/lib/email";
import { countGuests, ensureEventProgram } from "@/lib/clubbing";
import { EVENT, TIERS } from "@/data/bajanClubbing";

/**
 * VIP Seva Pass checkout — Square Checkout API (payment links).
 *
 * PAY-FIRST: no RSVP exists until Square confirms the money. The
 * registrant's details ride along in the Square order's metadata, and the
 * verified return trip creates (or upgrades) the RSVP as PAID. Abandoned
 * checkouts leave nothing behind.
 *
 * Talks to Square's REST API directly (no SDK dependency). Configure via:
 *   SQUARE_ACCESS_TOKEN   required — from the Square developer dashboard
 *   SQUARE_LOCATION_ID    required — the seller location to credit
 *   SQUARE_ENVIRONMENT    "production" (default) or "sandbox"
 * Without credentials POST returns 503 and the client greys out the VIP
 * tier instead of registering anyone unpaid.
 *
 *  POST → validate capacity, create a payment link (order metadata =
 *         name/email/phone/guests), pin our own `order=<id>` onto the
 *         redirect URL, respond with the hosted checkout URL.
 *  GET  → ?order=<order_id>: confirm the order is actually paid, then
 *         upsert the RSVP as confirmed + PAID and send the seva receipt.
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
        { error: "Online payment isn't available right now — grab a free pass and give seva at the event" },
        { status: 503 },
      );
    }

    const { name, email, phone, guests } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const vip = TIERS.find((t) => t.priceUsd > 0);
    if (!vip) return NextResponse.json({ error: "No paid tier configured" }, { status: 400 });

    // The paid RSVP is written after payment — refuse to take money we
    // couldn't record, and don't sell passes past capacity.
    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { error: "Registration is briefly offline — please try again in a few minutes" },
        { status: 503 },
      );
    }
    const qty = Math.min(5, Math.max(1, parseInt(guests) || 1));
    const taken = await countGuests(db);
    if (taken + qty > EVENT.capacity) {
      const remaining = EVENT.capacity - taken;
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Only ${remaining} pass${remaining === 1 ? "" : "es"} left`
              : "Passes are sold out — join the door line at 5:45 PM",
        },
        { status: 400 },
      );
    }

    const createRes = await fetch(`${sq.base}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: squareHeaders(sq.token),
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        order: {
          location_id: sq.locationId,
          reference_id: EVENT.programId,
          // The whole registration rides in metadata — the verified
          // return trip turns it into the RSVP.
          metadata: {
            event: EVENT.programId,
            email: String(email).slice(0, 255),
            name: String(name).trim().slice(0, 255),
            phone: String(phone ?? "").slice(0, 100),
            guests: String(qty),
          },
          line_items: [
            {
              name: `${EVENT.title} ${EVENT.volume} — ${vip.name}`,
              quantity: String(qty),
              note: "Seva donation · funds the free prasadam feast",
              base_price_money: { amount: vip.priceUsd * 100, currency: "USD" },
            },
          ],
        },
        checkout_options: {
          redirect_url: `${requestOrigin(request)}/bajanclubbing?paid=1`,
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
        { error: "Couldn't start checkout — please try again" },
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
                redirect_url: `${requestOrigin(request)}/bajanclubbing?paid=1&order=${encodeURIComponent(link.order_id)}`,
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

function requestOrigin(request: Request): string {
  return request.headers.get("origin") ?? new URL(request.url).origin;
}

interface PaidOrder {
  metadata?: Record<string, string>;
  tenders?: { payment_id?: string }[];
}

/**
 * Turn a verified paid order into a confirmed RSVP (idempotent).
 * New registrant → create as PAID; existing registrant (e.g. upgraded
 * from a free tier) → restamp their notes as VIP · PAID.
 */
async function recordPaidRsvp(order: PaidOrder, email: string) {
  const db = getPrismaClient();
  if (!db) return { receipt: false, name: null as string | null, guests: 1 };

  const vip = TIERS.find((t) => t.priceUsd > 0);
  const vipName = vip?.name ?? "VIP Seva Pass";
  const paidTag = `[${vipName} · PAID]`;
  const guests = Math.min(5, Math.max(1, parseInt(order.metadata?.guests ?? "1") || 1));

  await ensureEventProgram(db);

  const existing = await db.rsvp.findUnique({
    where: { email_programId: { email, programId: EVENT.programId } },
  });

  if (!existing) {
    const rsvp = await db.rsvp.create({
      data: {
        name: order.metadata?.name || email,
        email,
        phone: order.metadata?.phone || null,
        guests,
        notes: paidTag,
        programId: EVENT.programId,
      },
    });
    return { receipt: true, name: rsvp.name, guests: rsvp.guests };
  }

  if (existing.notes?.includes("PAID")) {
    return { receipt: false, name: existing.name, guests: existing.guests };
  }

  // Upgrade an existing (free-tier) registration to paid VIP
  const stripped = existing.notes?.replace(/^\[[^\]]*\]\s*/, "") ?? "";
  await db.rsvp.update({
    where: { id: existing.id },
    data: { notes: [paidTag, stripped].filter(Boolean).join(" ") },
  });
  return { receipt: true, name: existing.name, guests: existing.guests };
}

/** Pull the buyer email off the order, falling back to the payment record. */
async function orderBuyerEmail(
  sq: NonNullable<ReturnType<typeof squareConfig>>,
  order: PaidOrder,
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
    if (!email) {
      // Paid but unidentifiable — surface success, reconcile via Square dashboard
      console.error("Paid Square order without buyer email:", orderId);
      return NextResponse.json({ paid: true, name: String(order.metadata?.name ?? "") });
    }

    const { receipt, name, guests } = await recordPaidRsvp(order, email);
    if (receipt) {
      const vip = TIERS.find((t) => t.priceUsd > 0);
      await sendClubbingConfirmation({
        to: email,
        name: name || order.metadata?.name || "friend",
        tierName: vip?.name ?? "VIP Seva Pass",
        guests,
        seva: "paid",
      });
    }

    return NextResponse.json({ paid: true, name: String(name || order.metadata?.name || "") });
  } catch (error) {
    console.error("Checkout verify error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}
