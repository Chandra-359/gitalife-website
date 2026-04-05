"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";
import Navbar from "@/components/Navbar";

/* ------------------------------------------------------------------ */
/*  Krishna-themed color palette                                       */
/* ------------------------------------------------------------------ */
const C = {
  krishnaBlue: "#1B2A6B",
  krishnaDeep: "#0F1B4D",
  krishnaLight: "#2E3F8F",
  gold: "#D4A843",
  goldLight: "#F0D68A",
  saffron: "#E8751A",
  peacock: "#006D5B",
  peacockLight: "#00917A",
  lotusPink: "#D64B8A",
  cream: "#FFFBF2",
  warmBg: "#FFF9F0",
};

/* ------------------------------------------------------------------ */
/*  Hero particles — divine golden & blue sparkles                     */
/* ------------------------------------------------------------------ */
const HERO_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: `${5 + (i * 37) % 90}%`,
  y: `${3 + (i * 29) % 90}%`,
  size: 2 + (i % 5),
  delay: (i * 0.25) % 4,
  duration: 5 + (i % 5) * 2,
  color: i % 4 === 0
    ? "rgba(212,168,67,0.5)"
    : i % 4 === 1
    ? "rgba(240,214,138,0.3)"
    : i % 4 === 2
    ? "rgba(0,109,91,0.25)"
    : "rgba(214,75,138,0.2)",
}));

/* ------------------------------------------------------------------ */
/*  YouTube videos — update these IDs with your actual videos          */
/* ------------------------------------------------------------------ */
const YOUTUBE_VIDEOS = [
  {
    id: "dQw4w9WgXcQ",
    title: "Kirtan Evening Highlights",
    category: "Kirtan & Prasadam",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Bhagavad Gita Wisdom Talk",
    category: "Wisdom Session",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Youth Festival Recap",
    category: "Youth Festival",
  },
];

/* ------------------------------------------------------------------ */
/*  Weekly schedule                                                    */
/* ------------------------------------------------------------------ */
const WEEKLY_SCHEDULE = [
  { day: "Friday", activity: "Bhagavad Gita Class", location: "Newport, Jersey City", time: "Evening", icon: "book" as const },
  { day: "Saturday", activity: "Bhagavad Gita Class", location: "Jersey City", time: "Evening", icon: "book" as const },
  { day: "Sunday", activity: "Bhagavad Gita Class", location: "ISKCON Brooklyn", time: "Morning", icon: "book" as const },
  { day: "Sunday", activity: "Harinam Sankirtan", location: "NYC Streets", time: "Afternoon", icon: "music" as const },
  { day: "Ongoing", activity: "Book Distribution", location: "Newport, Jersey City, NYU", time: "Various", icon: "gift" as const },
];

/* ------------------------------------------------------------------ */
/*  Activities / What we do                                            */
/* ------------------------------------------------------------------ */
const ACTIVITIES = [
  {
    title: "Bhagavad Gita Classes",
    description: "Weekly classes diving deep into the timeless wisdom of the Bhagavad Gita. Join us Fridays in Newport, Saturdays in Jersey City, and Sundays at ISKCON Brooklyn.",
    color: C.gold,
    icon: "book" as const,
    highlight: "3x per week",
  },
  {
    title: "Harinam Sankirtan",
    description: "Every Sunday we take the holy names to the streets of New York City, sharing the joy of kirtan with everyone we meet.",
    color: C.saffron,
    icon: "music" as const,
    highlight: "Every Sunday",
  },
  {
    title: "Book Distribution",
    description: "Sharing transcendental literature across Newport, Jersey City, and NYU campuses — bringing ancient wisdom to college students and professionals alike.",
    color: C.peacock,
    icon: "gift" as const,
    highlight: "3 locations",
  },
  {
    title: "Upstate Retreats",
    description: "Weekend getaways in upstate New York for immersive scripture reading, dramatic performances, and cooking prasadam with exalted Vaishnavas visiting ISKCON Brooklyn.",
    color: C.lotusPink,
    icon: "mountain" as const,
    highlight: "Upstate NY",
  },
  {
    title: "Ratha Yatra",
    description: "Every year we participate in the grand Ratha Yatra festival in New York — one of the biggest celebrations of Lord Jagannath outside of India.",
    color: C.krishnaLight,
    icon: "festival" as const,
    highlight: "Annual event",
  },
  {
    title: "Govinda's Restaurant",
    description: "Our students run the beloved Govinda's restaurant at ISKCON Brooklyn, serving sanctified vegetarian meals to the community with love and devotion.",
    color: C.peacockLight,
    icon: "food" as const,
    highlight: "ISKCON Brooklyn",
  },
];

