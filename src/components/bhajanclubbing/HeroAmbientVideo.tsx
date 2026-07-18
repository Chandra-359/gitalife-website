"use client";

/**
 * HeroAmbientVideo — muted, looping kirtan video behind the hero
 * (radhikadas.com pattern), desktop-only.
 *
 * The youtube-nocookie iframe mounts ~1s after hydration so it never
 * competes with the hero for first paint, is skipped entirely for
 * prefers-reduced-motion users, and sits under a warm umber overlay so
 * headline/CTA legibility is unchanged. If the embed fails to load the
 * static candlelit gradient simply shows through.
 *
 * A small speaker button (bottom-right of the hero) unmutes the kirtan
 * audio via the YouTube iframe postMessage API — autoplay policies
 * require starting muted.
 */

import { useEffect, useRef, useState } from "react";
import { HERO_MEDIA } from "@/data/bhajanClubbing";

function ytCommand(iframe: HTMLIFrameElement | null, func: "mute" | "unMute") {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
}

export default function HeroAmbientVideo() {
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setReady(true), 1000);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;

  const src =
    `https://www.youtube-nocookie.com/embed/${HERO_MEDIA.youtubeId}` +
    `?autoplay=1&mute=1&loop=1&playlist=${HERO_MEDIA.youtubeId}` +
    `&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`;

  return (
    <>
      {/* video layer — decorative, desktop only */}
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden>
        <iframe
          ref={iframeRef}
          src={src}
          title=""
          tabIndex={-1}
          allow="autoplay; encrypted-media"
          onLoad={() => setLoaded(true)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
          style={{
            // 16:9 cover: always at least as wide AND as tall as the hero
            width: "max(100vw, 177.78svh)",
            height: "max(100svh, 56.25vw)",
            border: 0,
            opacity: loaded ? 1 : 0,
          }}
        />
        {/* warm umber overlay keeps the candlelit look and text contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(16,10,5,0.78) 0%, rgba(25,16,9,0.62) 40%, rgba(25,16,9,0.7) 70%, rgba(36,24,17,0.9) 100%)",
          }}
        />
      </div>

      {/* sound toggle — the only interactive part of the layer */}
      <button
        type="button"
        onClick={() => {
          const next = !muted;
          setMuted(next);
          ytCommand(iframeRef.current, next ? "mute" : "unMute");
        }}
        aria-label={muted ? "Turn hero video sound on" : "Mute hero video sound"}
        aria-pressed={!muted}
        className="bc3-btn-ghost absolute bottom-6 right-6 z-20 hidden h-11 w-11 cursor-pointer items-center justify-center rounded-full md:flex"
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 5 6 9H2v6h4l5 4V5Z" />
            <path d="m22 9-6 6" />
            <path d="m16 9 6 6" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 5 6 9H2v6h4l5 4V5Z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9.5 9.5 0 0 1 0 13" />
          </svg>
        )}
      </button>
    </>
  );
}
