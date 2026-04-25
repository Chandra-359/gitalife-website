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
    <section className="relative py-20 px-6" style={{ background: C.warmBg }}>
      <div className="mx-auto max-w-6xl">
        <header className="text-center mb-10">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.saffron }}
          >
            <Icon name="sparkle" size={14} />
            What&rsquo;s coming up
          </span>
          <h2
            className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
            style={{ color: C.krishnaBlue }}
          >
            Come gather with us
          </h2>
          <p
            className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed"
            style={{ color: "#4b5563" }}
          >
            Pulled live from our community calendar. Tap any program to RSVP
            on Luma — free, no app required.
          </p>
        </header>

        {/* ---- Featured next-up event ---- */}
        <LumaFeaturedCard event={featured} />

        {/* ---- "Also coming up" row ---- */}
        {previews.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-5">
              <h3
                className="font-serif text-lg sm:text-xl font-bold"
                style={{ color: C.krishnaBlue, letterSpacing: "-0.01em" }}
              >
                Also coming up
              </h3>
              <div
                aria-hidden
                className="flex-1 h-px"
                style={{
                  background: `linear-gradient(90deg, ${C.gold}30, transparent)`,
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {previews.map((e, i) => (
                <LumaEventCard key={e.apiId} event={e} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* ---- See all CTA ---- */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/programs"
            className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:scale-[1.03] btn-primary-gradient"
          >
            See all upcoming programs
            <Icon
              name="arrowRight"
              size={13}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
