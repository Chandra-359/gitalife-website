"use client";

/**
 * UploadButton — shared admin file-upload control.
 * Sends the picked file to /api/admin/upload (Vercel Blob) and hands
 * back the public URL. Dark-admin styled.
 */

import { useRef, useState } from "react";
import toast from "react-hot-toast";

export const adminToastStyle = {
  style: { background: "#0c0c20", color: "#fff", border: "1px solid rgba(232,117,26,0.3)" },
  iconTheme: { primary: "#E8751A", secondary: "#fff" },
};

export default function UploadButton({
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
      toast.success("Uploaded", adminToastStyle);
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
