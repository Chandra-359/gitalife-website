"use client";

/**
 * QrScanner — full-screen continuous ticket scanner for the door.
 *
 * Runs the phone camera in the browser (no app needed), decodes QR
 * frames with jsQR, and hands each token to the parent via onScan. The
 * verdict flashes big and color-coded (green in / amber already in /
 * red invalid), vibrates where supported, then scanning auto-resumes for
 * the next guest. The same physical code is ignored for a few seconds so
 * one ticket held up to the camera doesn't fire twice.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface ScanVerdict {
  kind: "ok" | "already" | "invalid" | "error";
  name?: string;
  guests?: number;
  checkedInAt?: string;
}

/** Accept both the full check-in URL from the email QR and a bare token. */
function extractToken(data: string): string | null {
  const text = data.trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    const fromParam = url.searchParams.get("scan");
    if (fromParam) return fromParam;
  } catch {
    /* not a URL — treat as a raw token */
  }
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(text) ? text : null;
}

const VERDICT_STYLE: Record<ScanVerdict["kind"], { bg: string; border: string }> = {
  ok: { bg: "rgba(16,110,66,0.92)", border: "#34d399" },
  already: { bg: "rgba(120,84,10,0.94)", border: "#fbbf24" },
  invalid: { bg: "rgba(127,29,29,0.94)", border: "#f87171" },
  error: { bg: "rgba(60,60,70,0.94)", border: "#9ca3af" },
};

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function QrScanner({
  onScan,
  onClose,
}: {
  onScan: (token: string) => Promise<ScanVerdict>;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);
  const lastRef = useRef<{ token: string; at: number } | null>(null);
  const [verdict, setVerdict] = useState<ScanVerdict | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleDecoded = useCallback(
    async (raw: string) => {
      const token = extractToken(raw);
      const now = Date.now();
      if (!token || busyRef.current) return;
      // Same code still in front of the camera — don't re-fire
      if (lastRef.current && lastRef.current.token === token && now - lastRef.current.at < 5000) return;
      busyRef.current = true;
      lastRef.current = { token, at: now };
      const result = await onScan(token);
      setVerdict(result);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(result.kind === "ok" ? 90 : result.kind === "already" ? [90, 70, 90] : 260);
      }
      // Show the verdict, then resume scanning for the next guest
      setTimeout(() => {
        setVerdict(null);
        busyRef.current = false;
      }, result.kind === "ok" ? 2200 : 3200);
    },
    [onScan],
  );

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const { default: jsQR } = await import("jsqr");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        timer = setInterval(() => {
          if (!video.videoWidth || busyRef.current) return;
          // Decode at a capped resolution — plenty for a phone-screen QR
          const scale = Math.min(1, 720 / video.videoWidth);
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" });
          if (code?.data) handleDecoded(code.data);
        }, 200);
      } catch (error) {
        console.error("Camera failed:", error);
        if (!cancelled)
          setCameraError(
            "Couldn't open the camera. Allow camera access for this site in your browser settings, then try again.",
          );
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [handleDecoded]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />

      {/* framing guide */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-60 w-60 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
      </div>

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <p className="rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white">
          Point at a guest&rsquo;s QR ticket
        </p>
        <button
          onClick={onClose}
          className="rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-black/80"
        >
          ✕ Close
        </button>
      </div>

      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 p-8 text-center">
          <div>
            <p className="text-base font-bold text-white">{cameraError}</p>
            <button onClick={onClose} className="mt-5 rounded-full bg-white/15 px-6 py-2.5 text-sm font-bold text-white">
              Back to the list
            </button>
          </div>
        </div>
      )}

      {verdict && (
        <div
          className="absolute inset-0 flex items-center justify-center p-6"
          style={{ background: VERDICT_STYLE[verdict.kind].bg }}
        >
          <div className="text-center">
            <p className="text-6xl">{verdict.kind === "ok" ? "✓" : verdict.kind === "already" ? "⚠️" : "✕"}</p>
            <p className="mt-4 text-3xl font-extrabold text-white">
              {verdict.kind === "ok" && (verdict.name ?? "Checked in")}
              {verdict.kind === "already" && (verdict.name ?? "Already in")}
              {verdict.kind === "invalid" && "Not a valid ticket"}
              {verdict.kind === "error" && "Scan failed — try again"}
            </p>
            <p className="mt-2 text-lg font-semibold text-white/90">
              {verdict.kind === "ok" &&
                (verdict.guests && verdict.guests > 1 ? `Party of ${verdict.guests} — all in ✓` : "Checked in ✓")}
              {verdict.kind === "already" &&
                `Already checked in${verdict.checkedInAt ? ` at ${timeOf(verdict.checkedInAt)}` : ""} — send them to a volunteer`}
              {verdict.kind === "invalid" && "Check them in by name from the list"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
