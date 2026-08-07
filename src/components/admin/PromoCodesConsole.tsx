"use client";

/**
 * PromoCodesConsole — create and manage Bhajan Clubbing promo codes.
 *
 * Codes are redeemed at the ticket checkout: percent codes take a cut of
 * the ticket subtotal, fixed codes take a dollar amount off the order
 * (never the optional extra donation). Usage counts up only on verified
 * paid orders.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

interface PromoCode {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  percentOff: number | null;
  amountOffCents: number | null;
  maxUses: number | null;
  usedCount: number;
  oncePerUser: boolean;
  expiresAt: string | null;
  active: boolean;
  note: string | null;
  createdAt: string;
}

function discountLabel(c: PromoCode): string {
  return c.kind === "percent"
    ? `${c.percentOff}% off`
    : `$${((c.amountOffCents ?? 0) / 100).toFixed(2)} off`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Live status of a code — mirrors the checkout's validation rules. */
function statusOf(c: PromoCode): { label: string; className: string } {
  if (!c.active) return { label: "paused", className: "bg-yellow-500/15 text-yellow-400" };
  if (c.expiresAt && new Date(c.expiresAt) <= new Date())
    return { label: "expired", className: "bg-red-500/15 text-red-400" };
  if (c.maxUses !== null && c.usedCount >= c.maxUses)
    return { label: "redeemed", className: "bg-red-500/15 text-red-400" };
  return { label: "active", className: "bg-emerald-500/15 text-emerald-400" };
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#E8751A]/50 focus:outline-none";
const labelClass = "mb-1 block text-xs text-white/40 uppercase tracking-wider";

interface PromoCodesConsoleProps {
  userEmail: string;
}

export default function PromoCodesConsole({ userEmail }: PromoCodesConsoleProps) {
  const router = useRouter();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Create form
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [oncePerUser, setOncePerUser] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promocodes");
      if (res.ok) {
        const data = await res.json();
        setCodes(data.codes);
      } else {
        toast.error("Failed to load promo codes");
      }
    } catch {
      toast.error("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promocodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          kind,
          ...(kind === "percent" ? { percentOff: value } : { amountOffUsd: value }),
          maxUses: maxUses || null,
          oncePerUser,
          // datetime-local values carry no zone — send as-is; the server
          // parses in its own zone, which is what "expires end of day" means
          // for a small community event.
          expiresAt: expiresAt || null,
          note: note || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to create code");
        return;
      }
      toast.success(`Code ${data.code.code} created`);
      setCode("");
      setValue("");
      setMaxUses("");
      setOncePerUser(false);
      setExpiresAt("");
      setNote("");
      fetchCodes();
    } catch {
      toast.error("Failed to create code");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: PromoCode) {
    try {
      const res = await fetch("/api/admin/promocodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, active: !c.active }),
      });
      if (!res.ok) throw new Error();
      setCodes((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !c.active } : x)));
      toast.success(!c.active ? `${c.code} resumed` : `${c.code} paused`);
    } catch {
      toast.error("Failed to update code");
    }
  }

  async function deleteCode(c: PromoCode) {
    if (!window.confirm(`Delete code ${c.code}? This can't be undone. (Pausing keeps its history.)`)) return;
    try {
      const res = await fetch(`/api/admin/promocodes?id=${encodeURIComponent(c.id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCodes((prev) => prev.filter((x) => x.id !== c.id));
      toast.success(`${c.code} deleted`);
    } catch {
      toast.error("Failed to delete code");
    }
  }

  const activeCount = codes.filter((c) => statusOf(c).label === "active").length;
  const totalRedemptions = codes.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Toaster position="top-right" />

      {/* ---- Header ---- */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c20]/60 px-6 py-4 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-bold">
            Gita Life <span className="text-[#E8751A]">NYC</span>{" "}
            <span className="text-white/40">/ Admin / Promo Codes</span>
          </h1>
          <p className="text-xs text-white/40">{userEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push("/admin/rsvps")}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            RSVPs
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* ---- Stats ---- */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Codes", value: codes.length, color: "#E8751A" },
            { label: "Active", value: activeCount, color: "#2D8F4E" },
            { label: "Redemptions", value: totalRedemptions, color: "#D4A843" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-[#0c0c20]/60 p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: stat.color }}>
                {loading ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ---- Create form ---- */}
        <form onSubmit={createCode} className="mb-8 rounded-xl border border-white/[0.06] bg-[#0c0c20]/40 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">New Promo Code</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="pc-code" className={labelClass}>Code *</label>
              <input
                id="pc-code"
                type="text"
                required
                placeholder="e.g. EARLYBIRD10"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={`${inputClass} uppercase`}
              />
            </div>
            <div>
              <label htmlFor="pc-kind" className={labelClass}>Discount Type *</label>
              <select
                id="pc-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as "percent" | "fixed")}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="percent" className="bg-[#0c0c20]">Percent off tickets</option>
                <option value="fixed" className="bg-[#0c0c20]">Fixed amount off order</option>
              </select>
            </div>
            <div>
              <label htmlFor="pc-value" className={labelClass}>
                {kind === "percent" ? "Percent Off (1–100) *" : "Amount Off (USD) *"}
              </label>
              <input
                id="pc-value"
                type="number"
                required
                min={kind === "percent" ? 1 : 0.01}
                max={kind === "percent" ? 100 : 10000}
                step={kind === "percent" ? 1 : 0.01}
                placeholder={kind === "percent" ? "10" : "5.00"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pc-max" className={labelClass}>Max Uses (blank = unlimited)</label>
              <input
                id="pc-max"
                type="number"
                min={1}
                step={1}
                placeholder="Unlimited"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pc-expires" className={labelClass}>Expires (blank = never)</label>
              <input
                id="pc-expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pc-note" className={labelClass}>Note (internal)</label>
              <input
                id="pc-note"
                type="text"
                placeholder="e.g. Instagram giveaway"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
            <input
              type="checkbox"
              checked={oncePerUser}
              onChange={(e) => setOncePerUser(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 accent-[#E8751A]"
            />
            <span>
              One use per person{" "}
              <span className="text-white/40">— blocks repeat redemptions matching the buyer&rsquo;s email or mobile number</span>
            </span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-lg bg-[#E8751A] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#d0680f] disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Code"}
          </button>
        </form>

        {/* ---- Codes table ---- */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0c0c20]/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-white/30">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Limit</th>
                <th className="px-4 py-3 font-medium text-center">Used</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-white/30">
                    Loading promo codes...
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-white/30">
                    No promo codes yet — create one above.
                  </td>
                </tr>
              ) : (
                codes.map((c) => {
                  const status = statusOf(c);
                  return (
                    <tr key={c.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono font-bold text-white/90">{c.code}</td>
                      <td className="px-4 py-3 text-white/70">{discountLabel(c)}</td>
                      <td className="px-4 py-3 text-xs text-white/50 whitespace-nowrap">
                        {c.oncePerUser ? "1× per person" : "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-white/60">
                        {c.usedCount}
                        {c.maxUses !== null && <span className="text-white/30"> / {c.maxUses}</span>}
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">
                        {c.expiresAt ? formatDate(c.expiresAt) : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/40 max-w-[180px] truncate text-xs">{c.note || "—"}</td>
                      <td className="px-4 py-3 text-white/40 whitespace-nowrap text-xs">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(c)}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {c.active ? "Pause" : "Resume"}
                        </button>
                        <button
                          onClick={() => deleteCode(c)}
                          className="ml-2 rounded-lg border border-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-white/30">
          Codes apply to the Bhajan Clubbing checkout. Percent codes discount the ticket subtotal (after the
          family &amp; friends discount); fixed codes take a dollar amount off the order. The optional extra
          donation is never discounted, and usage only counts up when a payment actually completes.
          &ldquo;1× per person&rdquo; codes block repeat redemptions whose email or mobile number matches an
          earlier paid order that used the same code.
        </p>
      </main>
    </div>
  );
}
