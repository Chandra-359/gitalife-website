"use client";

/**
 * BhajanClubbingPage — "Transcendental Neon" composition for /bhajanclubbing.
 *
 * Premium dark mode: deep purple canvas, saffron / electric blue / violet
 * neon, frosted-glass panels over a pulsing aurora. Structure follows the
 * event-page spec: hero → the vibe → lineup → bento details → free
 * prasadam → multi-step tickets → share → FAQ → outro. The festival
 * layer (string lights,
 * diyas, petals, instruments, rising notes) persists underneath it all.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { Icon } from "@/components/home/icons";
import { CLUB_FAQS, EVENT, ORGANIZER_NOTE } from "@/data/bhajanClubbing";
import BentoDetails from "./BentoDetails";
import FestivalBackdrop, { DiyaRow } from "./FestivalBackdrop";
import NeonHero from "./NeonHero";
import NeonLineup from "./NeonLineup";
import PrasadamFeast from "./PrasadamFeast";
import SectionTracker from "./SectionTracker";
import ShareCrew from "./ShareCrew";
import TheVibe from "./TheVibe";
import TicketFlow from "./TicketFlow";

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
        <h2 className="bc2-display mt-4 text-[28px] text-white sm:text-[36px]">
          Frequently asked <span className="bc2-headline-grad">questions</span>
        </h2>
      </motion.div>

      <div className="mt-10 space-y-3">
        {CLUB_FAQS.map((faq) => (
          <details key={faq.q} className="bc2-glass group !rounded-2xl">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[14.5px] font-bold text-white [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[15px] transition-transform duration-200 group-open:rotate-45"
                style={{ border: "1px solid rgba(255,178,92,0.4)", color: "var(--bc2-amber)" }}
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
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--bc2-amber)", boxShadow: "0 0 8px rgba(255,178,92,0.7)" }} aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
              {faq.links && (
                <ul className="mt-2.5 space-y-1.5">
                  {faq.links.map((link) => (
                    <li key={link.href} className="flex items-start gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--bc2-amber)", boxShadow: "0 0 8px rgba(255,178,92,0.7)" }} aria-hidden />
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline decoration-[rgba(255,178,92,0.5)] underline-offset-4 transition-colors hover:text-white"
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
        style={{ background: "radial-gradient(ellipse, rgba(255,122,26,0.14), transparent 65%)", filter: "blur(34px)" }}
        aria-hidden
      />
      <p className="bc2-display relative mx-auto max-w-2xl text-[22px] leading-[1.2] text-white sm:text-[30px]">
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
          background: "linear-gradient(135deg, rgba(21,10,56,0.92), rgba(11,6,32,0.95))",
          border: "1px solid rgba(255,122,26,0.45)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 12px 40px -10px rgba(255,122,26,0.55)",
        }}
      >
        <span className="text-[13px] font-bold text-white">Sat Aug 15 · {EVENT.priceLabel}</span>
        <span className="bc2-btn-glow flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.06em]" style={{ animation: "none" }}>
          Get Tickets
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
    <div className="min-h-screen" style={{ background: "var(--bc2-bg)" }}>
      <Navbar />
      <SectionTracker />
      <Toaster position="top-center" toastOptions={{ style: { background: "#150A38", color: "#F4EFFF", border: "1px solid rgba(139,92,246,0.4)" } }} />

      <main>
        <NeonHero />

        <div className="relative" style={{ background: "linear-gradient(180deg, var(--bc2-bg-2) 0%, var(--bc2-bg) 32%, #0E0728 68%, #070313 100%)" }}>
          {/* grain over the whole body */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "var(--tex-grain-dark)", backgroundSize: "240px 240px", opacity: 0.4, mixBlendMode: "screen" }}
            aria-hidden
          />

          {/* standing aurora glows down the body */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <span className="bc2-aurora left-[-14%] top-[18%] h-[560px] w-[560px]" style={{ background: "var(--bc2-blue-deep)", "--o": 0.16, "--t": "24s" } as React.CSSProperties} />
            <span className="bc2-aurora right-[-16%] top-[46%] h-[620px] w-[620px]" style={{ background: "var(--bc2-purple)", "--o": 0.18, "--t": "28s", "--d": "-9s" } as React.CSSProperties} />
            <span className="bc2-aurora left-[10%] top-[74%] h-[520px] w-[520px]" style={{ background: "var(--bc2-saffron)", "--o": 0.12, "--t": "26s", "--d": "-14s" } as React.CSSProperties} />
          </div>

          {/* festival layer: lights, bunting, diyas, petals, instruments, notes */}
          <FestivalBackdrop />

          <TheVibe />
          <NeonLineup />
          <DiyaRow />
          <BentoDetails />
          <PrasadamFeast />
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
