"use client";

/**
 * AdminDashboard — The main admin interface
 *
 * Contains the "Add Program" form with:
 *  - React Hook Form for validation
 *  - Mapbox Geocoding API for address → lat/lng lookup
 *  - POST to /api/programs on submit
 *  - react-hot-toast for success/error notifications
 */

import { useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

/* ------------------------------------------------------------------ */
/*  Form field types                                                   */
/* ------------------------------------------------------------------ */
interface ProgramFormData {
  title: string;
  category: string;
  description: string;
  date: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
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
  center: [number, number]; // [lng, lat]
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface AdminDashboardProps {
  userEmail: string;
}

export default function AdminDashboard({ userEmail }: AdminDashboardProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormData>({
    defaultValues: {
      title: "",
      category: CATEGORIES[0],
      description: "",
      date: "",
      latitude: "",
      longitude: "",
      imageUrl: "",
    },
  });

  /* ---- Geocoding state ---- */
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocodeTimeout, setGeocodeTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleAddressChange = useCallback(
    (value: string) => {
      setAddressQuery(value);

      // Debounce geocoding requests by 350ms
      if (geocodeTimeout) clearTimeout(geocodeTimeout);

      const timeout = setTimeout(async () => {
        const results = await geocodeAddress(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      }, 350);

      setGeocodeTimeout(timeout);
    },
    [geocodeTimeout],
  );

  const selectSuggestion = useCallback(
    (result: GeocodingResult) => {
      const [lng, lat] = result.center;
      setValue("longitude", lng.toFixed(6));
      setValue("latitude", lat.toFixed(6));
      setAddressQuery(result.place_name);
      setShowSuggestions(false);
    },
    [setValue],
  );

  /* ---- Form submission ---- */
  async function onSubmit(data: ProgramFormData) {
    const payload = {
      title: data.title,
      category: data.category,
      description: data.description,
      date: new Date(data.date).toISOString(),
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      imageUrl: data.imageUrl || null,
    };

    const res = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("Program added! It's now live on the map.", {
        duration: 4000,
        style: {
          background: "#0c0c20",
          color: "#fff",
          border: "1px solid rgba(232, 117, 26, 0.3)",
        },
        iconTheme: { primary: "#E8751A", secondary: "#fff" },
      });
      reset();
      setAddressQuery("");
    } else {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      toast.error(err.error || "Failed to add program", {
        style: {
          background: "#0c0c20",
          color: "#fff",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        },
      });
    }
  }

  /* ---- Shared input classes ---- */
  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#E8751A]/50 focus:outline-none focus:ring-1 focus:ring-[#E8751A]/30";
  const labelClass =
    "mb-1 block text-xs font-medium uppercase tracking-wider text-white/40";
  const errorClass = "mt-1 text-xs text-red-400";

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
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          Sign Out
        </button>
      </header>

      {/* ---- Form ---- */}
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h2 className="mb-1 text-xl font-bold">Add New Program</h2>
        <p className="mb-8 text-sm text-white/50">
          Fill in the details below. The new pin will appear on the public map immediately.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div>
            <label className={labelClass}>Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              className={inputClass}
              placeholder="e.g. Sunday Kirtan at Hamilton Park"
            />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>

          {/* Category */}
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

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              {...register("description", { required: "Description is required" })}
              className={inputClass + " min-h-[100px] resize-y"}
              placeholder="A short description of the program..."
            />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="datetime-local"
              {...register("date", { required: "Date is required" })}
              className={inputClass}
            />
            {errors.date && <p className={errorClass}>{errors.date.message}</p>}
          </div>

          {/* ---- Address geocoding ---- */}
          <div className="relative">
            <label className={labelClass}>
              Address Lookup{" "}
              <span className="normal-case tracking-normal text-white/25">(auto-fills lat/lng)</span>
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

          {/* Lat / Lng side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Latitude</label>
              <input
                type="number"
                step="any"
                {...register("latitude", {
                  required: "Latitude is required",
                  validate: (v) => {
                    const n = parseFloat(v);
                    return (!isNaN(n) && n >= -90 && n <= 90) || "Must be between -90 and 90";
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
                  required: "Longitude is required",
                  validate: (v) => {
                    const n = parseFloat(v);
                    return (!isNaN(n) && n >= -180 && n <= 180) || "Must be between -180 and 180";
                  },
                })}
                className={inputClass}
                placeholder="-74.0445"
              />
              {errors.longitude && <p className={errorClass}>{errors.longitude.message}</p>}
            </div>
          </div>

          {/* Image URL (optional) */}
          <div>
            <label className={labelClass}>
              Image URL{" "}
              <span className="normal-case tracking-normal text-white/25">(optional)</span>
            </label>
            <input
              {...register("imageUrl")}
              className={inputClass}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#E8751A] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(232,117,26,0.25)] transition-all hover:bg-[#d4680f] hover:shadow-[0_0_24px_rgba(232,117,26,0.35)] disabled:opacity-50"
          >
            {isSubmitting ? "Adding Program..." : "Add Program to Map"}
          </button>
        </form>
      </main>
    </div>
  );
}
