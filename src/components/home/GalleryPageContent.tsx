"use client";

/**
 * GalleryPageContent — proper masonry gallery for photos from the community.
 *
 * Until the IG Graph API is wired up, this page pairs:
 *   - a curated static masonry of highlight moments (from /public/gallery
 *     or placeholder gradients so the layout reads even without photos)
 *   - a live Elfsight Instagram feed below, for everything else.
 *
 * Categories filter the curated grid (all | festivals | classes | kirtan | retreats).
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/data/home";
import { C, Icon } from "./icons";

type GalleryCategory = "all" | "festivals" | "classes" | "kirtan" | "retreats";

interface Photo {
  id: string;
  alt: string;
  category: Exclude<GalleryCategory, "all">;
  /** Aspect ratio used for the placeholder tile and the image container. */
  ratio: "portrait" | "square" | "landscape" | "tall";
  /** Optional src — when absent we render a warm gradient placeholder. */
  src?: string;
  /** Caption shown on hover */
  caption?: string;
}

const CATEGORIES: { key: GalleryCategory; label: string }[] = [
  { key: "all", label: "All moments" },
  { key: "festivals", label: "Festivals" },
  { key: "classes", label: "Classes" },
  { key: "kirtan", label: "Kirtan" },
  { key: "retreats", label: "Retreats" },
];

// Curated seed photos — categories + ratios are chosen to read beautifully
// in a masonry column even without real imagery behind them.
const PHOTOS: Photo[] = [
  { id: "p1", alt: "Evening kirtan at ISKCON Brooklyn", category: "kirtan", ratio: "portrait", caption: "Mangal Arati, Brooklyn" },
  { id: "p2", alt: "Monthly festival prasadam feast", category: "festivals", ratio: "landscape", caption: "April Youth Festival" },
  { id: "p3", alt: "Book distribution at NYU", category: "classes", ratio: "square", caption: "NYU book table" },
  { id: "p4", alt: "Fall foliage retreat hike", category: "retreats", ratio: "tall", caption: "Hudson Valley" },
  { id: "p5", alt: "Sunday Harinam in Union Square", category: "kirtan", ratio: "square", caption: "Union Square Harinam" },
  { id: "p6", alt: "Gita class in Newport", category: "classes", ratio: "landscape", caption: "Newport Fridays" },
  { id: "p7", alt: "Ratha Yatra parade", category: "festivals", ratio: "portrait", caption: "Ratha Yatra" },
  { id: "p8", alt: "Winter retreat snow kirtan", category: "retreats", ratio: "square", caption: "Winter retreat" },
  { id: "p9", alt: "Jersey City class circle", category: "classes", ratio: "tall", caption: "Jersey City Saturdays" },
  { id: "p10", alt: "Youth festival dance floor", category: "festivals", ratio: "landscape", caption: "Festival night" },
  { id: "p11", alt: "Mridanga drums at kirtan", category: "kirtan", ratio: "portrait", caption: "Mridanga masters" },
  { id: "p12", alt: "Catskills morning meditation", category: "retreats", ratio: "square", caption: "Catskills sunrise" },
];

// Map category → gradient seed so placeholders read as distinct categories.
function placeholderFor(p: Photo): string {
  switch (p.category) {
    case "festivals":
      return `linear-gradient(135deg, ${C.saffron} 0%, ${C.lotusPink} 100%)`;
    case "classes":
      return `linear-gradient(135deg, ${C.krishnaBlue} 0%, ${C.gold} 100%)`;
    case "kirtan":
      return `linear-gradient(135deg, ${C.krishnaDeep} 0%, ${C.saffron} 100%)`;
    case "retreats":
      return `linear-gradient(135deg, ${C.peacock} 0%, ${C.goldLight} 100%)`;
  }
}

function ratioClass(ratio: Photo["ratio"]): string {
  switch (ratio) {
    case "portrait":
      return "aspect-[4/5]";
    case "square":
      return "aspect-square";
    case "landscape":
      return "aspect-[4/3]";
    case "tall":
      return "aspect-[3/5]";
  }
}

const ELFSIGHT_APP_ID = "87b4db08-2d52-4076-a779-48fc2e1ebb51";

