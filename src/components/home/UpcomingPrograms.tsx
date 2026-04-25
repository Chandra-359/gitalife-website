"use client";

/**
 * UpcomingPrograms — homepage section that surfaces the next few
 * programs from the shared Luma calendar.
 *
 * Replaces the old hard-coded FeaturedEvent. Visual structure:
 *   - Eyebrow + heading (centered)
 *   - Hero card for the next-up event (LumaFeaturedCard)
 *   - "Also coming up" rule + a row of 3 grid cards
 *   - "See all upcoming programs →" link to /programs
 *
 * Renders nothing if Luma returned no events (graceful skip).
 */

import Link from "next/link";
import type { LumaEvent } from "@/lib/luma";
import LumaFeaturedCard from "@/components/programs/LumaFeaturedCard";
import LumaEventCard from "@/components/programs/LumaEventCard";
import { C, Icon } from "./icons";

interface UpcomingProgramsProps {
  events: LumaEvent[];
}

export default function UpcomingPrograms({ events }: UpcomingProgramsProps) {
  if (events.length === 0) return null;

  const [featured, ...rest] = events;
  const previews = rest.slice(0, 3);

  return (
    <section className="relative py-12 px-5 sm:py-16 sm:px-8" style={{ background: C.warmBg }}>
      <div className="mx-auto max-w-6xl">
        <header className="text-center mb-8 sm:mb-10">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: C.saffron }}
          >
            <Icon name="sparkle" size={14} />
            What&rsquo;s coming up
          </span>
          <h2
            className="mt-2 text-2xl sm:text-3xl font-bold"
            style={{ color: C.krishnaBlue }}
          >
            Come gather with us
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
            Tap any program to RSVP on Luma — free, no app required.
          </p>
        </header>

        {/* Featured next-up event */}
        <LumaFeaturedCard event={featured} />

        {/* "Also coming up" row */}
        {previews.length > 0 && (
          <div className="mt-10">
            <div className="flex items-end justify-between mb-4 gap-3">
              <h3
                className="text-lg font-semibold"
                style={{ color: C.krishnaBlue }}
              >
                Also coming up
              </h3>
              <span className="sm:hidden text-[11px] uppercase tracking-[0.16em] text-gray-400">
                Swipe →
              </span>
            </div>
            <div
              className="snap-rail snap-rail-bleed sm:m-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:p-0 lg:grid-cols-3"
              role="list"
              aria-label="Upcoming programs"
            >
              {previews.map((e, i) => (
                <div
                  key={e.apiId}
                  role="listitem"
                  className="w-[82%] max-w-[320px] shrink-0 sm:w-auto sm:max-w-none sm:shrink"
                >
                  <LumaEventCard event={e} index={i} alwaysVertical />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* See all CTA */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/programs"
            className="btn-primary-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
          >
            See all upcoming programs
            <Icon name="arrowRight" size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
