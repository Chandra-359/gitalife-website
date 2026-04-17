"use client";

/**
 * FeaturedEvent — large card for the next big event (monthly festival or quarterly retreat).
 *
 * If a Luma URL is set on FEATURED_EVENT.lumaUrl, we link to it as the primary CTA
 * (and a future /festival sub-page will embed the full Luma iframe).
 * If not, we fall back to a generic RSVP/link-to-page CTA.
 */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FEATURED_EVENT } from "@/data/home";
import { C, Icon } from "./icons";

export default function FeaturedEvent() {
  const e = FEATURED_EVENT;
  const hasLuma = e.lumaUrl && e.lumaUrl.length > 0;
  const subPage = e.kind === "festival" ? "/festival" : "/retreats";
  const spotsPct =
    e.spotsLeft != null && e.totalSpots != null
      ? Math.max(0, Math.min(100, ((e.totalSpots - e.spotsLeft) / e.totalSpots) * 100))
      : null;

  return (
    <section className="relative py-20 px-6" style={{ background: C.warmBg }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.saffron }}
          >
            <Icon name="sparkle" size={14} />
            Featured Event
          </span>
          <h2
            className="mt-2 text-2xl sm:text-3xl font-bold font-serif"
            style={{ color: C.krishnaBlue }}
          >
            {e.kind === "festival" ? "Come celebrate with us" : "A weekend away"}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-5 gap-0 rounded-3xl overflow-hidden shadow-xl"
          style={{ background: "white", border: `1px solid ${C.gold}20` }}
        >
          {/* Image */}
          <div className="relative md:col-span-2 min-h-[260px] md:min-h-0">
            <Image
              src={e.imageUrl}
              alt={e.title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${C.krishnaDeep}40 0%, transparent 50%)`,
              }}
            />
            {/* Date chip */}
            <div
              className="absolute top-5 left-5 rounded-xl px-3.5 py-2 text-center"
              style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)" }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: C.saffron }}
              >
                {e.dateLabel.split(",")[0]}
              </p>
              <p
                className="text-[22px] font-bold leading-none font-serif"
                style={{ color: C.krishnaBlue }}
              >
                {e.dateLabel.split(" ").slice(-1)[0]}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3 p-7 sm:p-9 flex flex-col">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider w-fit mb-4"
              style={{ background: `${C.saffron}15`, color: C.saffron }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.saffron }} />
              {e.kind === "festival" ? "Monthly festival" : "Quarterly retreat"}
            </span>

            <h3
              className="text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: C.krishnaBlue }}
            >
              {e.title}
            </h3>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-[13px] text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="calendar" size={13} style={{ color: C.gold }} />
                {e.dateLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="flame" size={13} style={{ color: C.gold }} />
                {e.timeLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="mapPin" size={13} style={{ color: C.gold }} />
                {e.location}
              </span>
            </div>

            <p className="mt-4 text-[14px] leading-[1.7] text-gray-600">{e.description}</p>

            {/* Highlights */}
            <ul className="mt-4 space-y-1.5">
              {e.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[13px] text-gray-700"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: C.gold }}
                  />
                  {h}
                </li>
              ))}
            </ul>

            {/* Spots left */}
            {spotsPct !== null && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="text-gray-500">
                    {e.spotsLeft} of {e.totalSpots} spots left
                  </span>
                  <span className="font-semibold" style={{ color: C.saffron }}>
                    Filling up
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: `${C.gold}15` }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${spotsPct}%`,
                      background: `linear-gradient(90deg, ${C.gold}, ${C.saffron})`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {hasLuma ? (
                <a
                  href={e.lumaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold uppercase tracking-wider text-white transition-all hover:scale-[1.03]"
                  style={{
                    background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                    boxShadow: `0 0 25px ${C.gold}30`,
                  }}
                >
                  Reserve your spot
                  <Icon
                    name="arrowRight"
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </a>
              ) : (
                <Link
                  href={subPage}
                  className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold uppercase tracking-wider text-white transition-all hover:scale-[1.03]"
                  style={{
                    background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                    boxShadow: `0 0 25px ${C.gold}30`,
                  }}
                >
                  Reserve your spot
                  <Icon
                    name="arrowRight"
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              )}
              <Link
                href={subPage}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
                style={{ color: C.krishnaBlue }}
              >
                Full details
                <Icon name="arrowRight" size={12} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
