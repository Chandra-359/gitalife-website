/**
 * /api/admin/promocodes — promo code management (admin only)
 *
 *  GET    — list all codes, newest first
 *  POST   — create a code { code, kind, percentOff | amountOffUsd, maxUses?, expiresAt?, note? }
 *  PATCH  — { id, active } pause/resume a code
 *  DELETE — ?id=<id> remove a code entirely
 *
 * Codes currently always target the Bhajan Clubbing event (EVENT.programId);
 * the model carries programId so future events can mint their own.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normalizePromoCode } from "@/lib/clubbing";
import { EVENT } from "@/data/bhajanClubbing";

export const dynamic = "force-dynamic";

async function guard() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    const codes = await prisma!.promoCode.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({
      codes: codes.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        expiresAt: c.expiresAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch promo codes:", error);
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const body = await request.json();
    const code = normalizePromoCode(body.code);
    if (!code || code.length < 3 || code.length > 40 || !/^[A-Z0-9_-]+$/.test(code)) {
      return NextResponse.json(
        { error: "Code must be 3–40 characters — letters, numbers, - and _ only" },
        { status: 400 },
      );
    }

    const kind = body.kind === "fixed" ? "fixed" : "percent";
    let percentOff: number | null = null;
    let amountOffCents: number | null = null;
    if (kind === "percent") {
      percentOff = Math.round(Number(body.percentOff));
      if (!Number.isFinite(percentOff) || percentOff < 1 || percentOff > 100) {
        return NextResponse.json({ error: "Percent off must be between 1 and 100" }, { status: 400 });
      }
    } else {
      const usd = Number(body.amountOffUsd);
      if (!Number.isFinite(usd) || usd <= 0 || usd > 10_000) {
        return NextResponse.json({ error: "Amount off must be between $0.01 and $10,000" }, { status: 400 });
      }
      amountOffCents = Math.round(usd * 100);
    }

    let maxUses: number | null = null;
    if (body.maxUses !== undefined && body.maxUses !== null && String(body.maxUses).trim() !== "") {
      maxUses = Math.round(Number(body.maxUses));
      if (!Number.isFinite(maxUses) || maxUses < 1) {
        return NextResponse.json({ error: "Max uses must be a positive number (or blank for unlimited)" }, { status: 400 });
      }
    }

    let expiresAt: Date | null = null;
    if (typeof body.expiresAt === "string" && body.expiresAt.trim()) {
      expiresAt = new Date(body.expiresAt);
      if (Number.isNaN(expiresAt.getTime())) {
        return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 });
      }
    }

    const created = await prisma!.promoCode.create({
      data: {
        code,
        programId: EVENT.programId,
        kind,
        percentOff,
        amountOffCents,
        maxUses,
        expiresAt,
        note: typeof body.note === "string" && body.note.trim() ? body.note.trim().slice(0, 300) : null,
      },
    });
    return NextResponse.json({ code: created }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "That code already exists" }, { status: 409 });
    }
    console.error("Failed to create promo code:", error);
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const { id, active } = await request.json();
    if (!id || typeof active !== "boolean") {
      return NextResponse.json({ error: "id and active are required" }, { status: 400 });
    }
    const updated = await prisma!.promoCode.update({ where: { id: String(id) }, data: { active } });
    return NextResponse.json({ code: updated });
  } catch (error) {
    console.error("Failed to update promo code:", error);
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await prisma!.promoCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete promo code:", error);
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}
