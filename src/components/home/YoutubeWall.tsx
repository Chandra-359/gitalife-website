"use client";

/**
 * YoutubeWall — Embeds the Elfsight YouTube Gallery widget
 * for @gitalifenyc (app id f04b83ef-4a7d-429c-97bd-ce4262b9f40b).
 *
 * Shares the same elfsightcdn.com platform.js as InstagramWall;
 * Next.js deduplicates Script tags by src, so loading it from both
 * components is safe.
 */

import Script from "next/script";
import { YOUTUBE_URL } from "@/data/home";
import { C, Icon } from "./icons";

const ELFSIGHT_APP_ID = "f04b83ef-4a7d-429c-97bd-ce4262b9f40b";

export default function YoutubeWall() {
  return (
    <section id="watch" className="surface-paper-warm relative py-20 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.saffron }}
            >
              <Icon name="flame" size={14} />
              On YouTube
            </span>
            <h2
              className="section-heading mt-2 text-3xl sm:text-4xl"
              style={{ color: C.krishnaBlue }}
            >
              Watch our latest
            </h2>
          </div>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-soft btn-soft-saffron"
          >
            @gitalifenyc
            <Icon name="arrowRight" size={12} />
          </a>
        </div>

        {/* Elfsight widget. `data-elfsight-app-lazy` defers load until scroll. */}
        <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
        <div
          className={`elfsight-app-${ELFSIGHT_APP_ID}`}
          data-elfsight-app-lazy
        />
      </div>
    </section>
  );
}
