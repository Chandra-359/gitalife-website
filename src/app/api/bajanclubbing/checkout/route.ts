import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { EVENT, TIERS } from "@/data/bajanClubbing";

/**
 * VIP Seva Pass checkout — creates and verifies Stripe Checkout sessions.
 *
 * Talks to Stripe's REST API directly (no SDK dependency). Requires
 * STRIPE_SECRET_KEY in the environment; without it POST returns 503 and
 * the client falls back to pay-at-the-door.
 *
 *  POST  → create a Checkout session, respond with its redirect URL.
 *  GET   → ?session_id=cs_…: confirm the session was actually paid before
 *          the page shows "Payment received", and stamp PAID onto the
 *          registrant's RSVP notes so it's visible in the admin table.
 */

const STRIPE_API = "https://api.stripe.com/v1/checkout/sessions";

export async function POST(request: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
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

    const body = new URLSearchParams({
      mode: "payment",
      customer_email: email,
      "line_items[0][quantity]": String(qty),
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(vip.priceUsd * 100),
      "line_items[0][price_data][product_data][name]": `${EVENT.title} ${EVENT.volume} — ${vip.name}`,
      "line_items[0][price_data][product_data][description]": "Seva donation · funds the free midnight prasadam feast",
      // {CHECKOUT_SESSION_ID} is substituted by Stripe on redirect; the
      // returning page calls GET below with it to verify the payment.
      success_url: `${origin}/bajanclubbing?paid=1&session_id={CHECKOUT_SESSION_ID}#tickets`,
      cancel_url: `${origin}/bajanclubbing?canceled=1#tickets`,
      "metadata[event]": EVENT.programId,
      "metadata[name]": String(name ?? ""),
    });

    const res = await fetch(STRIPE_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const session = await res.json();
    if (!res.ok || !session.url) {
      console.error("Stripe checkout error:", session?.error?.message ?? session);
      return NextResponse.json({ error: "Couldn't start checkout — seva can be given at the door" }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Couldn't start checkout" }, { status: 500 });
  }
}

/** Stamp PAID onto the payer's RSVP notes (best-effort, idempotent). */
async function markRsvpPaid(email: string) {
  try {
    const db = getPrismaClient();
    if (!db) return;
    const rsvp = await db.rsvp.findUnique({
      where: { email_programId: { email, programId: EVENT.programId } },
    });
    if (!rsvp || rsvp.notes?.includes("· PAID]")) return;

    const vip = TIERS.find((t) => t.priceUsd > 0);
    const tag = vip ? `[${vip.name}]` : null;
    const notes =
      tag && rsvp.notes?.startsWith(tag)
        ? rsvp.notes.replace(tag, `[${vip!.name} · PAID]`)
        : `[PAID] ${rsvp.notes ?? ""}`.trim();
    await db.rsvp.update({ where: { id: rsvp.id }, data: { notes } });
  } catch (error) {
    // Verification already succeeded — a failed stamp shouldn't fail the page
    console.error("Couldn't mark RSVP paid:", error);
  }
}

export async function GET(request: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    const sessionId = new URL(request.url).searchParams.get("session_id");
    if (!key || !sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
      return NextResponse.json({ paid: false }, { status: 400 });
    }

    const res = await fetch(`${STRIPE_API}/${sessionId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const session = await res.json();
    if (!res.ok) {
      console.error("Stripe session lookup error:", session?.error?.message ?? session);
      return NextResponse.json({ paid: false }, { status: 502 });
    }

    const paid = session.payment_status === "paid" && session.metadata?.event === EVENT.programId;
    if (!paid) return NextResponse.json({ paid: false });

    const email = session.customer_details?.email ?? session.customer_email;
    if (email) await markRsvpPaid(email);

    return NextResponse.json({
      paid: true,
      name: String(session.metadata?.name || session.customer_details?.name || ""),
    });
  } catch (error) {
    console.error("Checkout verify error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}
