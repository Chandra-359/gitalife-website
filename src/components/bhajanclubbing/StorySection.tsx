"use client";

/**
 * StorySection — who's behind the night, told in editorial prose:
 * eyebrow, serif pull-quote, two short paragraphs, and a soft CTA to
 * the weekly programs. Copy lives in STORY (src/data/bhajanClubbing.ts).
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/home/icons";
import { STORY } from "@/data/bhajanClubbing";

export default function StorySection() {
  return (
    <section id="story" className="relative mx-auto max-w-3xl scroll-mt-20 px-6 py-16 text-center sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="bc3-eyebrow">{STORY.eyebrow}</p>
        <h2 className="bc3-display mt-4 text-[28px] leading-[1.1] text-white sm:text-[38px]">{STORY.heading}</h2>

        {/* serif pull-quote */}
        <p className="bc3-display mx-auto mt-8 max-w-2xl text-[19px] italic leading-[1.5] sm:text-[23px]" style={{ color: "var(--bc3-gold-hi)" }}>
          &ldquo;{STORY.pullQuote}&rdquo;
        </p>

        {STORY.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="mx-auto mt-6 max-w-prose text-[15.5px] leading-[1.8]" style={{ color: "var(--bc3-ink-dim)" }}>
            {paragraph}
          </p>
        ))}

        <div className="mt-9">
          <Link href="/programs" className="bc3-btn-ghost inline-flex items-center gap-2 rounded-full px-7 py-3 text-[13.5px] font-semibold">
            Explore weekly programs
            <Icon name="arrowRight" size={13} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
