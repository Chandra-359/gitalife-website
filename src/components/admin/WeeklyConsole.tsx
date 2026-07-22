"use client";

/**
 * WeeklyConsole — the program owner's weekly cockpit.
 *
 * One card per weekly program with exactly the fields that change every
 * week: topic, Gita reference, speaker, poster, session photos/videos.
 * Poster and gallery accept direct file uploads (Vercel Blob via
 * /api/admin/upload) and fall back to paste-a-URL when storage isn't
 * configured. Saves via the existing PUT /api/programs/[id].
 */

import { useRef, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import type { WeeklyProgramLive } from "@/lib/weeklyPrograms";

interface WeeklyConsoleProps {
  programs: WeeklyProgramLive[];
}

interface Draft {
  lectureTopic: string;
  gitaReference: string;
  speakerName: string;
  speakerTitle: string;
  imageUrl: string;
  galleryUrls: string[];
  videoUrl: string;
}

const toastStyle = {
  style: { background: "#0c0c20", color: "#fff", border: "1px solid rgba(232,117,26,0.3)" },
  iconTheme: { primary: "#E8751A", secondary: "#fff" },
};

function draftFrom(p: WeeklyProgramLive): Draft {
  return {
    lectureTopic: p.lectureTopic ?? "",
    gitaReference: p.gitaReference ?? "",
    speakerName: p.speakerName ?? "",
    speakerTitle: p.speakerTitle ?? "",
    imageUrl: p.posterUrl ?? "",
    galleryUrls: p.galleryUrls,
    videoUrl: p.videoUrl ?? "",
  };
}

/* ------------------------------------------------------------------ */
/*  Upload button — file → /api/admin/upload → URL                     */
/* ------------------------------------------------------------------ */
function UploadButton({
  label,
  prefix,
  accept,
  onUploaded,
}: {
  label: string;
  prefix: string;
  accept: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("prefix", prefix);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onUploaded(data.url);
      toast.success("Uploaded", toastStyle);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onPick} />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/[0.12] disabled:opacity-50"
      >
        {busy ? "Uploading…" : label}
      </button>
    </>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-orange-400/50";
const labelCls = "mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/40";

/* ------------------------------------------------------------------ */
/*  One program card                                                   */
/* ------------------------------------------------------------------ */
function ProgramCard({ program }: { program: WeeklyProgramLive }) {
  const [draft, setDraft] = useState<Draft>(() => draftFrom(program));
  const [saving, setSaving] = useState(false);
  const [urlToAdd, setUrlToAdd] = useState("");

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/programs/${program.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureTopic: draft.lectureTopic,
          gitaReference: draft.gitaReference,
          speakerName: draft.speakerName,
          speakerTitle: draft.speakerTitle,
          imageUrl: draft.imageUrl,
          galleryUrls: draft.galleryUrls,
          videoUrl: draft.videoUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      toast.success(`${program.name} updated — live on /programs`, toastStyle);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0c0c20]/80 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
              style={{ background: program.accent }}
            />
            {program.title}
          </h2>
          <p className="mt-0.5 text-xs text-white/40">
            {program.dayOfWeek}s · {program.timeLabel} · {program.registeredCount} registered
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save & publish"}
        </button>
      </header>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ----- This week's session ----- */}
        <div className="space-y-4">
          <div>
            <label className={labelCls} htmlFor={`${program.id}-topic`}>This week&apos;s topic</label>
            <input
              id={`${program.id}-topic`}
              value={draft.lectureTopic}
              onChange={(e) => set("lectureTopic", e.target.value)}
              placeholder="The Art of Detachment"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor={`${program.id}-ref`}>Gita reference</label>
              <input
                id={`${program.id}-ref`}
                value={draft.gitaReference}
                onChange={(e) => set("gitaReference", e.target.value)}
                placeholder="Chapter 2, Verses 47–51"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor={`${program.id}-speaker`}>Speaker</label>
              <input
                id={`${program.id}-speaker`}
                value={draft.speakerName}
                onChange={(e) => set("speakerName", e.target.value)}
                placeholder="Speaker name"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor={`${program.id}-speakertitle`}>Speaker title</label>
            <input
              id={`${program.id}-speakertitle`}
              value={draft.speakerTitle}
              onChange={(e) => set("speakerTitle", e.target.value)}
              placeholder="Monk & Educator"
              className={inputCls}
            />
          </div>

          {/* Poster */}
          <div>
            <span className={labelCls}>This week&apos;s poster</span>
            {draft.imageUrl ? (
              <div className="relative mb-2 overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.imageUrl} alt="Poster preview" className="max-h-64 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set("imageUrl", "")}
                  className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white hover:bg-black"
                >
                  Remove
                </button>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <UploadButton
                label="Upload poster"
                prefix={`programs/${program.slug}/posters`}
                accept="image/*"
                onUploaded={(url) => set("imageUrl", url)}
              />
              <input
                value={draft.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="…or paste an image URL"
                className={`${inputCls} flex-1 min-w-[180px]`}
              />
            </div>
          </div>
        </div>

        {/* ----- Media from recent sessions ----- */}
        <div className="space-y-4">
          <div>
            <span className={labelCls}>Photos from recent sessions</span>
            {draft.galleryUrls.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {draft.galleryUrls.map((url) => (
                  <div key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Gallery item"
                      className="h-20 w-28 rounded-lg border border-white/10 object-cover"
                    />
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
              <UploadButton
                label="Upload photo"
                prefix={`programs/${program.slug}/gallery`}
                accept="image/*"
                onUploaded={(url) => set("galleryUrls", [...draft.galleryUrls, url])}
              />
              <input
                value={urlToAdd}
                onChange={(e) => setUrlToAdd(e.target.value)}
                placeholder="…or paste a photo URL"
                className={`${inputCls} flex-1 min-w-[160px]`}
              />
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
            <label className={labelCls} htmlFor={`${program.id}-video`}>Highlight video</label>
            <div className="flex flex-wrap items-center gap-2">
              <UploadButton
                label="Upload video"
                prefix={`programs/${program.slug}/videos`}
                accept="video/*"
                onUploaded={(url) => set("videoUrl", url)}
              />
              <input
                id={`${program.id}-video`}
                value={draft.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="…or paste a YouTube / video URL"
                className={`${inputCls} flex-1 min-w-[180px]`}
              />
            </div>
          </div>

          <p className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-[11px] leading-relaxed text-white/40">
            Topic, reference, and speaker go out in the next weekly reminder email
            and appear in the &ldquo;This week&rsquo;s session&rdquo; card on /programs.
            Photos show in the program&rsquo;s filmstrip. Schedule &amp; venue are fixed —
            need those changed? Use the full editor.
          </p>
          <Link
            href={`/admin/programs/${program.id}/edit`}
            className="inline-block text-xs font-semibold text-orange-300 hover:underline"
          >
            Open full editor →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Console                                                            */
/* ------------------------------------------------------------------ */
export default function WeeklyConsole({ programs }: WeeklyConsoleProps) {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Toaster position="top-right" />
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c20]/60 px-6 py-4 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-bold">This Week</h1>
          <p className="text-xs text-white/40">
            Update each program&apos;s topic, poster, and media — changes go live immediately.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/[0.06]"
        >
          ← Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {programs.map((p) => (
          <ProgramCard key={p.id} program={p} />
        ))}
      </main>
    </div>
  );
}
