"use client";

/**
 * AdminDashboard — Main admin interface
 *
 * Shows:
 *  - Quick stats (total programs, upcoming, total RSVPs)
 *  - Programs table with inline status toggle, edit, delete
 *  - Navigation to RSVP management
 */

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

interface ProgramRow {
  id: string;
  title: string;
  category: string;
  type: string;
  dayOfWeek: string;
  time?: string | null;
  status: string;
  featured: boolean;
  capacity: number | null;
  rsvpCount?: number;
  _count?: { rsvps: number };
}

interface AdminDashboardProps {
  userEmail: string;
}

const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-400",
  draft: "bg-yellow-500/15 text-yellow-400",
  cancelled: "bg-red-500/15 text-red-400",
};

const TYPE_COLORS: Record<string, string> = {
  program: "bg-blue-500/15 text-blue-400",
  volunteer: "bg-emerald-500/15 text-emerald-400",
};

export default function AdminDashboard({ userEmail }: AdminDashboardProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch("/api/programs?all=true");
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch {
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  // Stats
  const totalPrograms = programs.length;
  const publishedPrograms = programs.filter((p) => p.status === "published").length;
  const totalRsvps = programs.reduce((sum, p) => sum + (p.rsvpCount ?? p._count?.rsvps ?? 0), 0);
  const volunteerEvents = programs.filter((p) => p.type === "volunteer").length;

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This will also delete all RSVPs for this program.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Program deleted", {
          style: { background: "#0c0c20", color: "#fff", border: "1px solid rgba(239,68,68,0.3)" },
        });
        setPrograms((prev) => prev.filter((p) => p.id !== id));
      } else {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        toast.error(err.error);
      }
    } catch {
      toast.error("Failed to delete program");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        setPrograms((prev) => prev.map((p) => p.id === id ? { ...p, status: next } : p));
        toast.success(`Program ${next === "published" ? "published" : "unpublished"}`, {
          style: { background: "#0c0c20", color: "#fff", border: "1px solid rgba(232,117,26,0.3)" },
          iconTheme: { primary: "#E8751A", secondary: "#fff" },
        });
      }
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      if (res.ok) {
        setPrograms((prev) => prev.map((p) => p.id === id ? { ...p, featured: !current } : p));
      }
    } catch {
      toast.error("Failed to update");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Toaster position="top-right" />

      {/* ---- Header ---- */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c20]/60 px-6 py-4 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-bold">
            Gita Life <span className="text-[#E8751A]">NYC</span>{" "}
            <span className="text-white/40">/ Admin</span>
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
        {/* ---- Stats cards ---- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Programs", value: totalPrograms, color: "#E8751A" },
            { label: "Published", value: publishedPrograms, color: "#D4A843" },
            { label: "Total RSVPs", value: totalRsvps, color: "#1A5C5E" },
            { label: "Volunteer Events", value: volunteerEvents, color: "#2D8F4E" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.06] bg-[#0c0c20]/60 p-4"
            >
              <p className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: stat.color }}>
                {loading ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ---- Programs header ---- */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold">Programs</h2>
            <p className="text-sm text-white/40">Manage all programs and volunteer events</p>
          </div>
          <button
            onClick={() => router.push("/admin/programs/new")}
            className="rounded-xl bg-[#E8751A] px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_16px_rgba(232,117,26,0.25)] transition-all hover:bg-[#d4680f] hover:shadow-[0_0_24px_rgba(232,117,26,0.35)]"
          >
            + New Program
          </button>
        </div>

        {/* ---- Programs table ---- */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0c0c20]/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-white/30">
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">RSVPs</th>
                <th className="px-4 py-3 font-medium text-center">Featured</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-white/30">
                    Loading programs...
                  </td>
                </tr>
              ) : programs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-white/30">
                    No programs yet.{" "}
                    <button onClick={() => router.push("/admin/programs/new")} className="text-[#E8751A] hover:underline">
                      Create your first program
                    </button>
                  </td>
                </tr>
              ) : (
                programs.map((p) => {
                  const rsvpCount = p.rsvpCount ?? p._count?.rsvps ?? 0;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Title + Category */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-white/90">{p.title}</p>
                        <p className="text-xs text-white/30 mt-0.5">{p.category}</p>
                      </td>

                      {/* Schedule */}
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                        {p.dayOfWeek}{p.time ? ` · ${p.time}` : ""}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TYPE_COLORS[p.type] || TYPE_COLORS.program}`}>
                          {p.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(p.id, p.status)}
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-opacity hover:opacity-80 ${STATUS_COLORS[p.status] || STATUS_COLORS.draft}`}
                        >
                          {p.status}
                        </button>
                      </td>

                      {/* RSVPs */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-white/60">
                          {rsvpCount}
                          {p.capacity ? <span className="text-white/30">/{p.capacity}</span> : ""}
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleFeatured(p.id, p.featured)}
                          className={`text-lg transition-transform hover:scale-110 ${p.featured ? "" : "opacity-20 hover:opacity-60"}`}
                          title={p.featured ? "Remove from featured" : "Mark as featured"}
                        >
                          {p.featured ? "\u2B50" : "\u2606"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/programs/${p.id}/edit`)}
                            className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            disabled={deletingId === p.id}
                            className="rounded-lg border border-red-500/20 px-2.5 py-1 text-xs text-red-400/60 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                          >
                            {deletingId === p.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
