"use client";

/**
 * InstagramWall — photo gallery section pulling from @gitalifenyc.
 *
 * SCAFFOLD NOTE:
 * This currently renders placeholder tiles. To wire up the real Instagram feed:
 *  1. Create a Meta/Facebook developer app, enable Instagram Basic Display API.
 *  2. Get a long-lived access token for @gitalifenyc.
 *  3. Store it in an env var, e.g. IG_ACCESS_TOKEN.
 *  4. Add a server route /api/instagram that fetches
 *     https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,media_type,thumbnail_url&access_token=...
 *  5. Replace PLACEHOLDER_TILES below with the fetched feed
 *     (or swap this whole component for a <Suspense> server fetch).
 *
 * Alternatively: embed a 3rd-party widget like Smash Balloon or Elfsight
 * if you don't want to manage tokens.
 */

import { motion } from "framer-motion";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/data/home";
import { C, Icon } from "./icons";

/** Placeholder tiles until the real IG feed is wired up. */
const PLACEHOLDER_TILES = Array.from({ length: 8 }, (_, i) => ({
  id: `ph-${i}`,
  color: [C.krishnaBlue, C.gold, C.saffron, C.peacock, C.lotusPink][i % 5],
  label: ["Kirtan", "Class", "Harinam", "Retreat", "Festival", "Prasadam", "Books", "Seva"][i],
}));

export default function InstagramWall() {
  return (
    <section id="gallery" className="relative py-20 px-6" style={{ background: C.cream }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.gold }}
            >
              <Icon name="camera" size={14} />
              From Our Instagram
            </span>
            <h2
              className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              Moments from the community
            </h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
            style={{ color: C.lotusPink }}
          >
            @{INSTAGRAM_HANDLE}
            <Icon name="arrowRight" size={12} />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {PLACEHOLDER_TILES.map((tile, i) => (
            <motion.a
              key={tile.id}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="group relative aspect-square rounded-xl overflow-hidden transition-all hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, ${tile.color}CC, ${tile.color}99)`,
              }}
            >
              {/* Label (placeholder content) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {tile.label}
                </span>
              </div>

              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.4)" }}
              >
                <Icon name="camera" size={22} style={{ color: "white" }} />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Helper note — remove once real feed is wired up */}
        <p className="mt-6 text-center text-[11px] text-gray-400">
          Placeholder tiles &mdash; live Instagram feed will replace these once the API
          token is configured.
        </p>
      </div>
    </section>
  );
}