export default function GalleryPageContent() {
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const reduce = useReducedMotion();

  const visible = useMemo(
    () => (filter === "all" ? PHOTOS : PHOTOS.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <div className="min-h-screen surface-parchment">
      <Navbar />

      {/* ---- Header ---- */}
      <section
        className="relative pt-32 pb-14 px-6 surface-sacred texture-grain isolate overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.saffron}, ${C.gold}, transparent)`,
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="pill-chip pill-chip-gold">
            <Icon name="camera" size={12} />
            Photo Gallery
          </span>
          <h1 className="display-xl text-gradient-warm-glow mt-6">
            Moments from our community
          </h1>
          <p
            className="mt-5 max-w-xl mx-auto text-[15px] leading-[1.75]"
            style={{ color: "rgba(255,251,242,0.72)" }}
          >
            Festivals, classes, Harinam, Govinda&rsquo;s kitchen, retreats — the
            faces and stories behind Gita Life NYC.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors hover:opacity-80"
            style={{ color: C.goldLight }}
          >
            Follow @{INSTAGRAM_HANDLE}
            <Icon name="arrowRight" size={12} />
          </a>
        </div>
      </section>

      {/* ---- Filter bar ---- */}
      <div className="sticky top-[60px] z-30 px-6 py-4 backdrop-blur-xl"
        style={{ background: "rgba(255,251,242,0.82)", borderBottom: `1px solid ${C.gold}15` }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((c) => {
            const active = c.key === filter;
            return (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className="shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold transition-all"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${C.gold}, ${C.saffron})`
                    : "white",
                  color: active ? "white" : C.krishnaBlue,
                  border: active ? "1px solid transparent" : `1px solid ${C.gold}25`,
                  boxShadow: active ? "0 8px 20px -8px rgba(232,117,26,0.45)" : "none",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Curated masonry ---- */}
      <section className="relative py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="masonry">
            <AnimatePresence initial={false}>
              {visible.map((p, i) => (
                <motion.button
                  key={p.id}
                  layout={!reduce}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: (i % 12) * 0.03 }}
                  onClick={() => setLightbox(p)}
                  className={`group relative block w-full overflow-hidden rounded-2xl ${ratioClass(p.ratio)}`}
                  style={{ background: placeholderFor(p) }}
                  aria-label={`Open photo: ${p.alt}`}
                >
                  {p.src && (
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                  )}
                  {/* Subtle gradient overlay + caption on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 50%, rgba(15,27,77,0.65) 100%)",
                    }}
                  />
                  {p.caption && (
                    <div className="absolute bottom-0 inset-x-0 p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                      <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: C.goldLight }}>
                        {p.category}
                      </p>
                      <p className="text-[14px] font-medium text-white">{p.caption}</p>
                    </div>
                  )}
                  {/* Subtle corner glyph */}
                  <span
                    className="absolute top-3 right-3 h-7 w-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <Icon name="arrowRight" size={12} className="text-white" />
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {visible.length === 0 && (
            <p className="text-center text-gray-500 py-16 text-[14px]">
              No moments in this category yet. Check back soon.
            </p>
          )}
        </div>
      </section>

      {/* ---- Live Instagram feed (Elfsight) ---- */}
      <section className="relative py-20 px-6" style={{ background: C.warmBg }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="pill-chip pill-chip-saffron">
              <Icon name="camera" size={12} />
              Live Instagram Feed
            </span>
            <h2
              className="mt-4 text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              Everything we posted this week
            </h2>
          </div>

          <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
          <div
            className={`elfsight-app-${ELFSIGHT_APP_ID}`}
            data-elfsight-app-lazy
          />
        </div>
      </section>

      {/* ---- Lightbox ---- */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl"
            style={{ background: "rgba(8,14,42,0.82)" }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`relative max-w-4xl w-full rounded-3xl overflow-hidden ${ratioClass(lightbox.ratio)}`}
              style={{ background: placeholderFor(lightbox) }}
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.src && (
                <Image
                  src={lightbox.src}
                  alt={lightbox.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              )}
              <button
                onClick={() => setLightbox(null)}
                aria-label="Close"
                className="absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/20"
                style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              {lightbox.caption && (
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: C.goldLight }}>
                    {lightbox.category}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white font-serif">
                    {lightbox.caption}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Back link ---- */}
      <div className="px-6 pb-20 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold transition-colors hover:opacity-80"
          style={{ color: C.krishnaBlue, border: `1px solid ${C.gold}30` }}
        >
          <Icon name="arrowRight" size={12} className="rotate-180" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
