"use client";

/**
 * AdminDashboard — Full CRUD admin interface for programs
 *
 * Features:
 *  - List all programs with edit/delete actions
 *  - Add new program form with geocoding
 *  - Edit existing programs inline
 *  - Delete with confirmation
 *  - Image URL field
 *  - RSVP URL field (link to Google Sheet)
 *  - Location (human-readable address)
 */

import { useForm } from "react-hook-form";
import { useState, useCallback, useEffect } from "react";
import { signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ProgramData {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string | null;
  latitude: number;
  longitude: number;
  date: string;
  imageUrl: string | null;
  rsvpUrl: string | null;
}

interface ProgramFormData {
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  rsvpUrl: string;
}

const CATEGORIES = [
  "Kirtan & Prasadam",
  "Retreat",
  "Wisdom Session",
  "Youth Festival",
] as const;

/* ------------------------------------------------------------------ */
/*  Mapbox Geocoding helper                                            */
/* ------------------------------------------------------------------ */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface GeocodingResult {
  place_name: string;
  center: [number, number];
}

async function geocodeAddress(query: string): Promise<GeocodingResult[]> {
  if (!MAPBOX_TOKEN || query.length < 3) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query,
  )}.json?access_token=${MAPBOX_TOKEN}&limit=5&bbox=-74.3,40.4,-73.7,41.0&types=address,poi,place`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features ?? []).map((f: { place_name: string; center: [number, number] }) => ({
    place_name: f.place_name,
    center: f.center,
  }));
}

/* ------------------------------------------------------------------ */
/*  Toast styles                                                       */
/* ------------------------------------------------------------------ */
const toastSuccess = {
  duration: 4000,
  style: { background: "#0c0c20", color: "#fff", border: "1px solid rgba(232, 117, 26, 0.3)" },
  iconTheme: { primary: "#E8751A", secondary: "#fff" },
};

const toastError = {
  style: { background: "#0c0c20", color: "#fff", border: "1px solid rgba(239, 68, 68, 0.3)" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface AdminDashboardProps {
  userEmail: string;
}

export default function AdminDashboard({ userEmail }: AdminDashboardProps) {
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  /* ---- Fetch programs ---- */
  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch("/api/programs");
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch {
      toast.error("Failed to load programs", toastError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  /* ---- Delete handler ---- */
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPrograms((prev) => prev.filter((p) => p.id !== id));
        toast.success("Program deleted", toastSuccess);
      } else {
        toast.error("Failed to delete program", toastError);
      }
    } catch {
      toast.error("Failed to delete program", toastError);
    }
    setDeleteConfirmId(null);
  };

  /* ---- Shared styles ---- */
  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#E8751A]/50 focus:outline-none focus:ring-1 focus:ring-[#E8751A]/30";
  const labelClass =
    "mb-1 block text-xs font-medium uppercase tracking-wider text-white/40";

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Toaster position="top-right" />

      {/* ---- Header ---- */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c20]/80 px-6 py-4 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-bold">
            Gita Life <span className="text-[#E8751A]">NYC</span>{" "}
            <span className="text-white/40">/ Admin</span>
          </h1>
          <p className="text-xs text-white/40">{userEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="rounded-lg bg-[#E8751A] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(232,117,26,0.2)] transition-all hover:bg-[#d4680f] hover:shadow-[0_0_20px_rgba(232,117,26,0.3)]"
          >
            + Add Program
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* ---- Form (Create / Edit) ---- */}
        {showForm && (
          <ProgramForm
            key={editingId ?? "new"}
            editingProgram={editingId ? programs.find((p) => p.id === editingId) ?? null : null}
            inputClass={inputClass}
            labelClass={labelClass}
            onCancel={() => { setShowForm(false); setEditingId(null); }}
            onSaved={() => {
              setShowForm(false);
              setEditingId(null);
              fetchPrograms();
            }}
          />
        )}

        {/* ---- Program List ---- */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Programs{" "}
            <span className="text-sm font-normal text-white/40">({programs.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E8751A] border-t-transparent" />
          </div>
        ) : programs.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <p className="text-white/40">No programs yet. Click &quot;+ Add Program&quot; to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => (
              <div
                key={program.id}
                className="group flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
              >
                {/* Color dot */}
                <div
                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                  style={{
                    background: CATEGORY_BG[program.category] ?? "#6b7280",
                    boxShadow: `0 0 8px ${CATEGORY_BG[program.category] ?? "#6b7280"}66`,
                  }}
                />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-white">{program.title}</h3>
                    <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
                      {program.category}
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-white/40">
                    {new Date(program.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {program.location && (
                      <> &middot; {program.location}</>
                    )}
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs text-white/30">
                    {program.description}
                  </p>

                  {/* Badges for image and RSVP */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {program.imageUrl && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/40">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="5.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 12l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1.2"/></svg>
                        Image
                      </span>
                    )}
                    {program.rsvpUrl && (
                      <a
                        href={program.rsvpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-[#E8751A]/10 px-2 py-0.5 text-[10px] text-[#E8751A]/80 transition-colors hover:bg-[#E8751A]/20 hover:text-[#E8751A]"
                      >
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M9 1h6v6M7 9L15 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        RSVP Sheet
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => { setEditingId(program.id); setShowForm(true); }}
                    className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {deleteConfirmId === program.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="rounded-lg bg-red-500/20 px-2 py-1 text-[10px] font-bold text-red-400 transition-colors hover:bg-red-500/30"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-lg px-2 py-1 text-[10px] text-white/40 transition-colors hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(program.id)}
                      className="rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4M6.5 7v4.5M9.5 7v4.5M3.5 4l.5 9.5a1 1 0 001 .5h6a1 1 0 001-.5L12.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category accent colors (for the list dots)                         */
/* ------------------------------------------------------------------ */
const CATEGORY_BG: Record<string, string> = {
  "Kirtan & Prasadam": "#E8751A",
  Retreat: "#D4A843",
  "Wisdom Session": "#1A5C5E",
  "Youth Festival": "#e94560",
};

/* ------------------------------------------------------------------ */
/*  ProgramForm — Create or Edit a program                             */
/* ------------------------------------------------------------------ */
interface ProgramFormProps {
  editingProgram: ProgramData | null;
  inputClass: string;
  labelClass: string;
  onCancel: () => void;
  onSaved: () => void;
}

function ProgramForm({ editingProgram, inputClass, labelClass, onCancel, onSaved }: ProgramFormProps) {
  const isEditing = !!editingProgram;
  const errorClass = "mt-1 text-xs text-red-400";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormData>({
    defaultValues: editingProgram
      ? {
          title: editingProgram.title,
          category: editingProgram.category,
          description: editingProgram.description,
          location: editingProgram.location ?? "",
          date: editingProgram.date.slice(0, 16), // "YYYY-MM-DDTHH:MM"
          latitude: String(editingProgram.latitude),
          longitude: String(editingProgram.longitude),
          imageUrl: editingProgram.imageUrl ?? "",
          rsvpUrl: editingProgram.rsvpUrl ?? "",
        }
      : {
          title: "",
          category: CATEGORIES[0],
          description: "",
          location: "",
          date: "",
          latitude: "",
          longitude: "",
          imageUrl: "",
          rsvpUrl: "",
        },
  });

  /* ---- Geocoding ---- */
  const [addressQuery, setAddressQuery] = useState(editingProgram?.location ?? "");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocodeTimeout, setGeocodeTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleAddressChange = useCallback(
    (value: string) => {
      setAddressQuery(value);
      setValue("location", value);
      if (geocodeTimeout) clearTimeout(geocodeTimeout);
      const timeout = setTimeout(async () => {
        const results = await geocodeAddress(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      }, 350);
      setGeocodeTimeout(timeout);
    },
    [geocodeTimeout, setValue],
  );

  const selectSuggestion = useCallback(
    (result: GeocodingResult) => {
      const [lng, lat] = result.center;
      setValue("longitude", lng.toFixed(6));
      setValue("latitude", lat.toFixed(6));
      setValue("location", result.place_name);
      setAddressQuery(result.place_name);
      setShowSuggestions(false);
    },
    [setValue],
  );

  /* ---- Submit ---- */
  async function onSubmit(data: ProgramFormData) {
    const payload = {
      title: data.title,
      category: data.category,
      description: data.description,
      location: data.location || null,
      date: new Date(data.date).toISOString(),
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      imageUrl: data.imageUrl || null,
      rsvpUrl: data.rsvpUrl || null,
    };

    const url = isEditing ? `/api/programs/${editingProgram!.id}` : "/api/programs";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(
        isEditing ? "Program updated!" : "Program added! It's now live on the map.",
        toastSuccess,
      );
      onSaved();
    } else {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      toast.error(err.error || `Failed to ${isEditing ? "update" : "add"} program`, toastError);
    }
  }

  return (
    <div className="mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {isEditing ? "Edit Program" : "Add New Program"}
        </h2>
        <button
          onClick={onCancel}
          className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Row: Title + Category */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              className={inputClass}
              placeholder="e.g. Sunday Kirtan at Hamilton Park"
            />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              {...register("category", { required: "Category is required" })}
              className={inputClass + " cursor-pointer"}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0c0c20] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            className={inputClass + " min-h-[80px] resize-y"}
            placeholder="A short description of the program..."
          />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label className={labelClass}>Date & Time</label>
          <input
            type="datetime-local"
            {...register("date", { required: "Date is required" })}
            className={inputClass}
          />
          {errors.date && <p className={errorClass}>{errors.date.message}</p>}
        </div>

        {/* Address geocoding */}
        <div className="relative">
          <label className={labelClass}>
            Address Lookup{" "}
            <span className="normal-case tracking-normal text-white/25">(auto-fills location & lat/lng)</span>
          </label>
          <input
            type="text"
            value={addressQuery}
            onChange={(e) => handleAddressChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className={inputClass}
            placeholder="Start typing an address in NYC..."
          />
          {showSuggestions && (
            <ul className="absolute inset-x-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#0c0c20] shadow-xl">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={() => selectSuggestion(s)}
                    className="w-full px-3 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {s.place_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Lat / Lng + Location side by side */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Latitude</label>
            <input
              type="number"
              step="any"
              {...register("latitude", {
                required: "Required",
                validate: (v) => {
                  const n = parseFloat(v);
                  return (!isNaN(n) && n >= -90 && n <= 90) || "-90 to 90";
                },
              })}
              className={inputClass}
              placeholder="40.7265"
            />
            {errors.latitude && <p className={errorClass}>{errors.latitude.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Longitude</label>
            <input
              type="number"
              step="any"
              {...register("longitude", {
                required: "Required",
                validate: (v) => {
                  const n = parseFloat(v);
                  return (!isNaN(n) && n >= -180 && n <= 180) || "-180 to 180";
                },
              })}
              className={inputClass}
              placeholder="-74.0445"
            />
            {errors.longitude && <p className={errorClass}>{errors.longitude.message}</p>}
          </div>
          <div>
            <label className={labelClass}>
              Location Label <span className="normal-case tracking-normal text-white/25">(display)</span>
            </label>
            <input
              {...register("location")}
              className={inputClass}
              placeholder="Hamilton Park, JC"
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className={labelClass}>
            Image URL{" "}
            <span className="normal-case tracking-normal text-white/25">(optional — paste any image link)</span>
          </label>
          <input
            {...register("imageUrl")}
            className={inputClass}
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        {/* RSVP URL */}
        <div>
          <label className={labelClass}>
            RSVP / Google Sheet URL{" "}
            <span className="normal-case tracking-normal text-white/25">(optional — users click RSVP to open this link)</span>
          </label>
          <input
            {...register("rsvpUrl")}
            className={inputClass}
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
          <p className="mt-1 text-[10px] text-white/25">
            Tip: Create a Google Form linked to a Sheet. Paste the Form URL here so RSVPs go straight to your Sheet.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#E8751A] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(232,117,26,0.25)] transition-all hover:bg-[#d4680f] hover:shadow-[0_0_24px_rgba(232,117,26,0.35)] disabled:opacity-50"
          >
            {isSubmitting
              ? isEditing ? "Saving..." : "Adding..."
              : isEditing ? "Save Changes" : "Add Program to Map"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
