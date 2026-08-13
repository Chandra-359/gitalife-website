import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { squareConfig, squareConfigured, squareHeaders } from "@/lib/square";
import { sendDonationReceipt } from "@/lib/donationEmail";
import { DONATION_REFERENCE_ID, donationCents, MAX_DONATION_USD } from "@/data/donation";

/**
 * Donation checkout — Square Checkout API (payment links), modeled on the
 * Bhajan Clubbing ticket flow.
 *
 * PAY-FIRST: nothing is recorded until Square confirms the money. The
 * donor's name/email ride along in the Square order's metadata, and the
 * verified return trip writes the Donation row and sends the thank-you
 * receipt. Abandoned checkouts leave nothing behind.
 *
 *  POST → validate name/email, clamp the amount server-side, create a
 *         payment link, pin our own `order=<id>` onto the redirect URL,
 *         respond with the hosted checkout URL.
 *  GET  → ?order=<order_id>: confirm the order is actually paid and is a
 *         donation, then record it (idempotent per Square order id) and
 *         send the receipt. Without ?order it reports { payments } so the
 *         page can pause itself when Square isn't configured.
 */

export async function POST(request: Request) {
  try {
    const sq = squareConfig();
    if (!sq) {
      return NextResponse.json(
        { error: "Online donations aren't available right now — please check back shortly" },
        { status: 503 },
      );
    }

    const { name, email, amount } = await request.json();
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Your name is required" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // The amount is clamped server-side — the client's number is a request,
    // never an instruction Square gets to see unchecked.
    const amountCents = donationCents(amount);
    if (amountCents === null) {
      return NextResponse.json({ error: "Please enter a valid donation amount" }, { status: 400 });
    }
    if (amountCents > MAX_DONATION_USD * 100) {
      return NextResponse.json(
        { error: `For gifts over $${MAX_DONATION_USD.toLocaleString()}, please contact us directly` },
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
          reference_id: DONATION_REFERENCE_ID,
          // The donor's details ride in metadata — the verified return
          // trip turns them into the Donation row + receipt email.
          metadata: {
            kind: "donation",
            name: String(name).trim().slice(0, 255),
            email: String(email).trim().slice(0, 255),
          },
          line_items: [
            {
              name: "Donation — Gita Life NYC",
              quantity: "1",
              note: "Supporting free programs, prasadam, and community initiatives",
              base_price_money: { amount: amountCents, currency: "USD" },
            },
          ],
        },
        checkout_options: {
          redirect_url: `${requestOrigin(request)}/donate?paid=1`,
          ask_for_shipping_address: false,
        },
        pre_populated_data: { buyer_email: String(email).trim() },
      }),
    });

    const created = await createRes.json();
    const link = created?.payment_link;
    if (!createRes.ok || !link?.url) {
      console.error("Square donation checkout error:", created?.errors ?? created);
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
                redirect_url: `${requestOrigin(request)}/donate?paid=1&order=${encodeURIComponent(link.order_id)}`,
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
    console.error("Donation checkout error:", error);
    return NextResponse.json({ error: "Couldn't start checkout" }, { status: 500 });
  }
}

function requestOrigin(request: Request): string {
  return request.headers.get("origin") ?? new URL(request.url).origin;
}

interface PaidOrder {
  metadata?: Record<string, string>;
  total_money?: { amount?: number };
  tenders?: { payment_id?: string }[];
}

/** Pull the donor email off the order, falling back to the payment record. */
async function orderDonorEmail(
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

/**
 * Record a verified paid donation, idempotent per Square order: the
 * orderId is unique on the Donation table, so re-verifying the same order
 * (refresh, retry) records and emails nothing new.
 *
 * Returns whether this verification was the first one (→ send the
 * receipt), or null when the database is offline (paid but unrecorded —
 * reconcile via the Square dashboard).
 */
async function recordDonation(name: string, email: string, amountCents: number, orderId: string) {
  const db = getPrismaClient();
  if (!db) {
    console.error(`Paid donation order ${orderId} could not be recorded (database offline)`);
    return null;
  }
  try {
    await db.donation.create({ data: { name, email, amountCents, orderId } });
    return true;
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? (error as { code: string }).code : null;
    if (code === "P2002") return false; // this order is already on the books
    console.error(`Paid donation order ${orderId} could not be recorded:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const sq = squareConfig();
    const orderId = new URL(request.url).searchParams.get("order");

    // No order param → availability probe for the page.
    if (!orderId) {
      return NextResponse.json({ payments: squareConfigured() });
    }

    if (!sq || !/^[A-Za-z0-9_-]{8,128}$/.test(orderId)) {
      return NextResponse.json({ paid: false }, { status: 400 });
    }

    const res = await fetch(`${sq.base}/v2/orders/${orderId}`, { headers: squareHeaders(sq.token) });
    const data = await res.json();
    if (!res.ok) {
      console.error("Square donation order lookup error:", data?.errors ?? data);
      return NextResponse.json({ paid: false }, { status: 502 });
    }

    const order = data?.order;
    const fullyPaid =
      order?.state === "COMPLETED" ||
      (order?.net_amount_due_money?.amount === 0 && (order?.tenders?.length ?? 0) > 0);
    const isDonation =
      order?.reference_id === DONATION_REFERENCE_ID || order?.metadata?.kind === "donation";
    if (!order || !fullyPaid || !isDonation) return NextResponse.json({ paid: false });

    const name = String(order.metadata?.name ?? "").trim();
    // Prefer what Square actually charged over what the metadata remembers.
    const amountCents = Number(order.total_money?.amount) || 0;

    const email = await orderDonorEmail(sq, order);
    if (!email) {
      // Paid but unidentifiable — surface success, reconcile via Square dashboard
      console.error("Paid donation order without donor email:", orderId);
      return NextResponse.json({ paid: true, name, amountCents });
    }

    const firstVerification = await recordDonation(name || email, email, amountCents, orderId);
    // null → already handled earlier (or DB offline), nothing new was sent
    let emailed: boolean | null = null;
    if (firstVerification) {
      const sent = await sendDonationReceipt({ to: email, name: name || "friend", amountCents });
      emailed = sent.ok;
      if (!sent.ok) {
        console.error(`Donation ${orderId} recorded but the receipt email was NOT sent:`, sent.error);
      }
    }

    return NextResponse.json({ paid: true, name, amountCents, emailed });
  } catch (error) {
    console.error("Donation verify error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}
