"use client";

/**
 * TheVibe — manifesto + four feature cards.
 *
 * The manifesto typography unfolds on scroll (heading words rise
 * word-by-word, then the serif line and paragraphs, on one staggered
 * viewport trigger). The four feature cards are magnetic glass tiles:
 * an accent-tinted icon chip over the copy, spring-driven 3D tilt that
 * pulls toward the cursor, and an accent glow that spills past the
 * card onto the page on hover.
 */

import { Fragment, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { Icon } from "@/components/home/icons";
import { VIBE_FACTS } from "@/data/bhajanClubbing";

const unfold: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const HEADLINE_WORDS = "A rave where the drop is a".split(" ");

/* Per-card accent — icon tint + hover glow, keyed by the fact's icon id. */
const GLOW: Record<(typeof VIBE_FACTS)[number]["icon"], string> = {
  music: "#D98A4A", // warm saffron
  sparkle: "#7A5C9E", // deep purple
  food: "#E5C08D", // warm sand
  handshake: "#C08CA6", // soft rose
};

/* ------------------------------------------------------------------ */
/*  Magnetic wrapper — tilts and pulls the card toward the cursor      */
/* ------------------------------------------------------------------ */
function MagneticCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 160, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), spring);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), spring);
  const x = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), spring);
  const y = useSpring(useTransform(my, [-0.5, 0.5], [-6, 6]), spring);

  if (reduce) return <div className="h-full">{children}</div>;

  return (
    <motion.div
      ref={ref}
      className="h-full"
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX, rotateY, x, y, transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

export default function TheVibe() {
  const reduce = useReducedMotion();
  return (
    <section id="vibe" className="relative mx-auto max-w-5xl scroll-mt-20 px-6 py-20 sm:py-28">
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* manifesto — unfolds word-by-word, then line-by-line on scroll */}
        <motion.div
          variants={unfold}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p variants={rise} className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
            The Vibe
          </motion.p>
          <h2 className="mt-4 leading-[1.2] text-club-ink">
            <span className="block font-sans text-[22px] font-bold uppercase tracking-[0.08em] sm:text-[28px]">
              {HEADLINE_WORDS.map((word, i) => (
                <Fragment key={i}>
                  <motion.span variants={rise} className="inline-block">
                    {word}
                  </motion.span>
                  {i < HEADLINE_WORDS.length - 1 ? " " : null}
                </Fragment>
              ))}
            </span>
            <motion.span variants={rise} className="bc2-display block italic text-[34px] sm:text-[46px]" style={{ fontWeight: 500 }}>
              mantra
            </motion.span>
          </h2>
          <motion.p variants={rise} className="mt-6 text-[15.5px] leading-[1.8]" style={{ color: "var(--bc2-ink-dim)" }}>
            Bhajan clubbing takes the centuries-old practice of devotional call-and-response singing and puts it on a
            concert rig with a serious sound system. The lyrics stay sacred. The energy goes
            vertical. Everybody dances, and by the last chorus a room of strangers is one voice.
          </motion.p>
          <motion.p variants={rise} className="mt-4 text-[15.5px] leading-[1.8]" style={{ color: "var(--bc2-ink-dim)" }}>
            Inspired by ISKCON NYC&apos;s Times Square harinam — where the holy name stops Midtown in its tracks every week — and this summer, Jersey City gets its first night.
          </motion.p>
        </motion.div>

        {/* feature cards — magnetic glass tiles */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {VIBE_FACTS.map((fact, i) => {
            const glow = GLOW[fact.icon];
            return (
              <motion.div
                key={fact.title}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
              >
                <MagneticCard>
                  <div className="group relative h-full">
                    {/* ambient light spill — bleeds past the card on hover */}
                    <span
                      className="pointer-events-none absolute -inset-5 rounded-[30px] opacity-0 blur-2xl transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                      style={{ background: `radial-gradient(60% 60% at 50% 50%, ${glow}59, transparent 75%)` }}
                      aria-hidden
                    />
                    <div className="relative h-full overflow-hidden rounded-[22px] border border-white/10 bg-white/5 p-5 backdrop-blur-lg transition-colors duration-500 ease-in-out group-hover:bg-white/10">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ background: `${glow}1f`, border: `1px solid ${glow}4d`, color: glow }}
                        aria-hidden
                      >
                        <Icon name={fact.icon} size={17} />
                      </span>
                      <h3 className="mt-4 text-[15px] font-bold text-club-ink">{fact.title}</h3>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
                        {fact.detail}
                      </p>
                    </div>
                  </div>
                </MagneticCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
