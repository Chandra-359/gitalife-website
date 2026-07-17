"use client";

/**
 * LiteYouTube — click-to-load YouTube facade.
 *
 * Renders only the video thumbnail (i.ytimg.com) with a play button;
 * the privacy-friendly youtube-nocookie iframe is injected on tap.
 * Zero third-party JS until the visitor actually wants to listen, and
 * the fixed 16:9 box means no layout shift when the player loads.
 */

import { useState } from "react";

export default function LiteYouTube({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: "16 / 9", background: "#0D0804", border: "1px solid var(--bc3-line)" }}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {/* warm poster shows through if the thumbnail can't load */}
          <span
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(201,162,72,0.18), transparent 65%), linear-gradient(180deg, #2A1B10, #160D06)" }}
            aria-hidden
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail, not an optimizable asset */}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {/* warm scrim so the play button and title read */}
          <span
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(16,10,5,0.15), rgba(16,10,5,0.55) 78%, rgba(16,10,5,0.8))" }}
            aria-hidden
          />
          {/* play button */}
          <span
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 sm:h-[72px] sm:w-[72px]"
            style={{
              background: "linear-gradient(135deg, #E8873C, var(--saffron))",
              boxShadow: "0 10px 34px -8px rgba(217,105,26,0.7)",
              color: "#241205",
            }}
            aria-hidden
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          </span>
          <span className="absolute inset-x-0 bottom-0 p-4 text-left text-[13.5px] font-semibold text-white sm:p-5">{title}</span>
        </button>
      )}
    </div>
  );
}
