"use client";

/**
 * InstagramWall — Embeds the Elfsight Instagram feed widget
 * for @gitalifenyc (app id 87b4db08-2d52-4076-a779-48fc2e1ebb51).
 *
 * To change the widget: swap ELFSIGHT_APP_ID below. To replace with
 * the official IG Graph API later, delete this file and restore the
 * earlier fetch-based version (check git history).
 */

import Script from "next/script";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/data/home";
import { C, Icon } from "./icons";

const ELFSIGHT_APP_ID = "87b4db08-2d52-4076-a779-48fc2e1ebb51";

export default function InstagramWall() {
  return (
    <section id="gallery" className="surface-paper relative py-20 px-5 sm:px-8">
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
              className="section-heading mt-2 text-3xl sm:text-4xl"
              style={{ color: C.krishnaBlue }}
            >
              Moments from the community
            </h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-soft btn-soft-lotus"
          >
            @{INSTAGRAM_HANDLE}
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