/* ------------------------------------------------------------------ */
/*  Section wrapper with scroll animation                              */
/* ------------------------------------------------------------------ */
function Section({
  children,
  className = "",
  id,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Stagger helpers                                                    */
/* ------------------------------------------------------------------ */
function StaggerContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 22, stiffness: 200 } },
};

/* ================================================================== */
/*  HOMEPAGE                                                           */
/* ================================================================== */
interface HomePageProps {
  programs: Program[];
}

export default function HomePage({ programs }: HomePageProps) {
  const testimonials = programs
    .filter((p) => p.testimonial && p.testimonialAuthor)
    .slice(0, 3);

  /* Activity icon helper */
  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case "book": return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>;
      case "music": return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
      case "gift": return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></svg>;
      case "mountain": return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3l4 8 5-5 5 15H2L8 3z" /></svg>;
      case "festival": return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" /><path d="M2 12h20" /></svg>;
      case "food": return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>;
      default: return null;
    }
  };

  /* SVG lotus decoration used across sections */
  const LotusDecoration = ({ className = "", size = 40, color = C.gold }: { className?: string; size?: number; color?: string }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" opacity="0.15">
      {/* Center petal */}
      <ellipse cx="50" cy="35" rx="8" ry="22" fill={color} transform="rotate(0 50 50)" />
      {/* Left petals */}
      <ellipse cx="50" cy="35" rx="8" ry="22" fill={color} transform="rotate(-30 50 50)" />
      <ellipse cx="50" cy="35" rx="8" ry="22" fill={color} transform="rotate(-60 50 50)" />
      {/* Right petals */}
      <ellipse cx="50" cy="35" rx="8" ry="22" fill={color} transform="rotate(30 50 50)" />
      <ellipse cx="50" cy="35" rx="8" ry="22" fill={color} transform="rotate(60 50 50)" />
      {/* Outer petals */}
      <ellipse cx="50" cy="35" rx="7" ry="20" fill={color} transform="rotate(-90 50 50)" opacity="0.6" />
      <ellipse cx="50" cy="35" rx="7" ry="20" fill={color} transform="rotate(90 50 50)" opacity="0.6" />
    </svg>
  );

  /* Ornamental divider */
  const OrnamentDivider = ({ light = false }: { light?: boolean }) => (
    <div className="flex items-center justify-center gap-3 my-4">
      <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to right, transparent, ${light ? "rgba(212,168,67,0.4)" : "rgba(212,168,67,0.25)"})` }} />
      <svg width="16" height="16" viewBox="0 0 24 24" fill={light ? "rgba(212,168,67,0.5)" : "rgba(212,168,67,0.3)"}>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3c.8 0 1.5.3 2 .8l-2 2.5-2-2.5c.5-.5 1.2-.8 2-.8z" />
      </svg>
      <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to left, transparent, ${light ? "rgba(212,168,67,0.4)" : "rgba(212,168,67,0.25)"})` }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <Navbar isHomepage />

      {/* ============================================================ */}
      {/*  SECTION 1 — HERO with Krishna-Arjuna painting                */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background painting */}
        <Image
          src="/krishna-arjuna-chariot.jpg"
          alt="Krishna and Arjuna on the chariot at Kurukshetra"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay for readability — graduated from top/bottom */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${C.krishnaDeep}E6 0%, ${C.krishnaDeep}99 25%, ${C.krishnaDeep}80 50%, ${C.krishnaDeep}99 75%, ${C.krishnaDeep}F2 100%)` }} />
        {/* Warm color tint to blend with painting */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(212,168,67,0.08) 0%, transparent 60%)" }} />

        {/* Ornamental top border */}
        <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.saffron}, ${C.gold}, transparent)` }} />

        {/* Corner lotus decorations */}
        <div className="absolute top-8 left-8 opacity-10 z-10">
          <LotusDecoration size={80} color={C.gold} />
        </div>
        <div className="absolute top-8 right-8 opacity-10 z-10" style={{ transform: "scaleX(-1)" }}>
          <LotusDecoration size={80} color={C.gold} />
        </div>

        {/* Divine sparkle particles over the painting */}
        {HERO_PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full z-10"
            style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: p.color }}
            animate={{ y: [0, -25, 0], opacity: [0.05, 0.5, 0.05], scale: [1, 1.8, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Content — centered over the painting */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Sacred Logo mark with golden glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-6"
          >
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full animate-divine-aura"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                boxShadow: `0 0 60px rgba(212,168,67,0.4), 0 0 120px rgba(212,168,67,0.15)`,
              }}
            >
              <span className="text-white font-bold text-3xl font-serif">G</span>
            </div>
            {/* Rotating decorative ring */}
            <div className="absolute -inset-3 rounded-full border border-dashed animate-spin-slow" style={{ borderColor: "rgba(212,168,67,0.2)" }} />
          </motion.div>

          {/* Ornamental divider */}
          <OrnamentDivider light />

          {/* Heading */}
          <motion.h1
            className="text-center text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl px-6 leading-tight"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-white drop-shadow-lg">Students Living the</span>{" "}
            <br className="hidden sm:block" />
            <span className="text-gradient-gold font-serif italic drop-shadow-lg">Bhagavad Gita</span>
            <br />
            <span className="text-white/80 text-2xl sm:text-3xl md:text-4xl drop-shadow-md">in the Heart of New York City</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-6 max-w-xl px-6 text-center text-base sm:text-lg leading-relaxed drop-shadow-sm"
            style={{ color: "rgba(212,168,67,0.6)" }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            A community of young devotees based at ISKCON Brooklyn — studying scripture, chanting on the streets, distributing books, and serving prasadam every single day.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mt-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Link
              href="/programs"
              className="rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-all flex items-center gap-2 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`,
                boxShadow: `0 0 30px rgba(212,168,67,0.35)`,
              }}
            >
              Explore Programs
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <a
              href="#what-we-do"
              className="rounded-full px-8 py-3.5 text-sm font-semibold transition-all hover:bg-white/10"
              style={{ border: `1px solid rgba(212,168,67,0.3)`, color: "rgba(212,168,67,0.7)" }}
            >
              What We Do
            </a>
          </motion.div>

          {/* Stats with ornamental separator */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-0 mt-14"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            {[
              { value: "3x", label: "Gita Classes/Week" },
              { value: "6+", label: "Activities" },
              { value: "ISKCON", label: "Brooklyn Based" },
              { value: "Free", label: "Always" },
            ].map((s, i) => (
              <div key={i} className="text-center px-5 sm:px-7" style={{ borderRight: i < 3 ? "1px solid rgba(212,168,67,0.15)" : "none" }}>
                <p className="text-xl font-bold font-serif drop-shadow-sm" style={{ color: C.gold }}>{s.value}</p>
                <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(212,168,67,0.35)" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "rgba(212,168,67,0.25)" }}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </motion.div>
        </motion.div>

        {/* Bottom gradient transition */}
        <div className="absolute bottom-0 left-0 right-0 h-40 z-10" style={{ background: `linear-gradient(to top, ${C.cream}, transparent)` }} />
        {/* Bottom ornamental border */}
        <div className="absolute bottom-0 left-0 right-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}40, ${C.saffron}40, ${C.gold}40, transparent)` }} />
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — ABOUT / WHO WE ARE                              */}
      {/* ============================================================ */}
      <Section id="about" className="py-24 px-6 relative" style={{ background: C.cream }}>
        {/* Subtle lotus watermark in background */}
        <div className="absolute top-12 right-8 opacity-[0.03]">
          <LotusDecoration size={200} color={C.krishnaBlue} />
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: C.gold }}>Who We Are</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold" style={{ color: C.krishnaBlue }}>
              What is <span className="text-gradient-divine">Gita Life NYC</span>?
            </h2>
            <OrnamentDivider />
            <p className="mt-2 text-gray-500 max-w-lg mx-auto">
              A community of young devotees living, studying, and serving together at ISKCON Brooklyn
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-[15px] leading-[1.9] text-gray-600 mb-5">
                Gita Life NYC is a vibrant community of young students and professionals who live together at the <strong style={{ color: C.krishnaBlue }}>ISKCON Brooklyn temple</strong>. We&rsquo;ve dedicated our lives to exploring the timeless wisdom of the Bhagavad Gita — not just in theory, but through daily practice.
              </p>
              <p className="text-[15px] leading-[1.9] text-gray-600 mb-5">
                From running <strong style={{ color: C.peacock }}>Govinda&rsquo;s restaurant</strong> at ISKCON Brooklyn to taking <strong style={{ color: C.saffron }}>Harinam</strong> to the streets every Sunday, from distributing sacred literature at NYU and across Jersey City to hosting <strong style={{ color: C.gold }}>Bhagavad Gita classes three times a week</strong> — we live and breathe this wisdom.
              </p>
              <p className="text-[15px] leading-[1.9] text-gray-600">
                Whether you&rsquo;re a seasoned practitioner or simply curious about what the Gita has to say about purpose, peace, and happiness — you belong here. Come for a class, stay for the prasadam, leave with a new perspective on life.
              </p>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 mt-6 text-[14px] font-semibold transition-colors"
                style={{ color: C.krishnaBlue }}
              >
                See upcoming programs
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Krishna-Arjuna painting card */}
              <div className="rounded-3xl overflow-hidden shadow-xl relative" style={{ border: `2px solid ${C.gold}20` }}>
                <div className="relative aspect-[3/4] max-h-[360px]">
                  <Image
                    src="/krishna-arjuna-chariot.jpg"
                    alt="Lord Krishna instructing Arjuna on the battlefield of Kurukshetra"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Gradient overlay at bottom for text */}
                  <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: `linear-gradient(to top, ${C.krishnaDeep}E6, transparent)` }} />
                  <p className="absolute bottom-4 left-0 right-0 text-center text-[13px] font-serif italic text-white/80">
                    &ldquo;You have the right to work, but never to the fruit of work.&rdquo;
                  </p>
                </div>
                <div className="p-4 text-center" style={{ background: `linear-gradient(135deg, ${C.krishnaDeep}, ${C.krishnaBlue})` }}>
                  <p className="text-[12px] font-semibold" style={{ color: C.gold }}>
                    — Bhagavad Gita 2.47
                  </p>
                </div>
              </div>

              {/* Home base callout */}
              <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${C.krishnaBlue}08, ${C.krishnaBlue}04)`, border: `1px solid ${C.krishnaBlue}15` }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: `${C.krishnaBlue}12`, color: C.krishnaBlue }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: C.krishnaBlue }}>Based at ISKCON Brooklyn Temple</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">All Gita Life students live and serve at the temple</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 3 — WHAT WE DO (Activities on Krishna Blue)          */}
      {/* ============================================================ */}
      <Section id="what-we-do" className="py-24 px-6 relative overflow-hidden" style={{ background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 50%, #1E3375 100%)` }}>
        {/* Decorative lotus watermarks */}
        <div className="absolute top-0 left-0 opacity-[0.03]">
          <LotusDecoration size={300} color="#fff" />
        </div>
        <div className="absolute bottom-0 right-0 opacity-[0.03]" style={{ transform: "rotate(180deg)" }}>
          <LotusDecoration size={250} color="#fff" />
        </div>
        {/* Ornamental top border */}
        <div className="absolute top-0 left-0 right-0 ornament-border-thick" />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: C.goldLight }}>What We Do</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
              Our <span className="text-gradient-gold">Sacred Activities</span>
            </h2>
            <OrnamentDivider light />
            <p className="mt-2 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
              From daily classes to annual festivals — here&rsquo;s how we live the Gita every day
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACTIVITIES.map((activity, i) => (
              <motion.div
                key={i}
                variants={staggerChild}
                className="group relative rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(212,168,67,0.1)",
                }}
              >
                {/* Accent top border with gradient */}
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${activity.color}, transparent)` }} />

                {/* Corner lotus accent */}
                <div className="absolute -top-4 -right-4 opacity-[0.04]">
                  <LotusDecoration size={60} color={activity.color} />
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${activity.color}15, transparent 70%)` }} />

                {/* Highlight badge */}
                <span
                  className="relative inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4"
                  style={{ background: `${activity.color}20`, color: activity.color }}
                >
                  {activity.highlight}
                </span>

                {/* Icon with glowing border */}
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${activity.color}15`,
                    color: activity.color,
                    border: `1px solid ${activity.color}25`,
                  }}
                >
                  {getActivityIcon(activity.icon)}
                </div>

                <h3 className="relative text-[17px] font-bold text-white/90 mb-2">{activity.title}</h3>
                <p className="relative text-[13px] leading-relaxed text-white/40">{activity.description}</p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>

        {/* Bottom ornamental border */}
        <div className="absolute bottom-0 left-0 right-0 ornament-border-thick" />
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 4 — WEEKLY SCHEDULE                                 */}
      {/* ============================================================ */}
      <Section className="py-24 px-6 relative" style={{ background: C.cream }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}30, transparent)` }} />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: C.gold }}>Join Us</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold" style={{ color: C.krishnaBlue }}>
              Weekly <span className="text-gradient-divine">Schedule</span>
            </h2>
            <OrnamentDivider />
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              All programs are free and open to everyone
            </p>
          </div>

          <StaggerContainer className="space-y-3">
            {WEEKLY_SCHEDULE.map((item, i) => {
              const iconColor = item.icon === "book" ? C.krishnaBlue : item.icon === "music" ? C.gold : C.lotusPink;
              return (
                <motion.div
                  key={i}
                  variants={staggerChild}
                  className="krishna-card group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
                  style={{ background: "rgba(255,255,255,0.7)" }}
                >
                  {/* Day badge */}
                  <div className="shrink-0">
                    <span
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-[13px] font-bold min-w-[100px] text-center"
                      style={{ background: `${C.krishnaBlue}10`, color: C.krishnaBlue }}
                    >
                      {item.day}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                    style={{ background: `${iconColor}12`, color: iconColor }}
                  >
                    {getActivityIcon(item.icon)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold" style={{ color: C.krishnaBlue }}>{item.activity}</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">{item.time}</p>
                  </div>

                  {/* Location */}
                  <div className="shrink-0 flex items-center gap-1.5 text-[12px]" style={{ color: C.peacock }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {item.location}
                  </div>
                </motion.div>
              );
            })}
          </StaggerContainer>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-[13px] font-semibold text-white transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${C.krishnaBlue}, ${C.krishnaLight})`, boxShadow: `0 0 25px ${C.krishnaBlue}30` }}
            >
              View All Programs
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 5 — YOUTUBE VIDEOS                                  */}
      {/* ============================================================ */}
      <Section className="py-24 px-6 relative" style={{ background: "white" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: C.gold }}>Watch</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold" style={{ color: C.krishnaBlue }}>
              See What We&rsquo;re About
            </h2>
            <OrnamentDivider />
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Experience the energy of our community
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {YOUTUBE_VIDEOS.map((video, i) => {
              const { bg } = getCategoryColor(video.category);
              return (
                <motion.div key={i} variants={staggerChild} className="group">
                  <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300" style={{ border: `1px solid ${C.gold}15` }}>
                    <div className="relative aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.id}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                    <div className="p-4" style={{ background: C.cream }}>
                      <h3 className="text-[15px] font-semibold" style={{ color: C.krishnaBlue }}>{video.title}</h3>
                      <span
                        className="inline-flex items-center gap-1 mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${bg}15`, color: bg }}
                      >
                        {video.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </StaggerContainer>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-10"
          >
            <a
              href="https://www.youtube.com/@gitalifenyc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold transition-all hover:scale-105"
              style={{ border: `1px solid ${C.krishnaBlue}20`, color: C.krishnaBlue }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-500">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" fill="currentColor" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
              </svg>
              Subscribe on YouTube
            </a>
          </motion.div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 6 — TESTIMONIALS (Krishna Blue Dark)                */}
      {/* ============================================================ */}
      <Section className="py-24 px-6 relative overflow-hidden" style={{ background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 100%)` }}>
        <div className="absolute top-0 left-0 right-0 ornament-border-thick" />
        {/* Decorative faded lotus */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-[0.02]">
          <LotusDecoration size={400} color="#fff" />
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: C.goldLight }}>Testimonials</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
              What People Are Saying
            </h2>
            <OrnamentDivider light />
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((prog) => {
              const { bg } = getCategoryColor(prog.category);
              return (
                <motion.div
                  key={prog.id}
                  variants={staggerChild}
                  className="rounded-2xl p-6 hover:bg-white/10 transition-colors relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)", border: `1px solid ${C.gold}15` }}
                >
                  {/* Corner accent */}
                  <div className="absolute top-0 left-0 w-12 h-12" style={{ borderTop: `2px solid ${C.gold}25`, borderLeft: `2px solid ${C.gold}25`, borderRadius: "4px 0 0 0" }} />

                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 16 16" fill={C.gold} opacity="0.8">
                        <path d="M8 1l2.24 4.54 5.01.73-3.63 3.53.86 4.99L8 12.27l-4.48 2.52.86-4.99L.75 6.27l5.01-.73L8 1z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[14px] italic leading-relaxed text-white/70 mb-4 font-serif">
                    &ldquo;{prog.testimonial}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: `linear-gradient(135deg, ${bg}, ${C.gold})` }}>
                      {prog.testimonialAuthor?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white/90">{prog.testimonialAuthor}</p>
                      <p className="text-[11px]" style={{ color: `${C.goldLight}60` }}>{prog.category}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </StaggerContainer>
        </div>
        <div className="absolute bottom-0 left-0 right-0 ornament-border-thick" />
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 7 — GET CONNECTED + FOOTER                         */}
      {/* ============================================================ */}
      <section id="get-connected" className="py-24 px-6 relative overflow-hidden" style={{ background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, #080E2A 100%)` }}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.saffron}, ${C.gold}, transparent)` }} />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-[0.02]">
          <LotusDecoration size={300} color="#fff" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: C.goldLight }}>Join Us</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
              Stay Connected
            </h2>
            <OrnamentDivider light />
            <p className="mt-2 max-w-md mx-auto" style={{ color: "rgba(212,168,67,0.35)" }}>
              Get updates on upcoming programs and events
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-xl px-5 py-3.5 text-[14px] text-white outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.gold}20`, }}
            />
            <button
              className="rounded-xl px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:scale-105 shrink-0"
              style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})`, boxShadow: `0 0 25px ${C.gold}25` }}
            >
              Subscribe
            </button>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            {[
              { label: "YouTube", href: "https://www.youtube.com/@gitalifenyc", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-400"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" fill="currentColor" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" /></svg> },
              { label: "Instagram", href: "#", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg> },
              { label: "WhatsApp", href: "#", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg> },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.gold}15`, color: `${C.goldLight}60` }}
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </motion.div>

          {/* Footer */}
          <div className="mt-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}20, transparent)` }} />
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.saffron})` }}>G</div>
              <span className="text-[14px] font-bold text-white/80">
                Gita Life <span style={{ color: C.gold }}>NYC</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Home</Link>
              <Link href="/programs" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Programs</Link>
              <a href="#about" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">About</a>
              <a href="#what-we-do" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Activities</a>
              <a href="https://www.youtube.com/@gitalifenyc" target="_blank" rel="noopener noreferrer" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">YouTube</a>
            </div>

            <p className="text-[11px]" style={{ color: `${C.gold}30` }}>Hare Krishna — Made with devotion at ISKCON Brooklyn</p>
          </div>
        </div>
      </section>
    </div>
  );
}
