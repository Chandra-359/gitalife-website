"use client";

/**
 * BajanClubbingPage — full composition for /bajanclubbing.
 *
 * One continuous midnight canvas (the rest of the site is light khadi
 * paper — stepping onto this page should feel like walking into the
 * club night). Order: hero → vibe tiles → lineup → run of show →
 * venue + ticket form → share → FAQ → outro.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { C, Icon } from "@/components/home/icons";
import { CLUB_FAQS, VIBE_FACTS } from "@/data/bajanClubbing";
import ClubHero from "./ClubHero";
import FestivalBackdrop, { DiyaRow } from "./FestivalBackdrop";
import Lineup from "./Lineup";
import NightFlow from "./NightFlow";
import RegisterPanel from "./RegisterPanel";
import ShareCrew from "./ShareCrew";

const ACCENT_HEX: Record<string, string> = {
  gold: C.gold,
  saffron: C.saffron,
  peacock: C.peacockLight,
  lotus: C.lotusPink,
};

/* ------------------------------------------------------------------ */
/*  Vibe tiles — what makes the night the night                        */
/* ------------------------------------------------------------------ */
function VibeStrip() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 pt-16 sm:pt-20">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VIBE_FACTS.map((fact, i) => {
          const accent = ACCENT_HEX[fact.accent];
          return (
            <motion.div
              key={fact.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="rounded-2xl p-5"
              style={{ background: "rgba(251,245,230,0.045)", border: "1px solid rgba(251,245,230,0.12)" }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `${accent}1a`, border: `1px solid ${accent}40`, color: accent }}
              >
                <Icon name={fact.icon} size={20} />
              </span>
              <h3 className="mt-3.5 text-[16.5px] font-semibold text-white" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
                {fact.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "rgba(251,245,230,0.62)" }}>
                {fact.detail}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */
function ClubFaq() {
  return (
    <section className="relative mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="eyebrow" style={{ color: C.goldLight }}>
          Real Questions
        </p>
        <h2 className="mt-3 text-3xl text-white sm:text-4xl" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
          Before you <em style={{ color: C.goldLight }}>ask</em>
        </h2>
      </motion.div>

      <div className="mt-10 space-y-3">
        {CLUB_FAQS.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-2xl"
            style={{ background: "rgba(251,245,230,0.045)", border: "1px solid rgba(251,245,230,0.12)" }}
          >
            {/* padding lives on the summary so the whole row is the tap target */}
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold text-white [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[16px] transition-transform duration-200 group-open:rotate-45"
                style={{ border: `1px solid ${C.gold}59`, color: C.goldLight }}
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="-mt-1 px-5 pb-4 pr-7 text-[13.5px] leading-relaxed" style={{ color: "rgba(251,245,230,0.68)" }}>
              {faq.a}
            </p>
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
    <section className="relative overflow-hidden px-6 pb-14 pt-10 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(ellipse, ${C.saffron}1f, transparent 65%)`, filter: "blur(30px)" }}
        aria-hidden
      />
      <p
        className="relative mx-auto max-w-xl text-[22px] leading-snug sm:text-[26px]"
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontStyle: "italic", color: "rgba(251,245,230,0.9)" }}
      >
        Come for the beat. Leave with a mantra stuck in your soul.
      </p>
      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
        <a href="#register" className="btn-primary-gradient rounded-full px-7 py-3.5 text-[14px] font-bold text-white">
          Claim your free pass
        </a>
        <Link href="/programs" className="btn-ghost-light rounded-full px-7 py-3.5 text-[14px] font-semibold">
          Explore weekly programs
        </Link>
      </div>
      <p className="relative mt-12 text-[11.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "rgba(251,245,230,0.4)" }}>
        Gita Life NYC · A community initiative under ISKCON
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky mobile CTA — hides once the register section is on screen   */
/* ------------------------------------------------------------------ */
function StickyPassBar() {
  const [hidden, setHidden] = useState(false);
  const observed = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const target = document.getElementById("register");
    if (!target) return;
    observed.current = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" },
    );
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
        href="#register"
        className="flex items-center justify-between rounded-full py-3.5 pl-6 pr-2 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${C.saffron}, #B85308)`,
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: `0 12px 34px -8px ${C.saffron}b3`,
        }}
      >
        <span className="text-[13.5px] font-bold text-white">Sat Aug 15 · Free with pass</span>
        <span
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold"
          style={{ background: "rgba(255,255,255,0.95)", color: "#B85308" }}
        >
          Get pass
          <Icon name="arrowRight" size={13} />
        </span>
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function BajanClubbingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#080E2A" }}>
      <Navbar />
      <Toaster position="top-center" toastOptions={{ style: { background: "#15224F", color: "#FBF5E6" } }} />

      <main>
        <ClubHero />

        <div className="surface-midnight relative">
          {/* faint standing glow down the whole body of the page */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
            style={{ background: `radial-gradient(60% 100% at 50% 0%, ${C.saffron}0d, transparent 70%)` }}
            aria-hidden
          />
          {/* festival dressing: string lights, bunting, petals, stars, rangoli */}
          <FestivalBackdrop />
          <VibeStrip />
          <Lineup />

          <DiyaRow />

          <NightFlow />
          <RegisterPanel />
          <ShareCrew />

          <DiyaRow />

          <ClubFaq />
          <Outro />
        </div>
      </main>

      <StickyPassBar />
    </div>
  );
}
