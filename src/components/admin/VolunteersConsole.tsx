"use client";

/**
 * VolunteersConsole — admin view of volunteer drive signups.
 *
 * Per drive: shift-fill board (who's needed where), searchable signup
 * table with each volunteer's shifts, CSV export, spam purge (same
 * heuristics as the RSVP console), and per-row delete. Drives come from
 * src/data/volunteer.ts; rows from the VolunteerSignup table via
 * /api/admin/volunteers.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { isSpamRegistration } from "@/lib/spam";

interface DriveOption {
  id: string;
  title: string;
  festival: string;
  status: string;
}

interface ShiftLive {
  key: string;
  activityTitle: string;
  dayChip: string;
  timeLabel: string;
  capacity: number | null;
  signedUp: number;
  spotsLeft: number | null;
}

interface ActivityLive {
  id: string;
  title: string;
  shifts: ShiftLive[];
}

interface DriveLive {
  id: string;
  title: string;
  datesLabel: string;
  volunteerCount: number;
  activities: ActivityLive[];
}

interface Signup {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  location: string | null;
  occupation: string | null;
  shiftKeys: string[];
  notes: string | null;
  status: string;
  createdAt: string;
}

function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface VolunteersConsoleProps {
  userEmail: string;
}

export default function VolunteersConsole({ userEmail }: VolunteersConsoleProps) {
  const router = useRouter();
  const [drives, setDrives] = useState<DriveOption[]>([]);
  const [drive, setDrive] = useState<DriveLive | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState<string>("");
  const [search, setSearch] = useState("");
  const [purging, setPurging] = useState(false);

  const fetchSignups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDrive) params.set("driveId", selectedDrive);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/volunteers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSignups(data.signups);
        setDrive(data.drive);
        setDrives(data.drives);
        if (!selectedDrive && data.drive) setSelectedDrive(data.drive.id);
      }
    } catch {
      toast.error("Failed to load volunteer signups");
    } finally {
      setLoading(false);
    }
  }, [selectedDrive, search]);

  useEffect(() => {
    fetchSignups();
  }, [fetchSignups]);

  /** shift key → display label, from the drive's live config. */
  const shiftLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of drive?.activities ?? []) {
      for (const s of a.shifts) {
        map.set(s.key, `${s.activityTitle} · ${s.dayChip} · ${s.timeLabel}`);
      }
    }
    return (key: string) => map.get(key) ?? key;
  }, [drive]);

  const confirmed = signups.filter((s) => s.status === "confirmed");
  const shiftSlots = confirmed.reduce((n, s) => n + s.shiftKeys.length, 0);
  const allShifts = useMemo(() => (drive?.activities ?? []).flatMap((a) => a.shifts), [drive]);
  const cappedShifts = allShifts.filter((s) => s.capacity != null);
  const filledCapacity = cappedShifts.reduce((n, s) => n + Math.min(s.signedUp, s.capacity ?? 0), 0);
  const totalCapacity = cappedShifts.reduce((n, s) => n + (s.capacity ?? 0), 0);

  const spamCandidates = signups.filter(
    (s) => s.status === "confirmed" && isSpamRegistration(s.name, s.email),
  );

  async function deleteSignups(ids: string[], confirmText: string) {
    if (ids.length === 0) return;
    if (!window.confirm(confirmText)) return;
    setPurging(true);
    try {
      const res = await fetch("/api/admin/volunteers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String(result.error || ""));
      toast.success(
        `Removed ${result.purged} signup${result.purged === 1 ? "" : "s"} (${result.sheetRows} sheet row${result.sheetRows === 1 ? "" : "s"})`,
        { duration: 5000 },
      );
      fetchSignups();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Delete failed — try again");
    } finally {
      setPurging(false);
    }
  }

  function purgeSpam() {
    const preview = spamCandidates
      .slice(0, 12)
      .map((s) => `• ${s.name} — ${s.email}`)
      .join("\n");
    deleteSignups(
      spamCandidates.map((s) => s.id),
      `Delete ${spamCandidates.length} spam-looking signup${spamCandidates.length === 1 ? "" : "s"} AND their Google Sheet rows?\n\n${preview}${spamCandidates.length > 12 ? "\n…" : ""}`,
    );
  }

  function exportCsv() {
    const header = "Name,Email,Mobile,WhatsApp,Location,Working / Student,Shifts,Notes,Status,Signed Up\n";
    const rows = signups.map((s) =>
      [
        `"${s.name.replace(/"/g, '""')}"`,
        s.email,
        s.phone,
        s.whatsapp || "",
        `"${(s.location || "").replace(/"/g, '""')}"`,
        `"${(s.occupation || "").replace(/"/g, '""')}"`,
        `"${s.shiftKeys.map(shiftLabel).join("; ").replace(/"/g, '""')}"`,
        `"${(s.notes || "").replace(/"/g, '""')}"`,
        s.status,
        formatDatetime(s.createdAt),
      ].join(","),
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gitalife-volunteers-${selectedDrive || "drive"}-${new Date().toISOString().split("T")[0]}.csv`;
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
            <span className="text-white/40">/ Admin / Volunteers</span>
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
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Volunteers", value: drive?.volunteerCount ?? confirmed.length, color: "#E8751A" },
            { label: "Shift Signups", value: shiftSlots, color: "#D4A843" },
            {
              label: "Capacity Filled",
              value: totalCapacity > 0 ? `${filledCapacity}/${totalCapacity}` : "—",
              color: "#2D8F4E",
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-[#0c0c20]/60 p-4">
              <p className="text-xs uppercase tracking-wider text-white/40">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: stat.color }}>
                {loading ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ---- Filters ---- */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:border-[#E8751A]/50 focus:outline-none"
          >
            {drives.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#0c0c20]">
                {d.festival} — {d.title} ({d.status})
              </option>
            ))}
          </select>

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
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-[#E8751A]/50 focus:outline-none"
            />
          </div>

          {spamCandidates.length > 0 && (
            <button
              onClick={purgeSpam}
              disabled={purging}
              className="whitespace-nowrap rounded-lg border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              {purging ? "Purging…" : `🧹 Purge spam (${spamCandidates.length})`}
            </button>
          )}

          <button
            onClick={exportCsv}
            disabled={signups.length === 0}
            className="whitespace-nowrap rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
          >
            Export CSV
          </button>
        </div>

        {/* ---- Shift fill board ---- */}
        {drive && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drive.activities.map((activity) => (
              <div key={activity.id} className="rounded-xl border border-white/[0.06] bg-[#0c0c20]/40 p-4">
                <p className="text-sm font-bold text-white/90">{activity.title}</p>
                <ul className="mt-3 space-y-2.5">
                  {activity.shifts.map((s) => {
                    const pct =
                      s.capacity != null && s.capacity > 0
                        ? Math.min(100, Math.round((s.signedUp / s.capacity) * 100))
                        : null;
                    return (
                      <li key={s.key}>
                        <div className="flex items-baseline justify-between gap-2 text-xs">
                          <span className="text-white/60">
                            {s.dayChip} · {s.timeLabel}
                          </span>
                          <span className={s.spotsLeft === 0 ? "font-bold text-emerald-400" : "text-white/40"}>
                            {s.capacity != null ? `${s.signedUp}/${s.capacity}` : `${s.signedUp}`}
                          </span>
                        </div>
                        {pct != null && (
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: pct >= 100 ? "#2D8F4E" : pct >= 60 ? "#D4A843" : "#E8751A",
                              }}
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ---- Signup table ---- */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0c0c20]/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-white/30">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Shifts</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium">Signed Up</th>
                <th className="px-4 py-3 font-medium" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-white/30">
                    Loading signups...
                  </td>
                </tr>
              ) : signups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-white/30">
                    {search ? "No signups match your search." : "No signups yet for this drive."}
                  </td>
                </tr>
              ) : (
                signups.map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 align-top font-medium text-white/90">{s.name}</td>
                    <td className="px-4 py-3 align-top text-xs">
                      <a href={`mailto:${s.email}`} className="block text-white/60 transition-colors hover:text-[#E8751A]">
                        {s.email}
                      </a>
                      <span className="mt-0.5 block text-white/40">{s.phone}</span>
                      {s.whatsapp && <span className="mt-0.5 block text-white/30">WA: {s.whatsapp}</span>}
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      <span className="block max-w-[130px] truncate text-white/60">{s.location || "—"}</span>
                      {s.occupation && (
                        <span className="mt-1 inline-block rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
                          {s.occupation === "Working professional" ? "Working" : s.occupation}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex max-w-[320px] flex-wrap gap-1.5">
                        {s.shiftKeys.map((key) => (
                          <span
                            key={key}
                            className="rounded-full bg-white/[0.06] px-2 py-1 text-[10.5px] leading-tight text-white/70"
                          >
                            {shiftLabel(key)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 align-top text-xs text-white/40">
                      {s.notes || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-white/40">
                      {formatDatetime(s.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        onClick={() =>
                          deleteSignups(
                            [s.id],
                            `Remove ${s.name} (${s.email}) from this drive AND their Google Sheet rows?`,
                          )
                        }
                        disabled={purging}
                        className="text-xs text-white/30 transition-colors hover:text-red-400 disabled:opacity-40"
                        title="Remove signup"
                      >
                        ✕
                      </button>
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
