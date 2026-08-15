"use client";

/**
 * CheckinBoard — door check-in for Bhajan Clubbing.
 *
 * Built for a phone at the door: huge search box, card rows with big
 * one-tap check-in buttons, undo, live guest counters, auto-refresh.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import QrScanner, { type ScanVerdict } from "@/components/admin/QrScanner";

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  guests: number;
  tier: string | null;
  paid: boolean;
  notes: string | null;
  checkedInAt: string | null;
  createdAt: string;
}

interface CheckinData {
  event: { title: string; capacity: number };
  stats: { parties: number; partiesIn: number; guests: number; guestsIn: number; vipPaid: number };
  registrations: Registration[];
}

const TIER_COLORS: Record<string, string> = {
  "General Admission": "#E8751A",
  // Legacy tiers — keep colors so old registrations still render nicely
  "General Vibes": "#E8751A",
  "Front Row Bhakti": "#4D9FFF",
  "VIP Seva Pass": "#D4A843",
};

type Filter = "all" | "waiting" | "arrived";

function checkinTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function CheckinBoard({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [data, setData] = useState<CheckinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrSending, setQrSending] = useState(false);
  const [reminderSending, setReminderSending] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // An unconfirmed delete quietly disarms after a few seconds
  useEffect(() => {
    if (!confirmDeleteId) return;
    const t = setTimeout(() => setConfirmDeleteId(null), 3500);
    return () => clearTimeout(t);
  }, [confirmDeleteId]);

  const fetchList = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await fetch("/api/admin/checkin", { cache: "no-store" });
      if (res.ok) setData(await res.json());
      else if (!quiet) toast.error("Failed to load registrations");
    } catch {
      if (!quiet) toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
    // Keep the board live while multiple volunteers work the door
    const id = setInterval(() => fetchList(true), 20_000);
    return () => clearInterval(id);
  }, [fetchList]);

  /** QR scan → server check-in → verdict for the scanner overlay. */
  const scanToken = useCallback(
    async (token: string): Promise<ScanVerdict> => {
      try {
        const res = await fetch("/api/admin/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { kind: "error" };
        if (data.result === "ok" || data.result === "already") {
          fetchList(true); // reflect the scan on this device's list right away
          return {
            kind: data.result,
            name: data.name,
            guests: data.guests,
            checkedInAt: data.checkedInAt,
          };
        }
        return { kind: "invalid" };
      } catch {
        return { kind: "error" };
      }
    },
    [fetchList],
  );

  // A ?scan= token in the URL means a QR was scanned with a regular
  // camera app (the email QR encodes the check-in URL) — process it once
  // and scrub the address bar.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("scan");
    if (!token) return;
    window.history.replaceState(null, "", window.location.pathname);
    scanToken(token).then((v) => {
      if (v.kind === "ok") toast.success(`${v.name ?? "Guest"} checked in${v.guests && v.guests > 1 ? ` (party of ${v.guests})` : ""}`, { duration: 4000 });
      else if (v.kind === "already") toast(`${v.name ?? "Guest"} was already checked in`, { icon: "⚠️", duration: 5000 });
      else if (v.kind === "invalid") toast.error("Not a valid ticket");
      else toast.error("Scan failed — try again");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Shared batch-send loop for the two email blasts (tickets / reminder). */
  const runEmailBlast = async (
    payload: Record<string, string>,
    labels: { sent: (n: number) => string; nothingToDo: string; failGeneric: string },
  ) => {
    let total = 0;
    try {
      // Server sends in small batches; keep going while it reports more
      // pending AND each round makes progress (so a broken SMTP config
      // can't loop forever).
      for (;;) {
        const res = await fetch("/api/admin/checkin/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(String(data.error || labels.failGeneric));
          break;
        }
        total += data.sent ?? 0;
        if (data.failed) toast.error(`${data.failed} email${data.failed === 1 ? "" : "s"} failed — press again later to retry`);
        if (!data.remaining || !data.sent) {
          if (total > 0) toast.success(labels.sent(total));
          else if (!data.failed) toast(labels.nothingToDo, { icon: "✓" });
          break;
        }
        toast(`${total} sent, ${data.remaining} to go…`, { icon: "📤", duration: 1500 });
      }
    } catch {
      toast.error(labels.failGeneric);
    }
  };

  /** Batch-email QR tickets to everyone who hasn't received one yet. */
  const sendQrTickets = async () => {
    if (!window.confirm("Email QR door tickets to every confirmed registration that hasn't received one yet?")) return;
    setQrSending(true);
    await runEmailBlast(
      {},
      {
        sent: (n) => `QR tickets sent to ${n} ${n === 1 ? "party" : "parties"}`,
        nothingToDo: "Everyone already has their QR ticket",
        failGeneric: "Couldn't send tickets",
      },
    );
    setQrSending(false);
  };

  /** Batch-email the event reminder (QR attached) to every confirmed
   *  registration. Deduped server-side — pressing again later only
   *  reaches people who registered after this blast. */
  const sendReminders = async () => {
    if (
      !window.confirm(
        "Send the event reminder (with each party's QR ticket) to EVERY confirmed registration? Each party gets it once — pressing again later only emails new registrations.",
      )
    )
      return;
    setReminderSending(true);
    await runEmailBlast(
      { mode: "reminder" },
      {
        sent: (n) => `Reminder sent to ${n} ${n === 1 ? "party" : "parties"}`,
        nothingToDo: "Everyone has already been reminded",
        failGeneric: "Couldn't send reminders",
      },
    );
    setReminderSending(false);
  };

  const toggle = async (r: Registration) => {
    const next = !r.checkedInAt;
    setBusyId(r.id);
    // Optimistic flip so the door line never waits on the network
    setData((d) =>
      d
        ? {
            ...d,
            registrations: d.registrations.map((x) =>
              x.id === r.id ? { ...x, checkedInAt: next ? new Date().toISOString() : null } : x,
            ),
          }
        : d,
    );
    try {
      const res = await fetch("/api/admin/checkin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, checkedIn: next }),
      });
      if (!res.ok) throw new Error();
      if (next) {
        toast.success(`${r.name} checked in${r.guests > 1 ? ` (+${r.guests - 1})` : ""}`, { duration: 2500 });
      } else {
        toast(`${r.name} check-in undone`, { icon: "↩️", duration: 2000 });
      }
      fetchList(true);
    } catch {
      toast.error("Couldn't update — try again");
      fetchList(true);
    } finally {
      setBusyId(null);
    }
  };

  /** Re-email one party's QR ticket — for "I can't find the email". */
  const resendQr = async (r: Registration) => {
    setBusyId(r.id);
    try {
      const res = await fetch("/api/admin/checkin/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String(data.error || ""));
      toast.success(`QR ticket emailed to ${r.email}`, { duration: 3000 });
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Couldn't send the ticket");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (r: Registration) => {
    setConfirmDeleteId(null);
    setBusyId(r.id);
    try {
      const res = await fetch("/api/admin/checkin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id }),
      });
      if (!res.ok) throw new Error();
      setData((d) => (d ? { ...d, registrations: d.registrations.filter((x) => x.id !== r.id) } : d));
      toast.success(`${r.name}'s registration deleted`, { duration: 2500 });
      fetchList(true);
    } catch {
      toast.error("Couldn't delete — try again");
      fetchList(true);
    } finally {
      setBusyId(null);
    }
  };

  const list = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.registrations.filter((r) => {
      if (filter === "waiting" && r.checkedInAt) return false;
      if (filter === "arrived" && !r.checkedInAt) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, "") || " ")
      );
    });
  }, [data, search, filter]);

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Toaster position="top-center" />

      {/* ---- Header ---- */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c20]/60 px-6 py-4 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-bold">
            Gita Life <span className="text-[#E8751A]">NYC</span>{" "}
            <span className="text-white/40">/ Admin / Check-in</span>
          </h1>
          <p className="text-xs text-white/40">{userEmail}</p>
        </div>
        <div className="flex items-center gap-3">
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

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">{data?.event.title ?? "Bhajan Clubbing"}</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={sendQrTickets}
              disabled={qrSending || reminderSending}
              className="text-xs text-white/40 transition-colors hover:text-white disabled:opacity-50"
            >
              {qrSending ? "Sending tickets…" : "✉ Email QR tickets"}
            </button>
            <button
              onClick={sendReminders}
              disabled={qrSending || reminderSending}
              className="text-xs text-white/40 transition-colors hover:text-white disabled:opacity-50"
            >
              {reminderSending ? "Sending reminders…" : "🔔 Send reminder"}
            </button>
            <button onClick={() => fetchList()} className="text-xs text-white/40 transition-colors hover:text-white">
              ↻ Refresh
            </button>
          </div>
        </div>
        <p className="mb-4 text-sm text-white/40">
          Scan a guest&rsquo;s QR ticket, or tap a card to check the whole party in. Tap again to undo. The trash button deletes a registration — tap it twice to confirm.
        </p>

        {/* ---- Scan button — the primary door action ---- */}
        <button
          onClick={() => setScannerOpen(true)}
          className="mb-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#E8751A] py-4 text-[15px] font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-[#d0680f]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
            <path d="M7 12h10" />
          </svg>
          Scan tickets
        </button>

        {/* ---- Live counters ---- */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: "Guests in", value: stats ? `${stats.guestsIn}/${stats.guests}` : "…", color: "#2D8F4E" },
            { label: "Parties in", value: stats ? `${stats.partiesIn}/${stats.parties}` : "…", color: "#E8751A" },
            { label: "Paid", value: stats ? stats.vipPaid : "…", color: "#D4A843" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#0c0c20]/60 p-3 text-center sm:p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40">{s.label}</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl" style={{ color: s.color }}>
                {loading && !data ? "…" : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ---- Search + filters ---- */}
        <div className="sticky top-0 z-10 -mx-4 mb-4 space-y-3 bg-[#0a0a1a]/95 px-4 py-3 backdrop-blur-lg sm:-mx-6 sm:px-6">
          <input
            ref={searchRef}
            type="search"
            autoFocus
            placeholder="Search name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[16px] text-white placeholder:text-white/30 focus:border-[#E8751A]/50 focus:outline-none"
          />
          <div className="flex gap-2">
            {(
              [
                { key: "all", label: "Everyone" },
                { key: "waiting", label: "Not arrived" },
                { key: "arrived", label: "Checked in" },
              ] as { key: Filter; label: string }[]
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  filter === f.key
                    ? "bg-[#E8751A] text-white"
                    : "border border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---- Registration cards ---- */}
        <div className="space-y-2.5 pb-16">
          {loading && !data ? (
            <p className="py-12 text-center text-white/30">Loading registrations…</p>
          ) : list.length === 0 ? (
            <p className="py-12 text-center text-white/30">
              {search || filter !== "all" ? "Nobody matches — check the spelling?" : "No registrations yet."}
            </p>
          ) : (
            list.map((r) => {
              const isIn = !!r.checkedInAt;
              const tierColor = (r.tier && TIER_COLORS[r.tier]) || "#E8751A";
              const busy = busyId === r.id;
              const armed = confirmDeleteId === r.id;
              return (
                <div
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${r.name} — ${isIn ? "undo check-in" : "check in"}`}
                  onClick={() => !busy && toggle(r)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
                      e.preventDefault();
                      if (!busy) toggle(r);
                    }
                  }}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                    busy ? "pointer-events-none opacity-60" : ""
                  } ${
                    isIn
                      ? "border-emerald-500/30 bg-emerald-500/[0.07]"
                      : "border-white/[0.08] bg-[#0c0c20]/60 hover:border-[#E8751A]/40 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className={`text-[15px] font-bold ${isIn ? "text-emerald-300" : "text-white"}`}>{r.name}</span>
                      {r.guests > 1 && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">
                          +{r.guests - 1}
                        </span>
                      )}
                      {r.tier && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          style={{ background: `${tierColor}22`, color: tierColor, border: `1px solid ${tierColor}55` }}
                        >
                          {r.tier}
                        </span>
                      )}
                      {r.paid && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                          Paid
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-white/40">
                      {r.email}
                      {r.phone ? ` · ${r.phone}` : ""}
                    </p>
                    {r.notes && <p className="mt-0.5 truncate text-[11px] text-white/30">{r.notes}</p>}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide ${
                      isIn ? "bg-emerald-500/20 text-emerald-300" : "bg-[#E8751A] text-white"
                    }`}
                  >
                    {isIn ? `✓ In · ${checkinTime(r.checkedInAt!)}` : "Check in"}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={`Email QR ticket to ${r.name}`}
                    title="Resend QR ticket email"
                    onClick={(e) => {
                      e.stopPropagation();
                      resendQr(r);
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/35 transition-all hover:border-[#E8751A]/50 hover:bg-[#E8751A]/10 hover:text-[#E8751A]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 6 10-6" />
                    </svg>
                  </button>
                  {/* Two-tap delete: first tap arms it, second tap within 3.5s deletes */}
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={armed ? `Confirm delete ${r.name}` : `Delete ${r.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (armed) remove(r);
                      else setConfirmDeleteId(r.id);
                    }}
                    className={`flex shrink-0 items-center justify-center rounded-full text-xs font-extrabold uppercase tracking-wide transition-all ${
                      armed
                        ? "bg-red-500 px-3.5 py-2.5 text-white"
                        : "h-9 w-9 border border-white/10 text-white/35 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                    }`}
                  >
                    {armed ? (
                      "Delete?"
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M3 6h18" />
                        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </main>

      {scannerOpen && (
        <QrScanner
          onScan={scanToken}
          onClose={() => {
            setScannerOpen(false);
            fetchList(true);
          }}
        />
      )}
    </div>
  );
}
