import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { sendClubbingConfirmationDetailed } from "@/lib/email";
import { appendRegistrationToSheet } from "@/lib/sheets";
import { checkPromoCode, countGuests, ensureEventProgram, redeemPromoCode } from "@/lib/clubbing";
import {
  computeOrder,
  EVENT,
  GROUP_DISCOUNT,
  MAX_EXTRA_DONATION_USD,
  TIERS,
  type PromoDiscount,
} from "@/data/bhajanClubbing";

/**
 * Ticket checkout — Square Checkout API (payment links).
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
 * Without credentials POST returns 503 and the client pauses ticket
 * sales instead of registering anyone unpaid.
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
        { error: "Online payment isn't available right now — please check back shortly" },
        { status: 503 },
      );
    }

    const { name, email, phone, guests, hearAbout, emailOptIn, donation, promoCode } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!phone || !String(phone).trim()) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    const ticket = TIERS.find((t) => t.priceUsd > 0);
    if (!ticket) return NextResponse.json({ error: "No paid ticket configured" }, { status: 400 });

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

    // Amounts are computed server-side from the phase calendar + group
    // discount + promo code — the client only ever sends the guest count,
    // the optional extra donation, and the code string, never a price.
    const extraDonationUsd = Math.min(
      MAX_EXTRA_DONATION_USD,
      Math.max(0, Number.parseFloat(String(donation ?? "")) || 0),
    );
    let promo: PromoDiscount | null = null;
    if (typeof promoCode === "string" && promoCode.trim()) {
      // The buyer saw a discount at review time — if the code died since
      // (expired, deactivated, fully redeemed, or already used by this
      // email/mobile), refuse rather than quietly charging the full amount.
      const check = await checkPromoCode(db, promoCode, new Date(), { email, phone });
      if (!check.ok) {
        // promoInvalid tells the client to drop the code and return the
        // buyer to the details step — nothing has been charged.
        return NextResponse.json({ error: check.error, promoInvalid: true }, { status: 400 });
      }
      promo = check.promo;
    }
    const order = computeOrder(qty, extraDonationUsd, new Date(), promo);
    if (order.totalCents <= 0) {
      // Square can't charge $0 — comp tickets are handled by the organizers.
      return NextResponse.json(
        { error: `This code covers your whole order — email us at ${EVENT.contactEmail} and we'll register you directly` },
        { status: 400 },
      );
    }
    const ticketLineName =
      `${EVENT.title} ${EVENT.volume} — ${ticket.name} (${order.phase.label} suggested donation` +
      `${order.groupDiscount ? `, ${GROUP_DISCOUNT.percent}% family & friends discount` : ""})`;

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
            // Square requires metadata values to be non-empty — omit when blank
            ...(String(hearAbout ?? "").trim() ? { hear_about: String(hearAbout).trim().slice(0, 100) } : {}),
            email_opt_in: emailOptIn ? "yes" : "no",
            price_phase: order.phase.id,
            ...(order.donationCents > 0 ? { donation: (order.donationCents / 100).toFixed(2) } : {}),
            ...(order.promo ? { promo: order.promo.code } : {}),
          },
          line_items: [
            {
              name: ticketLineName,
              quantity: String(qty),
              note: "Includes the free packed prasadam",
              // Per-ticket amount in exact cents (group discount already applied)
              base_price_money: { amount: order.unitCents, currency: "USD" },
              // Promo scoped to the ticket line only — the extra donation
              // below is always charged in full.
              ...(order.promoCents > 0 ? { applied_discounts: [{ discount_uid: "promo" }] } : {}),
            },
            ...(order.donationCents > 0
              ? [
                  {
                    name: "Additional voluntary donation",
                    quantity: "1",
                    note: "Optional gift supporting future spiritual & community initiatives",
                    base_price_money: { amount: order.donationCents, currency: "USD" },
                  },
                ]
              : []),
          ],
          // Sent as a fixed amount in exact cents (even for percent codes) so
          // the Square charge always matches computeOrder() to the cent.
          ...(order.promoCents > 0 && order.promo
            ? {
                discounts: [
                  {
                    uid: "promo",
                    name: `Promo ${order.promo.code}`,
                    type: "FIXED_AMOUNT",
                    scope: "LINE_ITEM",
                    amount_money: { amount: order.promoCents, currency: "USD" },
                  },
                ],
              }
            : {}),
        },
        checkout_options: {
          redirect_url: `${requestOrigin(request)}/bhajanclubbing?paid=1`,
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
                redirect_url: `${requestOrigin(request)}/bhajanclubbing?paid=1&order=${encodeURIComponent(link.order_id)}`,
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
 * Turn a verified paid order into a confirmed RSVP, idempotent per Square
 * order: every processed order id is stamped into notes as "sq:<id>", so
 * re-verifying the same order (refresh, retry) records and emails nothing,
 * while a genuinely new order from an already-registered email still gets
 * its tickets counted and its confirmation email sent.
 */
