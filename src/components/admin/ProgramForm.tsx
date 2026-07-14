"use client";

/**
 * ProgramForm — Shared form for creating and editing programs.
 *
 * Used by:
 *  - /admin/programs/new (create mode)
 *  - /admin/programs/[id]/edit (edit mode)
 */

import { useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface ProgramFormData {
  title: string;
  category: string;
  type: string;
  description: string;
  dayOfWeek: string;
  time: string;
  latitude: string;
  longitude: string;
  address: string;
  venueName: string;
  imageUrl: string;
  videoUrl: string;
  subtitle: string;
  duration: string;
  level: string;
  capacity: string;
  status: string;
  featured: boolean;
  whyAttend: string;
  whatToBring: string;
  whatToExpect: string;
  whatYouGet: string;
  lectureTopic: string;
  gitaReference: string;
  speakerName: string;
  speakerTitle: string;
  speakerBio: string;
  speakerImageUrl: string;
  testimonial: string;
  testimonialAuthor: string;
}

const CATEGORIES = [
  "Kirtan & Prasadam",
  "Retreat",
  "Wisdom Session",
  "Youth Festival",
] as const;

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const EVENT_TYPES = [
  { value: "program", label: "Program" },
  { value: "volunteer", label: "Volunteer Event" },
] as const;

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */
/** Initial data can have arrays (from DB) or strings (already joined) */
type InitialProgramData = {
  [K in keyof ProgramFormData]?: K extends "whatToExpect" | "whatYouGet"
    ? string | string[]
    : ProgramFormData[K];
};

interface ProgramFormProps {
  mode: "create" | "edit";
  programId?: string;
  initialData?: InitialProgramData;
}

export default function ProgramForm({ mode, programId, initialData }: ProgramFormProps) {
  const router = useRouter();

  const defaults: ProgramFormData = {
    title: initialData?.title ?? "",
    category: initialData?.category ?? CATEGORIES[0],
    type: initialData?.type ?? "program",
    description: initialData?.description ?? "",
    dayOfWeek: initialData?.dayOfWeek ?? "Saturday",
    time: initialData?.time ?? "",
    latitude: initialData?.latitude?.toString() ?? "",
    longitude: initialData?.longitude?.toString() ?? "",
    address: initialData?.address ?? "",
    venueName: initialData?.venueName ?? "",
    imageUrl: initialData?.imageUrl ?? "",
    videoUrl: initialData?.videoUrl ?? "",
    subtitle: initialData?.subtitle ?? "",
    duration: initialData?.duration ?? "",
    level: initialData?.level ?? "",
    capacity: initialData?.capacity?.toString() ?? "",
    status: initialData?.status ?? "published",
    featured: initialData?.featured ?? false,
    whyAttend: initialData?.whyAttend ?? "",
    whatToBring: initialData?.whatToBring ?? "",
    whatToExpect: Array.isArray(initialData?.whatToExpect) ? initialData.whatToExpect.join("\n") : (initialData?.whatToExpect ?? ""),
    whatYouGet: Array.isArray(initialData?.whatYouGet) ? initialData.whatYouGet.join("\n") : (initialData?.whatYouGet ?? ""),
    lectureTopic: initialData?.lectureTopic ?? "",
    gitaReference: initialData?.gitaReference ?? "",
    speakerName: initialData?.speakerName ?? "",
    speakerTitle: initialData?.speakerTitle ?? "",
    speakerBio: initialData?.speakerBio ?? "",
    speakerImageUrl: initialData?.speakerImageUrl ?? "",
    testimonial: initialData?.testimonial ?? "",
    testimonialAuthor: initialData?.testimonialAuthor ?? "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormData>({ defaultValues: defaults });

  /* ---- Geocoding state ---- */
  const [addressQuery, setAddressQuery] = useState(initialData?.address ?? "");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocodeTimeout, setGeocodeTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleAddressChange = useCallback(
    (value: string) => {
      setAddressQuery(value);
      setValue("address", value);
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
      setValue("address", result.place_name);
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
      type: data.type,
      description: data.description,
      dayOfWeek: data.dayOfWeek,
      time: data.time || null,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      address: data.address || null,
      venueName: data.venueName || null,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      subtitle: data.subtitle || null,
      duration: data.duration || null,
      level: data.level || null,
      capacity: data.capacity ? parseInt(data.capacity) : null,
      status: data.status,
      featured: data.featured,
      whyAttend: data.whyAttend || null,
      whatToBring: data.whatToBring || null,
      whatToExpect: data.whatToExpect ? data.whatToExpect.split("\n").filter(Boolean) : [],
      whatYouGet: data.whatYouGet ? data.whatYouGet.split("\n").filter(Boolean) : [],
      lectureTopic: data.lectureTopic || null,
      gitaReference: data.gitaReference || null,
      speakerName: data.speakerName || null,
      speakerTitle: data.speakerTitle || null,
      speakerBio: data.speakerBio || null,
      speakerImageUrl: data.speakerImageUrl || null,
      testimonial: data.testimonial || null,
      testimonialAuthor: data.testimonialAuthor || null,
    };

    const url = mode === "edit" ? `/api/programs/${programId}` : "/api/programs";
    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(
        mode === "edit" ? "Program updated!" : "Program created!",
        { duration: 3000, style: { background: "#0c0c20", color: "#fff", border: "1px solid rgba(232,117,26,0.3)" }, iconTheme: { primary: "#E8751A", secondary: "#fff" } },
      );
      router.push("/admin");
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      toast.error(err.error || `Failed to ${mode} program`);
    }
  }

  /* ---- Shared input classes ---- */
  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#E8751A]/50 focus:outline-none focus:ring-1 focus:ring-[#E8751A]/30";
  const labelClass =
    "mb-1 block text-xs font-medium uppercase tracking-wider text-white/40";
  const errorClass = "mt-1 text-xs text-red-400";
  const sectionClass = "border-t border-white/[0.06] pt-6 mt-6";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ============================================================ */}
      {/*  CORE FIELDS                                                  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Title */}
        <div className="md:col-span-2">
          <label className={labelClass}>Title *</label>
          <input
            {...register("title", { required: "Title is required" })}
            className={inputClass}
            placeholder="e.g. Sunday Kirtan at Hamilton Park"
          />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        {/* Subtitle */}
        <div className="md:col-span-2">
          <label className={labelClass}>Subtitle <span className="normal-case tracking-normal text-white/25">(tagline)</span></label>
          <input {...register("subtitle")} className={inputClass} placeholder="e.g. Connecting through sacred sound" />
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category *</label>
          <select {...register("category", { required: true })} className={inputClass + " cursor-pointer"}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#0c0c20] text-white">{cat}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className={labelClass}>Event Type</label>
          <select {...register("type")} className={inputClass + " cursor-pointer"}>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-[#0c0c20] text-white">{t.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className={labelClass}>Description *</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            className={inputClass + " min-h-[100px] resize-y"}
            placeholder="A short description of the program..."
          />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SCHEDULE                                                     */}
      {/* ============================================================ */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-white/60 mb-4">Weekly Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Day of Week *</label>
            <select {...register("dayOfWeek", { required: "Day is required" })} className={inputClass + " cursor-pointer"}>
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day} className="bg-[#0c0c20] text-white">{day}</option>
              ))}
            </select>
            {errors.dayOfWeek && <p className={errorClass}>{errors.dayOfWeek.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Time <span className="normal-case tracking-normal text-white/25">(e.g. 6:00 PM)</span></label>
            <input {...register("time")} className={inputClass} placeholder="e.g. 6:00 PM" />
          </div>
          <div>
            <label className={labelClass}>Duration Label</label>
            <input {...register("duration")} className={inputClass} placeholder="e.g. 2.5 hours" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  LOCATION                                                     */}
      {/* ============================================================ */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-white/60 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Address geocoding */}
          <div className="md:col-span-2 relative">
            <label className={labelClass}>
              Address Lookup <span className="normal-case tracking-normal text-white/25">(auto-fills lat/lng)</span>
            </label>
            <input
              type="text"
              value={addressQuery}
              onChange={(e) => handleAddressChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className={inputClass}
              placeholder="Start typing an address..."
            />
            {showSuggestions && (
              <ul className="absolute inset-x-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#0c0c20] shadow-xl">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button type="button" onMouseDown={() => selectSuggestion(s)} className="w-full px-3 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
                      {s.place_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Venue name */}
          <div>
            <label className={labelClass}>Venue Name <span className="normal-case tracking-normal text-white/25">(friendly name)</span></label>
            <input {...register("venueName")} className={inputClass} placeholder="e.g. Hamilton Park" />
          </div>
          {/* Level */}
          <div>
            <label className={labelClass}>Level</label>
            <input {...register("level")} className={inputClass} placeholder="e.g. Beginner-friendly" />
          </div>
          {/* Lat / Lng */}
          <div>
            <label className={labelClass}>Latitude *</label>
            <input
              type="number" step="any"
              {...register("latitude", {
                required: "Latitude is required",
                validate: (v) => { const n = parseFloat(v); return (!isNaN(n) && n >= -90 && n <= 90) || "Must be -90 to 90"; },
              })}
              className={inputClass} placeholder="40.7265"
            />
            {errors.latitude && <p className={errorClass}>{errors.latitude.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Longitude *</label>
            <input
              type="number" step="any"
              {...register("longitude", {
                required: "Longitude is required",
                validate: (v) => { const n = parseFloat(v); return (!isNaN(n) && n >= -180 && n <= 180) || "Must be -180 to 180"; },
              })}
              className={inputClass} placeholder="-74.0445"
            />
            {errors.longitude && <p className={errorClass}>{errors.longitude.message}</p>}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  CAPACITY                                                     */}
      {/* ============================================================ */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-white/60 mb-4">Capacity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Max Capacity <span className="normal-case tracking-normal text-white/25">(leave empty for unlimited)</span></label>
            <input type="number" min="0" {...register("capacity")} className={inputClass} placeholder="e.g. 50" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  MEDIA                                                        */}
      {/* ============================================================ */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-white/60 mb-4">Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Hero Image URL</label>
            <input {...register("imageUrl")} className={inputClass} placeholder="https://example.com/photo.jpg" />
          </div>
          <div>
            <label className={labelClass}>Video URL <span className="normal-case tracking-normal text-white/25">(YouTube/Vimeo)</span></label>
            <input {...register("videoUrl")} className={inputClass} placeholder="https://youtube.com/watch?v=..." />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  CONTENT DETAILS                                              */}
      {/* ============================================================ */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-white/60 mb-4">Content Details</h3>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className={labelClass}>Why Attend</label>
            <textarea {...register("whyAttend")} className={inputClass + " min-h-[80px] resize-y"} placeholder="Compelling reason to attend..." />
          </div>
          <div>
            <label className={labelClass}>What to Expect <span className="normal-case tracking-normal text-white/25">(one item per line)</span></label>
            <textarea {...register("whatToExpect")} className={inputClass + " min-h-[80px] resize-y"} placeholder={"Live kirtan with mridanga\nHome-cooked packed prasadam\nGuided meditation"} />
          </div>
          <div>
            <label className={labelClass}>What You&apos;ll Get <span className="normal-case tracking-normal text-white/25">(one item per line)</span></label>
            <textarea {...register("whatYouGet")} className={inputClass + " min-h-[80px] resize-y"} placeholder={"Inner peace\nNew friendships\nFree prasadam"} />
          </div>
          <div>
            <label className={labelClass}>What to Bring</label>
            <input {...register("whatToBring")} className={inputClass} placeholder="e.g. Just yourself and an open mind!" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SPEAKER & LECTURE                                            */}
      {/* ============================================================ */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-white/60 mb-4">Speaker & Lecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Speaker Name</label>
            <input {...register("speakerName")} className={inputClass} placeholder="e.g. Radha Govind Das" />
          </div>
          <div>
            <label className={labelClass}>Speaker Title</label>
            <input {...register("speakerTitle")} className={inputClass} placeholder="e.g. Monk & Educator" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Speaker Bio</label>
            <textarea {...register("speakerBio")} className={inputClass + " min-h-[60px] resize-y"} placeholder="Short bio..." />
          </div>
          <div>
            <label className={labelClass}>Speaker Image URL</label>
            <input {...register("speakerImageUrl")} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>Lecture Topic</label>
            <input {...register("lectureTopic")} className={inputClass} placeholder="e.g. The Art of Detachment" />
          </div>
          <div>
            <label className={labelClass}>Gita Reference</label>
            <input {...register("gitaReference")} className={inputClass} placeholder="e.g. Chapter 2, Verses 47-51" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  TESTIMONIAL                                                  */}
      {/* ============================================================ */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-white/60 mb-4">Testimonial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Quote</label>
            <textarea {...register("testimonial")} className={inputClass + " min-h-[60px] resize-y"} placeholder="Past attendee quote..." />
          </div>
          <div>
            <label className={labelClass}>Author</label>
            <input {...register("testimonialAuthor")} className={inputClass} placeholder="e.g. Priya S., software engineer" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  STATUS & VISIBILITY                                          */}
      {/* ============================================================ */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-white/60 mb-4">Status & Visibility</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Status</label>
            <select {...register("status")} className={inputClass + " cursor-pointer"}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#0c0c20] text-white">{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <input
              type="checkbox"
              id="featured"
              {...register("featured")}
              className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#E8751A] focus:ring-[#E8751A]/30 cursor-pointer"
            />
            <label htmlFor="featured" className="text-sm text-white/60 cursor-pointer">
              Featured (pin to top of list)
            </label>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  ACTIONS                                                      */}
      {/* ============================================================ */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-[#E8751A] py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(232,117,26,0.25)] transition-all hover:bg-[#d4680f] hover:shadow-[0_0_24px_rgba(232,117,26,0.35)] disabled:opacity-50"
        >
          {isSubmitting
            ? (mode === "edit" ? "Updating..." : "Creating...")
            : (mode === "edit" ? "Update Program" : "Create Program")
          }
        </button>
      </div>
    </form>
  );
}
