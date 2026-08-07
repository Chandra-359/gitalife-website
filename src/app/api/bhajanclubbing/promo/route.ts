import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { checkPromoCode } from "@/lib/clubbing";

/**
 * Promo code validation — POST { code, email?, phone? } → { valid, promo?, error? }.
 *
 * Lets the ticket flow show the discount before checkout, including the
 * once-per-user check against whatever email/mobile the buyer has typed
 * so far. Purely advisory: the checkout route re-validates the code with
 * the submitted identity and computes the discount itself, so nothing
 * returned here is trusted with money.
 */
export async function POST(request: Request) {
  try {
    const { code, email, phone } = await request.json();
    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { valid: false, error: "Promo codes are briefly offline — please try again in a few minutes" },
        { status: 503 },
      );
    }
    const result = await checkPromoCode(db, code, new Date(), { email, phone });
    if (!result.ok) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
    }
    return NextResponse.json({ valid: true, promo: result.promo });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ valid: false, error: "Couldn't check that code — please try again" }, { status: 500 });
  }
}
