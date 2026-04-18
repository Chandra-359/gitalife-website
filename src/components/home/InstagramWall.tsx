"use client";

/**
 * InstagramWall — photo gallery section pulling from @gitalifenyc.
 *
 * On mount we hit `/api/instagram` which uses IG_ACCESS_TOKEN server-side
 * to fetch recent posts. If the token isn't configured, the route returns
 * `source: "placeholder"` and we render the colored fallback tiles.
 *
 * To enable real feed: see src/app/api/instagram/route.ts for env setup.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/data/home";
import { C, Icon } from "./icons";

interface IgPost {
  id: string;
  caption?: string;
  media_url: string;
  permalink: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnail_url?: string;
}

const PLACEHOLDER_TILES = Array.from({ length: 8 }, (_, i) => ({
  id: `ph-${i}`,
  color: [C.krishnaBlue, C.gold, C.saffron, C.peacock, C.lotusPink][i % 5],
  label: ["Kirtan", "Class", "Harinam", "Retreat", "Festival", "Prasadam", "Books", "Seva"][i],
}));

export default function InstagramWall() {
  const [posts, setPosts] = useState<IgPost[] | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/instagram");
        if (!res.ok) return;
        const data = (await res.json()) as { source: string; posts: IgPost[] };
        if (cancelled) return;
        if (data.source === "instagram" && data.posts.length > 0) {
          setPosts(data.posts);
          setIsLive(true);
        }
      } catch {
        // keep placeholders
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
          {isLive && posts
            ? posts.map((post, i) => (
                <motion.a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="group relative aspect-square rounded-xl overflow-hidden transition-all hover:-translate-y-1 bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- IG CDN hostnames rotate; plain <img> avoids ongoing remotePatterns maintenance. */}
                  <img
                    src={
                      post.media_type === "VIDEO" && post.thumbnail_url
                        ? post.thumbnail_url
                        : post.media_url
                    }
                    alt={post.caption?.slice(0, 120) ?? "Instagram post"}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                  >
                    <Icon name="camera" size={22} style={{ color: "white" }} />
                  </div>
                </motion.a>
              ))
            : PLACEHOLDER_TILES.map((tile, i) => (
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {tile.label}
                    </span>
                  </div>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                  >
                    <Icon name="camera" size={22} style={{ color: "white" }} />
                  </div>
                </motion.a>
              ))}
        </div>

        {!isLive && (
          <p className="mt-6 text-center text-[11px] text-gray-400">
            Placeholder tiles &mdash; live Instagram feed will replace these once
            <code className="mx-1 px-1 py-0.5 rounded bg-gray-100 text-[10px]">IG_ACCESS_TOKEN</code>
            is configured.
          </p>
        )}
      </div>
    </section>
  );
}
