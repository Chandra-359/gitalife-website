"use client";

/**
 * FestivalsConsole — create and run dated events (/festival).
 *
 * One place for the monthly Youth Festival, big festivals, and
 * volunteer crews: create an event with a date, poster, and details;
 * publish it; duplicate last month's edition for the next one; and
 * watch registrations come in. Talks to the existing /api/programs
 * CRUD endpoints — an event is a Program row with eventStartAt set.
 *
 * All times are entered as Eastern (New York) wall-clock times and
 * converted to UTC instants client-side, so an admin editing from any
 * timezone gets the same result.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FESTIVAL_CATEGORIES, type FestivalEventLive } from "@/data/festivals";
import UploadButton, { adminToastStyle as toastStyle } from "./UploadButton";

interface FestivalsConsoleProps {
  events: FestivalEventLive[];
}

/* ------------------------------------------------------------------ */
/*  Eastern-time helpers (browser-safe)                                */
/* ------------------------------------------------------------------ */
const ET = "America/New_York";

function etOffsetMs(at: Date): number {
  const label =
    new Intl.DateTimeFormat("en-US", { timeZone: ET, timeZoneName: "longOffset" })
      .formatToParts(at)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT-05:00";
  const m = label.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return -5 * 3600_000;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3] ?? "0", 10)) * 60_000;
}

/** "2026-08-15" + "18:00" (ET wall time) → UTC ISO string */
function etToIso(dateStr: string, timeStr: string): string | null {
  const dm = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const tm = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!dm || !tm) return null;
  const [y, mo, d] = [parseInt(dm[1]), parseInt(dm[2]), parseInt(dm[3])];
  const [h, mi] = [parseInt(tm[1]), parseInt(tm[2])];
  let guess = Date.UTC(y, mo - 1, d, h, mi);
  for (let i = 0; i < 2; i++) {
    guess = Date.UTC(y, mo - 1, d, h, mi) - etOffsetMs(new Date(guess));
  }
  return new Date(guess).toISOString();
}

/** UTC ISO → { date: "2026-08-15", time: "18:00" } in ET */
function isoToEt(iso: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ET,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour") === "24" ? "00" : get("hour")}:${get("minute")}`,
  };
}

function weekdayEt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: ET, weekday: "long" }).format(new Date(iso));
}