async function recordPaidRsvp(order: PaidOrder, email: string, orderId: string) {
  const db = getPrismaClient();
  if (!db) return { receipt: false, name: null as string | null, guests: 1, rsvpId: null as string | null };

  const ticket = TIERS.find((t) => t.priceUsd > 0);
  const ticketName = ticket?.name ?? "General Admission";
  const paidTag = `[${ticketName} · PAID]`;
  const orderMarker = `sq:${orderId}`;
  const guests = Math.min(5, Math.max(1, parseInt(order.metadata?.guests ?? "1") || 1));
  const hearAbout = order.metadata?.hear_about?.trim() || null;
  const emailOptIn = order.metadata?.email_opt_in === "yes";

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
        notes: `${paidTag} ${orderMarker}`,
        hearAbout,
        emailOptIn,
        programId: EVENT.programId,
      },
    });
    return { receipt: true, name: rsvp.name, guests: rsvp.guests, rsvpId: rsvp.id };
  }

  // This exact order was already recorded — nothing new to count or send.
  if (existing.notes?.includes(orderMarker)) {
    return { receipt: false, name: existing.name, guests: existing.guests, rsvpId: existing.id };
  }

  if (existing.notes?.includes("PAID")) {
    // Rows stamped PAID before order tracking existed carry no sq: marker,
    // so an unseen order id there is almost certainly the same purchase
    // being re-verified — adopt the marker and (re)send the email without
    // touching the ticket count. With markers present it's a real second
    // purchase: add its tickets.
    const isNewPurchase = /(^|\s)sq:/.test(existing.notes);
    const totalGuests = isNewPurchase ? existing.guests + guests : existing.guests;
    await db.rsvp.update({
      where: { id: existing.id },
      data: { guests: totalGuests, notes: `${existing.notes} ${orderMarker}` },
    });
    return { receipt: true, name: existing.name, guests: totalGuests, rsvpId: existing.id };
  }

  // Restamp an existing registration (e.g. from before the paid switch) as paid
  const stripped = existing.notes?.replace(/^\[[^\]]*\]\s*/, "") ?? "";
  await db.rsvp.update({
    where: { id: existing.id },
    data: {
      notes: [paidTag, stripped, orderMarker].filter(Boolean).join(" "),
      hearAbout: hearAbout ?? existing.hearAbout,
      emailOptIn: emailOptIn || existing.emailOptIn,
    },
  });
  return { receipt: true, name: existing.name, guests: existing.guests, rsvpId: existing.id };
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

    const { receipt, name, guests, rsvpId } = await recordPaidRsvp(order, email, orderId);
    // null → this order was already handled earlier, nothing new was sent
    let emailed: boolean | null = null;
    if (receipt) {
      // First time this paid order is recorded — count the redemption and
      // write the per-person record behind the once-per-user check.
      // Re-verifies of the same order return receipt=false above (and the
      // redemption row is unique per order id), so a refresh of the
      // confirmation page can't double-count.
      const promoUsed = order.metadata?.promo;
      if (promoUsed) {
        const db = getPrismaClient();
        if (db) await redeemPromoCode(db, promoUsed, { email, phone: order.metadata?.phone, orderId });
      }
      const ticket = TIERS.find((t) => t.priceUsd > 0);
      // Receipt email + Google Sheet row — both best-effort, side by side
      const [sent] = await Promise.all([
        sendClubbingConfirmationDetailed({
          to: email,
          name: name || order.metadata?.name || "friend",
          tierName: ticket?.name ?? "General Admission",
          guests,
          seva: "paid",
          rsvpId, // door QR ticket rides in the confirmation
        }),
        appendRegistrationToSheet({
          name: name || order.metadata?.name || email,
          email,
          phone: order.metadata?.phone || "",
          guests,
          hearAbout: order.metadata?.hear_about || "",
          emailOptIn: order.metadata?.email_opt_in === "yes",
          ticket: ticket?.name ?? "General Admission",
          payment: [
            "PAID via Square",
            order.metadata?.donation ? `+$${order.metadata.donation} extra donation` : null,
            order.metadata?.promo ? `code ${order.metadata.promo}` : null,
          ]
            .filter(Boolean)
            .join(" · "),
        }),
      ]);
      emailed = sent.ok;
      if (sent.ok && rsvpId) {
        // Mark the QR as delivered so the admin batch-send skips this party
        const db = getPrismaClient();
        if (db) {
          await db.rsvp
            .update({ where: { id: rsvpId }, data: { qrSentAt: new Date() } })
            .catch((e: unknown) => console.error("qrSentAt stamp failed (non-fatal):", e));
        }
      }
      if (!sent.ok) {
        console.error(`Order ${orderId} registered but the confirmation email was NOT sent:`, sent.error);
      }
    }

    return NextResponse.json({ paid: true, name: String(name || order.metadata?.name || ""), emailed });
  } catch (error) {
    console.error("Checkout verify error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}
