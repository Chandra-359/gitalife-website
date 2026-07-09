import { NextResponse } from "next/server";
import { EVENT, TIERS } from "@/data/bajanClubbing";

/**
 * VIP Seva Pass checkout — creates a Stripe Checkout session.
 *
 * Talks to Stripe's REST API directly (no SDK dependency). Requires
 * STRIPE_SECRET_KEY in the environment; without it the route returns
 * 503 and the client falls back to pay-at-the-door.
 */
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
      success_url: `${origin}/bajanclubbing?paid=1#tickets`,
      cancel_url: `${origin}/bajanclubbing?canceled=1#tickets`,
      "metadata[event]": EVENT.programId,
      "metadata[name]": String(name ?? ""),
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
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