function addMonthEt(dateStr: string): string {
  const [y, mo, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  const next = new Date(Date.UTC(y, mo, Math.min(d, 28), 12));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Draft model                                                        */
/* ------------------------------------------------------------------ */
interface Draft {
  title: string;
  category: string;
  description: string;
  date: string;      // ET
  startTime: string; // ET
  endTime: string;   // ET
  venueName: string;
  address: string;
  capacity: string;
  highlights: string; // one per line
  imageUrl: string;
  galleryUrls: string[];
  videoUrl: string;
  status: string;
}

const EMPTY_DRAFT: Draft = {
  title: "",
  category: "Youth Festival",
  description: "",
  date: "",
  startTime: "18:00",
  endTime: "21:00",
  venueName: "ISKCON Brooklyn Temple",
  address: "305 Schermerhorn Street, Brooklyn, NY 11217",
  capacity: "",
  highlights: "",
  imageUrl: "",
  galleryUrls: [],
  videoUrl: "",
  status: "published",
};

function draftFromEvent(e: FestivalEventLive): Draft {
  const start = isoToEt(e.startAt);
  const end = isoToEt(e.endAt);
  return {
    title: e.title,
    category: e.category,
    description: e.description,
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    venueName: e.venueName,
    address: e.address,
    capacity: e.capacity != null ? String(e.capacity) : "",
    highlights: e.highlights.join("\n"),
    imageUrl: e.posterUrl ?? "",
    galleryUrls: e.galleryUrls,
    videoUrl: e.videoUrl ?? "",
    status: e.status,
  };
}

function draftToPayload(d: Draft): Record<string, unknown> | { error: string } {
  if (!d.title.trim()) return { error: "Title is required" };
  if (!d.description.trim()) return { error: "Description is required" };
  const eventStartAt = etToIso(d.date, d.startTime);
  const eventEndAt = etToIso(d.date, d.endTime);
  if (!eventStartAt || !eventEndAt) return { error: "A valid date and start/end time are required" };
  return {
    title: d.title.trim(),
    category: d.category,
    description: d.description.trim(),
    type: "festival",
    dayOfWeek: weekdayEt(eventStartAt),
    time: undefined,
    eventStartAt,
    eventEndAt,
    venueName: d.venueName.trim(),
    address: d.address.trim(),
    // Program rows require coordinates; default to the Brooklyn temple.
    latitude: 40.6885,
    longitude: -73.9825,
    capacity: d.capacity.trim() ? parseInt(d.capacity, 10) : null,
    whatToExpect: d.highlights.split("\n").map((l) => l.trim()).filter(Boolean),
    imageUrl: d.imageUrl.trim(),
    galleryUrls: d.galleryUrls,
    videoUrl: d.videoUrl.trim(),
    status: d.status,
  };
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-orange-400/50";
const labelCls = "mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/40";

/* ------------------------------------------------------------------ */
/*  Draft editor (shared by create + edit)                             */
/* ------------------------------------------------------------------ */
function DraftEditor({
  draft,
  setDraft,
  slug,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  slug: string;
}) {
  const [urlToAdd, setUrlToAdd] = useState("");
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Event title</label>
          <input value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="August Youth Festival / Ratha Yatra 2026" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Kind</label>
            <select value={draft.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
              {FESTIVAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={draft.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
              <option value="published">Published</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Starts (ET)</label>
            <input type="time" value={draft.startTime} onChange={(e) => set("startTime", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Ends (ET)</label>
            <input type="time" value={draft.endTime} onChange={(e) => set("endTime", e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Venue</label>
          <input value={draft.venueName} onChange={(e) => set("venueName", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Address</label>
          <input value={draft.address} onChange={(e) => set("address", e.target.value)} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Capacity <span className="normal-case tracking-normal">(blank = unlimited)</span></label>
            <input type="number" min="1" value={draft.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 200" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelCls}>Description</label>
          <textarea rows={3} value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="What is this gathering, in two sentences?" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Highlights (one per line)</label>
          <textarea rows={3} value={draft.highlights} onChange={(e) => set("highlights", e.target.value)} placeholder={"Opening kirtan\nFireside talk\nPacked prasadam"} className={inputCls} />
        </div>

        <div>
          <span className={labelCls}>Poster</span>
          {draft.imageUrl && (
            <div className="relative mb-2 overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={draft.imageUrl} alt="Poster preview" className="max-h-56 w-full object-cover" />
              <button type="button" onClick={() => set("imageUrl", "")} className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white hover:bg-black">
                Remove
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <UploadButton label="Upload poster" prefix={`festivals/${slug}/posters`} accept="image/*" onUploaded={(url) => set("imageUrl", url)} />
            <input value={draft.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="…or paste an image URL" className={`${inputCls} min-w-[160px] flex-1`} />
          </div>
        </div>

        <div>
          <span className={labelCls}>Photos (shown after the event)</span>
          {draft.galleryUrls.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {draft.galleryUrls.map((url) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Gallery item" className="h-16 w-24 rounded-lg border border-white/10 object-cover" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => set("galleryUrls", draft.galleryUrls.filter((u) => u !== url))}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white hover:bg-red-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <UploadButton label="Upload photo" prefix={`festivals/${slug}/gallery`} accept="image/*" onUploaded={(url) => set("galleryUrls", [...draft.galleryUrls, url])} />
            <input value={urlToAdd} onChange={(e) => setUrlToAdd(e.target.value)} placeholder="…or paste a photo URL" className={`${inputCls} min-w-[140px] flex-1`} />
            <button
              type="button"
              onClick={() => {
                const url = urlToAdd.trim();
                if (!url) return;
                set("galleryUrls", [...draft.galleryUrls, url]);
                setUrlToAdd("");
              }}
              className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white hover:bg-white/[0.12]"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className={labelCls}>Highlight video</label>
          <div className="flex flex-wrap items-center gap-2">
            <UploadButton label="Upload video" prefix={`festivals/${slug}/videos`} accept="video/*" onUploaded={(url) => set("videoUrl", url)} />
            <input value={draft.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="…or paste a YouTube / video URL" className={`${inputCls} min-w-[160px] flex-1`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Existing event card                                                */
/* ------------------------------------------------------------------ */
function EventRow({ event, onChanged }: { event: FestivalEventLive; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => draftFromEvent(event));
  const [busy, setBusy] = useState(false);
  const isPast = new Date(event.startAt).getTime() < Date.now();

  async function call(method: "PUT" | "DELETE", body?: unknown) {
    const res = await fetch(`/api/programs/${event.id}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error || "Request failed");
    }
  }

  async function saveEdit() {
    const payload = draftToPayload(draft);
    if ("error" in payload) return void toast.error(payload.error as string);
    setBusy(true);
    try {
      await call("PUT", payload);
      toast.success("Event updated", toastStyle);
      setEditing(false);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish() {
    setBusy(true);
    try {
      await call("PUT", { status: event.status === "published" ? "draft" : "published" });
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function duplicate() {
    const d = draftFromEvent(event);
    const payload = draftToPayload({ ...d, date: addMonthEt(d.date), status: "draft", galleryUrls: [], videoUrl: "" });
    if ("error" in payload) return void toast.error(payload.error as string);
    setBusy(true);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Duplicate failed");
      toast.success("Duplicated one month out (as draft)", toastStyle);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duplicate failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${event.title}"? This also deletes its ${event.registeredCount} registrations.`)) return;
    setBusy(true);
    try {
      await call("DELETE");
      toast.success("Event deleted", toastStyle);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  }

  return (
    <section className={`rounded-2xl border border-white/[0.08] bg-[#0c0c20]/80 p-5 ${isPast ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {event.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.posterUrl} alt="" className="h-12 w-16 rounded-lg border border-white/10 object-cover" />
          ) : (
            <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-white/10 text-lg" aria-hidden>
              🎪
            </div>
          )}
          <div>
            <h3 className="font-bold text-white">
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: event.accent }} />
              {event.title}
            </h3>
            <p className="mt-0.5 text-xs text-white/40">
              {event.dateLabel} · {event.timeLabel} · {event.category}
              {isPast ? " · past" : ""} ·{" "}
              <span className={event.status === "published" ? "text-emerald-400" : "text-amber-400"}>
                {event.status}
              </span>{" "}
              · {event.registeredCount} registered
              {event.capacity != null ? ` / ${event.capacity}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setEditing((v) => !v)} disabled={busy} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5">
            {editing ? "Close" : "Edit"}
          </button>
          <button onClick={togglePublish} disabled={busy} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5">
            {event.status === "published" ? "Unpublish" : "Publish"}
          </button>
          <button onClick={duplicate} disabled={busy} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5" title="Copy this event one month out — perfect for the monthly festival">
            Duplicate +1 mo
          </button>
          <button onClick={remove} disabled={busy} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10">
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-5 border-t border-white/[0.06] pt-5">
          <DraftEditor draft={draft} setDraft={setDraft} slug={event.id} />
          <button onClick={saveEdit} disabled={busy} className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Console                                                            */
/* ------------------------------------------------------------------ */
export default function FestivalsConsole({ events }: FestivalsConsoleProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);

  const { upcoming, pastEvents } = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: events.filter((e) => new Date(e.startAt).getTime() >= now),
      pastEvents: events.filter((e) => new Date(e.startAt).getTime() < now),
    };
  }, [events]);

  const refresh = () => router.refresh();

  async function create() {
    const payload = draftToPayload(draft);
    if ("error" in payload) return void toast.error(payload.error as string);
    setBusy(true);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Create failed");
      }
      toast.success(`${draft.title} created`, toastStyle);
      setDraft(EMPTY_DRAFT);
      setCreating(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Toaster position="top-right" />
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c20]/60 px-6 py-4 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-bold">Festivals &amp; Gatherings</h1>
          <p className="text-xs text-white/40">
            Youth festivals, big festivals, volunteer crews — create, publish, duplicate.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreating((v) => !v)}
            className="rounded-lg border border-[#E8751A]/40 bg-[#E8751A]/10 px-4 py-2 text-sm font-semibold text-[#E8751A] hover:bg-[#E8751A]/20"
          >
            {creating ? "Close" : "+ New event"}
          </button>
          <Link href="/admin" className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/[0.06]">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {creating && (
          <section className="rounded-2xl border border-[#E8751A]/25 bg-[#0c0c20]/80 p-6">
            <h2 className="mb-5 text-base font-bold text-white">New event</h2>
            <DraftEditor draft={draft} setDraft={setDraft} slug="new" />
            <button onClick={create} disabled={busy} className="mt-5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
              {busy ? "Creating…" : draft.status === "published" ? "Create & publish" : "Create draft"}
            </button>
          </section>
        )}

        {events.length === 0 && !creating && (
          <p className="rounded-2xl border border-white/[0.08] bg-[#0c0c20]/60 p-8 text-center text-sm text-white/50">
            No events yet. Hit <strong className="text-white/80">+ New event</strong> to
            schedule the next Youth Festival, a Ratha Yatra, or a volunteer crew.
          </p>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Upcoming</h2>
            {upcoming.map((e) => (
              <EventRow key={e.id} event={e} onChanged={refresh} />
            ))}
          </>
        )}

        {pastEvents.length > 0 && (
          <>
            <h2 className="pt-4 text-xs font-bold uppercase tracking-[0.2em] text-white/40">Past</h2>
            {pastEvents.map((e) => (
              <EventRow key={e.id} event={e} onChanged={refresh} />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
