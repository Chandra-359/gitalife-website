"use client";

/**
 * ListenSection — hear the sound before you buy. A featured kirtan
 * video behind a click-to-load facade, plus a soft CTA to the YouTube
 * channel. Videos live in MEDIA (src/data/bhajanClubbing.ts).
 */

import { motion } from "framer-motion";
import { MEDIA } from "@/data/bhajanClubbing";
import LiteYouTube from "./LiteYouTube";

export default function ListenSection() {
  return (
    <section id="listen" className="relative mx-auto max-w-3xl scroll-mt-20 px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <p className="bc3-eyebrow">{MEDIA.eyebrow}</p>
        <h2 className="bc3-display mt-4 text-[28px] leading-[1.1] text-white sm:text-[38px]">
          Hear it <span className="bc3-headline-warm">before you feel it</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-relaxed" style={{ color: "var(--bc3-ink-dim)" }}>
          {MEDIA.blurb}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay: 0.08 }}
        className="mt-10 space-y-5"
      >
        {MEDIA.videos.map((video) => (
          <LiteYouTube key={video.id} id={video.id} title={video.title} />
        ))}
      </motion.div>

      <div className="mt-7 text-center">
        <a
          href={MEDIA.channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bc3-btn-ghost inline-flex items-center gap-2 rounded-full px-7 py-3 text-[13px] font-semibold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M23 7.6a3 3 0 0 0-2.1-2.2C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.6 32.6 32.6 0 0 0 .5 12 32.6 32.6 0 0 0 1 16.4a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A32.6 32.6 0 0 0 23.5 12 32.6 32.6 0 0 0 23 7.6ZM9.7 15.1V8.9l6 3.1-6 3.1Z" />
          </svg>
          More on YouTube
        </a>
      </div>
    </section>
  );
}
