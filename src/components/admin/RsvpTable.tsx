"use client";

/**
 * RsvpTable — Admin RSVP management view
 *
 * Shows all RSVPs in a table, filterable by program and searchable by name/email.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { isSpamRegistration } from "@/lib/spam";
import { EVENT as CLUBBING } from "@/data/bhajanClubbing";

interface Rsvp {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  guests: number;
  notes: string | null;
  hearAbout: string | null;
  emailOptIn: boolean;
  status: string;
  createdAt: string;
  program: {
    id: string;
    title: string;
    dayOfWeek: string;
    category: string;
    type: string;
  };
}

interface ProgramOption {
  id: string;
  title: string;
  dayOfWeek: string;
}

function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
  waitlisted: "bg-yellow-500/15 text-yellow-400",
};

interface RsvpTableProps {
  userEmail: string;
}

export default function RsvpTable({ userEmail }: RsvpTableProps) {
  const router = useRouter();
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [search, setSearch] = useState("");

  const fetchRsvps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProgram) params.set("programId", selectedProgram);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/rsvps?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRsvps(data.rsvps);
        if (programs.length === 0) setPrograms(data.programs);
      }
    } catch {
      toast.error("Failed to load RSVPs");
    } finally {
      setLoading(false);
    }
  }, [selectedProgram, search, programs.length]);

  useEffect(() => { fetchRsvps(); }, [fetchRsvps]);

  // Registrations matching the bot heuristics (clubbing excluded — those
  // are paid). Previewed here, purged server-side (DB + sheet rows).
  const spamCandidates = rsvps.filter(
    (r) => r.status === "confirmed" && r.program.id !== CLUBBING.programId && isSpamRegistration(r.name, r.email),
  );
  const [purging, setPurging] = useState(false);

  async function purgeSpam() {
    if (spamCandidates.length === 0) return;
    const preview = spamCandidates
      .slice(0, 12)
      .map((r) => `• ${r.name} — ${r.email} (${r.program.title})`)
      .join("\n");
    const scope = selectedProgram ? "this program" : "ALL programs";
    if (
      !window.confirm(
        `Delete ${spamCandidates.length} spam-looking registration${spamCandidates.length === 1 ? "" : "s"} across ${scope} AND their Google Sheet rows?\n\n${preview}${spamCandidates.length > 12 ? "\n…" : ""}`,
      )
    )
      return;
    setPurging(true);
    try {
      const res = await fetch("/api/admin/spam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedProgram ? { programId: selectedProgram } : {}),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String(result.error || ""));
      toast.success(
        `Purged ${result.purged} registration${result.purged === 1 ? "" : "s"} (${result.sheetRows} sheet row${result.sheetRows === 1 ? "" : "s"})`,
        { duration: 5000 },
      );
      fetchRsvps();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Purge failed — try again");
    } finally {
      setPurging(false);
    }
  }

  // Stats
  const totalRsvps = rsvps.length;
  const totalGuests = rsvps.reduce((sum, r) => sum + r.guests, 0);
  const confirmedCount = rsvps.filter((r) => r.status === "confirmed").length;

  // Export CSV
  function exportCsv() {
    const header = "Name,Email,Phone,Guests,Heard Via,Email Opt-In,Notes,Status,Program,Day,RSVP Date\n";
    const rows = rsvps.map((r) =>
      [
        `"${r.name}"`,
        r.email,
        r.phone || "",
        r.guests,
        `"${(r.hearAbout || "").replace(/"/g, '""')}"`,
        r.emailOptIn ? "yes" : "no",
        `"${(r.notes || "").replace(/"/g, '""')}"`,
        r.status,
        `"${r.program.title}"`,
        r.program.dayOfWeek,
        formatDatetime(r.createdAt),
      ].join(","),
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gitalife-rsvps-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Toaster position="top-right" />

      {/* ---- Header ---- */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c20]/60 px-6 py-4 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-bold">
            Gita Life <span className="text-[#E8751A]">NYC</span>{" "}
            <span className="text-white/40">/ Admin / RSVPs</span>
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
            onClick={() => router.push("/admin/checkin")}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            Check-in
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
            { label: "Total RSVPs", value: totalRsvps, color: "#E8751A" },
            { label: "Total Guests", value: totalGuests, color: "#D4A843" },
            { label: "Confirmed", value: confirmedCount, color: "#2D8F4E" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-[#0c0c20]/60 p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: stat.color }}>
                {loading ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ---- Filters ---- */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Program filter */}
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:border-[#E8751A]/50 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-[#0c0c20]">All Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0c0c20]">
                {p.title} ({p.dayOfWeek})
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M10.5 10.5L14.5 14.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#E8751A]/50 focus:outline-none"
            />
          </div>

          {/* Spam purge — only shows when the heuristics flag rows */}
          {spamCandidates.length > 0 && (
            <button
              onClick={purgeSpam}
              disabled={purging}
              className="rounded-lg border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50 whitespace-nowrap"
            >
              {purging ? "Purging…" : `🧹 Purge spam (${spamCandidates.length})`}
            </button>
          )}

          {/* Export */}
          <button
            onClick={exportCsv}
            disabled={rsvps.length === 0}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 whitespace-nowrap"
          >
            Export CSV
          </button>
        </div>

        {/* ---- RSVP table ---- */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0c0c20]/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-white/30">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium text-center">Guests</th>
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Heard Via</th>
                <th className="px-4 py-3 font-medium text-center">Updates</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium">RSVP Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-white/30">
                    Loading RSVPs...
                  </td>
                </tr>
              ) : rsvps.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-white/30">
                    {selectedProgram || search ? "No RSVPs match your filters." : "No RSVPs yet."}
                  </td>
                </tr>
              ) : (
                rsvps.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white/90">{r.name}</td>
                    <td className="px-4 py-3 text-white/60">
                      <a href={`mailto:${r.email}`} className="hover:text-[#E8751A] transition-colors">
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-white/50">{r.phone || "—"}</td>
                    <td className="px-4 py-3 text-center text-white/60">{r.guests}</td>
                    <td className="px-4 py-3">
                      <p className="text-white/70 text-xs">{r.program.title}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">{r.program.dayOfWeek}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[r.status] || STATUS_COLORS.confirmed}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50 max-w-[140px] truncate text-xs">
                      {r.hearAbout || "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      {r.emailOptIn ? (
                        <span className="text-emerald-400" title="Agreed to receive email updates">✓</span>
                      ) : (
                        <span className="text-white/25">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/40 max-w-[200px] truncate text-xs">
                      {r.notes || "—"}
                    </td>
                    <td className="px-4 py-3 text-white/40 whitespace-nowrap text-xs">
                      {formatDatetime(r.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
