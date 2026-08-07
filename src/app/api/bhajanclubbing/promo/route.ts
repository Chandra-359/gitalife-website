import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { checkPromoCode } from "@/lib/clubbing";

/**
 * Promo code validation — POST { code } → { valid, promo? , error? }.
 *
 * Lets the ticket flow show the discount before checkout. Purely
 * advisory: the checkout route re-validates the code server-side and
 * computes the discount itself, so nothing returned here is trusted
 * with money.
 */
export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { valid: false, error: "Promo codes are briefly offline — please try again in a few minutes" },
        { status: 503 },
      );
    }
    const result = await checkPromoCode(db, code);
    if (!result.ok) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
    }
    return NextResponse.json({ valid: true, promo: result.promo });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ valid: false, error: "Couldn't check that code — please try again" }, { status: 500 });
  }
}
