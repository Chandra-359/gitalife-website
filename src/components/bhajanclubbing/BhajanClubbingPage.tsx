"use client";

/**
 * BhajanClubbingPage — "Velvet Ritual" composition for /bhajanclubbing.
 *
 * High-end conscious club: deep plum/midnight canvas, soft off-white
 * editorial serif, warm candlelit accents, frosted-glass panels, and a
 * fixed film-grain wash over everything. Structure follows the
 * event-page spec: hero → the vibe → lineup → bento details →
 * multi-step tickets → share → FAQ → outro. The festival
 * layer (string lights,
 * diyas, petals, rising notes) persists underneath it all.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { Icon } from "@/components/home/icons";
import { CLUB_FAQS, EVENT, ORGANIZER_NOTE, seatMeter } from "@/data/bhajanClubbing";
import BentoDetails from "./BentoDetails";
import FestivalBackdrop, { DiyaRow } from "./FestivalBackdrop";
import NeonHero from "./NeonHero";
import NeonLineup from "./NeonLineup";
import SectionTracker from "./SectionTracker";
import ShareCrew from "./ShareCrew";
import SocialLinks from "./SocialLinks";
import TheVibe from "./TheVibe";
import TicketFlow from "./TicketFlow";
import { useAvailability } from "./useAvailability";

/* ------------------------------------------------------------------ */
/*  FAQ — compact glass accordions                                     */
/* ------------------------------------------------------------------ */
function ClubFaq() {
  return (
    <section id="faq" className="relative mx-auto max-w-2xl scroll-mt-20 px-6 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
          FAQ
        </p>
        <h2 className="bc2-display mt-4 text-[28px] text-club-ink sm:text-[36px]">
          Frequently asked <span className="bc2-headline-grad">questions</span>
        </h2>
      </motion.div>

      <div className="mt-10 space-y-3">
        {CLUB_FAQS.map((faq) => (
          <details key={faq.q} className="bc2-glass group !rounded-2xl">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[14.5px] font-bold text-club-ink [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[15px] transition-transform duration-200 group-open:rotate-45"
                style={{ border: "1px solid rgba(229,192,141,0.4)", color: "var(--bc2-amber)" }}
                aria-hidden
              >
                +
              </span>
            </summary>
            <div className="-mt-1 px-5 pb-4 pr-8 text-[13px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
              <p>{faq.a}</p>
              {faq.points && (
                <ul className="mt-2.5 space-y-1.5">
                  {faq.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--bc2-amber)", boxShadow: "0 0 8px rgba(229,192,141,0.7)" }} aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
              {faq.links && (
                <ul className="mt-2.5 space-y-1.5">
                  {faq.links.map((link) => (
                    <li key={link.href} className="flex items-start gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--bc2-amber)", boxShadow: "0 0 8px rgba(229,192,141,0.7)" }} aria-hidden />
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline decoration-[rgba(229,192,141,0.5)] underline-offset-4 transition-colors hover:text-club-ink"
                        style={{ color: "var(--bc2-amber)" }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Outro + mini footer                                                */
/* ------------------------------------------------------------------ */
function Outro() {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-8 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[640px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(217,138,74,0.14), transparent 65%)", filter: "blur(34px)" }}
        aria-hidden
      />
      <p className="bc2-display relative mx-auto max-w-2xl text-[22px] leading-[1.2] text-club-ink sm:text-[30px]">
        Come for the beat.
        <br />
        <span className="bc2-headline-grad">Leave with a mantra stuck in your soul.</span>
      </p>
      <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
        <a href="#tickets" className="bc2-btn-glow rounded-full px-8 py-3.5 text-[13.5px] font-extrabold uppercase tracking-[0.08em]">
          Get Tickets
        </a>
        <Link href="/programs" className="bc2-btn-ghost rounded-full px-7 py-3.5 text-[13.5px] font-semibold">
          Explore weekly programs
        </Link>
      </div>

      {/* who's behind the night */}
      <p className="relative mx-auto mt-12 max-w-xl text-[13px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
        {ORGANIZER_NOTE}
      </p>

      {/* contact */}
      <p className="relative mx-auto mt-4 max-w-xl text-[13px]" style={{ color: "var(--bc2-ink-dim)" }}>
        Questions?{" "}
        <a
          href={`mailto:${EVENT.contactEmail}`}
          className="font-semibold underline decoration-[rgba(229,192,141,0.5)] underline-offset-4 transition-colors hover:text-club-ink"
          style={{ color: "var(--bc2-amber)" }}
        >
          {EVENT.contactEmail}
        </a>
      </p>

      {/* official profiles — repeated at the bottom of the page */}
      <div className="relative mt-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
          Follow us
        </p>
        <div className="mt-5">
          <SocialLinks />
        </div>
      </div>

      <p className="relative mt-10 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--bc2-ink-faint)" }}>
        Gita Life NYC · A community initiative under ISKCON
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky mobile CTA — hides when the ticket flow is on screen        */
/* ------------------------------------------------------------------ */
function StickyTicketBar() {
  const [hidden, setHidden] = useState(false);
  const observed = useRef<IntersectionObserver | null>(null);
  const { availability } = useAvailability();
  const meter = seatMeter(availability?.remaining);
  const soldOut = meter?.tone === "sold-out";

  useEffect(() => {
    const target = document.getElementById("tickets");
    if (!target) return;
    observed.current = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      rootMargin: "0px 0px -15% 0px",
    });
    observed.current.observe(target);
    return () => observed.current?.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-40 transition-all duration-300 sm:hidden ${
        hidden ? "pointer-events-none translate-y-24 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <a
        href="#tickets"
        className="flex items-center justify-between rounded-full py-3 pl-6 pr-2 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(42,27,56,0.92), rgba(26,26,29,0.95))",
          border: "1px solid rgba(217,138,74,0.4)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 12px 40px -10px rgba(16,12,20,0.6)",
        }}
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[13px] font-bold text-club-ink">Sat Aug 15 · {EVENT.donationShortLabel}</span>
          {meter && (
            <span
              className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
              style={{ color: soldOut ? "#FF9E9E" : "var(--bc2-amber)" }}
            >
              {meter.short}
            </span>
          )}
        </span>
        <span className="bc2-btn-glow flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold tracking-[0.02em]">
          {soldOut ? "See details" : "Get Tickets"}
          <Icon name="arrowRight" size={12} />
        </span>
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function BhajanClubbingPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, var(--bc2-bg) 0%, var(--bc2-bg-2) 100%)" }}>
      <Navbar />
      <SectionTracker />
      <Toaster position="top-center" toastOptions={{ style: { background: "#241831", color: "#F4F0EB", border: "1px solid rgba(122,92,158,0.4)" } }} />

      {/* fixed film grain over the entire page — analog warmth */}
      <div className="bc2-film-grain" aria-hidden />

      <main>
        <NeonHero />

        <div className="relative" style={{ background: "linear-gradient(180deg, var(--bc2-bg-2) 0%, var(--bc2-bg-mid) 40%, var(--bc2-bg) 100%)" }}>
          {/* standing aurora glows down the body */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <span className="bc2-aurora left-[-14%] top-[18%] h-[560px] w-[560px]" style={{ background: "var(--bc2-blue-deep)", "--o": 0.16, "--t": "24s" } as React.CSSProperties} />
            <span className="bc2-aurora right-[-16%] top-[46%] h-[620px] w-[620px]" style={{ background: "var(--bc2-purple)", "--o": 0.18, "--t": "28s", "--d": "-9s" } as React.CSSProperties} />
            <span className="bc2-aurora left-[10%] top-[74%] h-[520px] w-[520px]" style={{ background: "var(--bc2-saffron)", "--o": 0.12, "--t": "26s", "--d": "-14s" } as React.CSSProperties} />
          </div>

          {/* festival layer: lights, bunting, diyas, petals, notes */}
          <FestivalBackdrop />

          <TheVibe />
          <NeonLineup />
          <DiyaRow />
          <BentoDetails />
          <TicketFlow />
          <ShareCrew />
          <DiyaRow />
          <ClubFaq />
          <Outro />
        </div>
      </main>

      <StickyTicketBar />
    </div>
  );
}
