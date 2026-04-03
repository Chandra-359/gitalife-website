"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import type { Program } from "@/data/programs";
import { getCategoryColor, getCategoryIcon } from "@/data/programs";
import Navbar from "@/components/Navbar";

/* ------------------------------------------------------------------ */
/*  Pre-computed hero particles                                        */
/* ------------------------------------------------------------------ */
const HERO_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: `${5 + (i * 43) % 90}%`,
  y: `${3 + (i * 31) % 90}%`,
  size: 2 + (i % 5),
  delay: (i * 0.25) % 3,
  duration: 4 + (i % 4) * 2,
  color: i % 3 === 0 ? "rgba(232,117,26,0.5)" : i % 3 === 1 ? "rgba(212,168,67,0.4)" : "rgba(255,215,0,0.3)",
}));

/* ------------------------------------------------------------------ */
/*  Category data for Section 3                                        */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  {
    name: "Kirtan & Prasadam",
    emoji: "\uD83C\uDFB5",
    color: "#E8751A",
    description: "Soul-stirring sacred music and home-cooked vegetarian feasts that bring people together through sound and taste.",
  },
  {
    name: "Wisdom Sessions",
    emoji: "\uD83D\uDCD6",
    color: "#1A5C5E",
    description: "Interactive Bhagavad Gita discussion circles where ancient philosophy meets modern life challenges.",
  },
  {
    name: "Youth Festivals",
    emoji: "\uD83C\uDF89",
    color: "#e94560",
    description: "High-energy gatherings of hundreds of young seekers — live music, inspiring talks, and unforgettable feasts.",
  },
  {
    name: "Retreats",
    emoji: "\u26F0\uFE0F",
    color: "#D4A843",
    description: "Weekend nature immersions with sunrise meditation, campfire kirtan, and deep philosophical exploration.",
  },
];

/* ------------------------------------------------------------------ */
/*  Gallery placeholders                                               */
/* ------------------------------------------------------------------ */
const GALLERY_ITEMS = [
  { emoji: "\uD83C\uDFB5", label: "Kirtan Night", color: "#E8751A", large: true },
  { emoji: "\u26F0\uFE0F", label: "Mountain Retreat", color: "#D4A843", large: false },
  { emoji: "\uD83C\uDF89", label: "Youth Festival", color: "#e94560", large: false },
  { emoji: "\uD83D\uDCD6", label: "Wisdom Circle", color: "#1A5C5E", large: false },
  { emoji: "\uD83C\uDF1F", label: "Community Feast", color: "#E8751A", large: false },
  { emoji: "\uD83C\uDFB6", label: "Campfire Kirtan", color: "#D4A843", large: true },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

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
/*  Stagger container                                                  */
/* ------------------------------------------------------------------ */
function StaggerContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
      }}
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
/*  HOMEPAGE COMPONENT                                                 */
/* ================================================================== */

interface HomePageProps {
  programs: Program[];
}

export default function HomePage({ programs }: HomePageProps) {
  const upcomingPrograms = programs
    .filter((p) => new Date(p.date) > new Date())
    .slice(0, 3);

  const testimonials = programs
    .filter((p) => p.testimonial && p.testimonialAuthor)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <Navbar isHomepage />

      {/* ============================================================ */}
      {/*  SECTION 1 — HERO                                            */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: "#0a0a1a" }}>
        {/* Gradient backdrops */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(232,117,26,0.1) 0%, transparent 50%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 70%, rgba(212,168,67,0.06) 0%, transparent 40%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 60%, rgba(233,69,96,0.04) 0%, transparent 40%)" }} />

        {/* Particles */}
        {HERO_PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: p.color }}
            animate={{ y: [0, -35, 0], opacity: [0.1, 0.7, 0.1], scale: [1, 1.6, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Mandala */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative mb-8"
        >
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <motion.circle cx="60" cy="60" r="55" stroke="#E8751A" strokeWidth="0.8" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.3 }} />
            <motion.circle cx="60" cy="60" r="48" stroke="#D4A843" strokeWidth="0.5" opacity="0.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.6 }} />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              const cx = 60 + Math.cos(a) * 20;
              const cy = 60 + Math.sin(a) * 20;
              return <motion.ellipse key={i} cx={cx} cy={cy} rx="12" ry="6" fill="#E8751A" opacity="0.15" transform={`rotate(${i * 45}, ${cx}, ${cy})`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.08 }} />;
            })}
            <motion.path d="M60 30c-4 8-12 16-12 24a12 12 0 0024 0c0-8-8-16-12-24Z" fill="#E8751A" initial={{ scale: 0 }} animate={{ scale: 1, opacity: 0.9 }} transition={{ delay: 1 }} style={{ transformOrigin: "60px 48px" }} />
            <motion.path d="M60 38c-2.5 5-7 10-7 15a7 7 0 0014 0c0-5-4.5-10-7-15Z" fill="#FFD700" initial={{ scale: 0 }} animate={{ scale: 1, opacity: 0.7 }} transition={{ delay: 1.3 }} style={{ transformOrigin: "60px 48px" }} />
            <motion.ellipse cx="60" cy="52" rx="3" ry="4" fill="#FFF8E1" animate={{ opacity: [0, 0.9, 0.7, 0.9] }} transition={{ duration: 2, delay: 1.5, repeat: Infinity }} />
          </svg>
          <div className="absolute inset-0 -z-10 blur-3xl" style={{ background: "radial-gradient(circle, rgba(232,117,26,0.3) 0%, transparent 60%)" }} />
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="relative text-center text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-3xl px-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Discover Ancient Wisdom in the Heart of{" "}
          <span className="text-[#E8751A]">NYC</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="relative mt-5 max-w-xl px-6 text-center text-base sm:text-lg text-white/50"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          Join a community of young seekers exploring the Bhagavad Gita through kirtan, retreats, wisdom sessions, and deep friendships.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="relative flex flex-wrap items-center justify-center gap-4 mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <Link
            href="/programs"
            className="rounded-full bg-[#E8751A] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(232,117,26,0.3)] hover:bg-[#d4680f] transition-all hover:shadow-[0_0_36px_rgba(232,117,26,0.45)] relative overflow-hidden"
          >
            <span className="absolute inset-0 animate-shimmer" style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)" }} />
            <span className="relative flex items-center gap-2">
              Explore Programs
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </Link>
          <a
            href="#about"
            className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white/70 hover:bg-white/5 hover:text-white transition-all"
          >
            Learn More
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="relative flex items-center gap-8 mt-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          {[{ value: "5+", label: "Programs" }, { value: "NYC", label: "Locations" }, { value: "Free", label: "Always" }].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-bold text-[#E8751A]">{s.value}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-white/20">Scroll</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/20"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to top, #FFF9F0, transparent)" }} />
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — ABOUT / MISSION                                 */}
      {/* ============================================================ */}
      <Section id="about" className="py-24 px-6 bg-[#FFF9F0]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Our Mission</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              What is <span className="text-gradient-saffron">Gita Life</span>?
            </h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              A movement of young seekers in New York City
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-[15px] leading-[1.9] text-gray-600 mb-5">
                Gita Life NYC is a vibrant community where young professionals, students, and curious minds gather to explore the timeless wisdom of the Bhagavad Gita. We believe that 5,000-year-old philosophy has never been more relevant than it is today.
              </p>
              <p className="text-[15px] leading-[1.9] text-gray-600 mb-5">
                Through kirtan evenings, deep discussion circles, weekend retreats, and large-scale youth festivals, we create spaces where ancient wisdom meets modern life — no barriers, no judgment, just genuine connection.
              </p>
              <p className="text-[15px] leading-[1.9] text-gray-600">
                Whether you are a seasoned practitioner or just curious about what the Gita has to say about stress, purpose, and happiness — you belong here.
              </p>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 mt-6 text-[14px] font-semibold text-[#E8751A] hover:text-[#d4680f] transition-colors"
              >
                Explore our programs
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </motion.div>

            {/* Right — Decorative quote card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="rounded-3xl bg-white/70 border border-[#E8751A]/10 p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5" style={{ background: "radial-gradient(circle, #E8751A, transparent)" }} />
                <div className="absolute -top-2 -left-1 text-7xl font-serif text-[#E8751A]/10">&ldquo;</div>
                <p className="relative text-[18px] italic leading-relaxed text-gray-700 font-serif">
                  You have the right to work, but never to the fruit of work. You should never engage in action for the sake of reward, nor should you long for inaction.
                </p>
                <p className="mt-4 text-[13px] font-semibold text-[#E8751A]">
                  — Bhagavad Gita 2.47
                </p>
                {/* Lotus ornament */}
                <div className="mt-6 flex justify-center">
                  <svg width="32" height="32" viewBox="0 0 28 28" fill="none" className="opacity-30">
                    <path d="M14 6c-2 3-5 6-5 9a5 5 0 0010 0c0-3-3-6-5-9Z" fill="#E8751A" />
                    <path d="M14 10c-1.2 2-3 4-3 5.8a3 3 0 006 0c0-1.8-1.8-3.8-3-5.8Z" fill="#D4A843" opacity="0.6" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 3 — PROGRAM CATEGORIES                              */}
      {/* ============================================================ */}
      <Section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">What We Offer</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              Explore Our Programs
            </h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              Four pathways to wisdom and connection
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.name} variants={staggerChild}>
                <Link
                  href="/programs"
                  className="group block rounded-2xl p-6 border border-gray-100 bg-white hover:border-transparent transition-all duration-300 h-full"
                  style={{
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = `0 8px 32px ${cat.color}25`;
                    el.style.borderColor = `${cat.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    el.style.borderColor = "rgb(243 244 246)";
                  }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${cat.color}12` }}
                  >
                    {cat.emoji}
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-2">{cat.name}</h3>
                  <p className="text-[13px] leading-relaxed text-gray-500">{cat.description}</p>
                  <span
                    className="inline-flex items-center gap-1 mt-4 text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: cat.color }}
                  >
                    Learn more
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  </span>
                </Link>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 4 — UPCOMING PROGRAMS PREVIEW                       */}
      {/* ============================================================ */}
      <Section className="py-24 px-6 bg-[#FFF9F0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Coming Up</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              Upcoming Programs
            </h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              Don&rsquo;t miss these transformative experiences
            </p>
          </div>

          <StaggerContainer className="space-y-4">
            {upcomingPrograms.map((prog) => {
              const { bg } = getCategoryColor(prog.category);
              const icon = getCategoryIcon(prog.category);
              return (
                <motion.div key={prog.id} variants={staggerChild}>
                  <Link
                    href="/programs"
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl bg-white/80 border border-gray-100 p-5 hover:shadow-lg hover:border-transparent transition-all duration-300"
                  >
                    {/* Date badge */}
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl text-white shadow-md" style={{ background: bg }}>
                      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                        {new Date(prog.date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-xl font-bold leading-none">
                        {new Date(prog.date).getDate()}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#E8751A] transition-colors">
                          {prog.title}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: `${bg}15`, color: bg }}>
                          {icon} {prog.category}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-gray-500">
                        {formatDate(prog.date)} at {formatTime(prog.date)}
                        {prog.address && <span className="text-gray-300"> &middot; </span>}
                        {prog.address && prog.address.split(",")[0]}
                      </p>
                      <p className="mt-1.5 text-[13px] text-gray-400 line-clamp-1">{prog.description}</p>
                    </div>

                    {/* Arrow */}
                    <div className="shrink-0 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 group-hover:bg-[#E8751A] group-hover:text-white text-gray-400 transition-all">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </StaggerContainer>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 rounded-full bg-[#E8751A] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(232,117,26,0.25)] hover:bg-[#d4680f] hover:shadow-[0_0_36px_rgba(232,117,26,0.4)] transition-all relative overflow-hidden"
            >
              <span className="absolute inset-0 animate-shimmer" style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)" }} />
              <span className="relative">View All Programs</span>
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 5 — HOW IT WORKS                                    */}
      {/* ============================================================ */}
      <Section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Simple Process</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              Three easy steps to transform your perspective
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-[#E8751A]/20 via-[#E8751A]/30 to-[#E8751A]/20" />

            {[
              {
                step: 1,
                title: "Browse",
                desc: "Explore programs on our interactive map across NYC",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                ),
              },
              {
                step: 2,
                title: "RSVP",
                desc: "Reserve your spot in seconds — always free, no strings attached",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ),
              },
              {
                step: 3,
                title: "Experience",
                desc: "Show up, connect with amazing people, and transform your perspective",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <motion.div key={item.step} variants={staggerChild} className="text-center relative">
                <div className="relative inline-flex flex-col items-center">
                  {/* Step number */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8751A] text-white text-[12px] font-bold mb-4 relative z-10">
                    {item.step}
                  </div>
                  {/* Icon circle */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FFF9F0] text-[#E8751A] mb-5">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-gray-500 max-w-[240px] mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 6 — TESTIMONIALS                                    */}
      {/* ============================================================ */}
      <Section className="py-24 px-6" style={{ background: "#1a1a2e" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Testimonials</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
              What People Are Saying
            </h2>
            <p className="mt-3 text-white/40 max-w-md mx-auto">
              Real stories from our community
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((prog, i) => {
              const { bg } = getCategoryColor(prog.category);
              return (
                <motion.div
                  key={prog.id}
                  variants={staggerChild}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-colors"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 16 16" fill="#E8751A" opacity="0.8">
                        <path d="M8 1l2.24 4.54 5.01.73-3.63 3.53.86 4.99L8 12.27l-4.48 2.52.86-4.99L.75 6.27l5.01-.73L8 1z" />
                      </svg>
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-[14px] italic leading-relaxed text-white/70 mb-4">
                    &ldquo;{prog.testimonial}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: bg }}
                    >
                      {prog.testimonialAuthor?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white/90">{prog.testimonialAuthor}</p>
                      <p className="text-[11px] text-white/40">{prog.category}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </StaggerContainer>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 7 — GALLERY / MEDIA                                 */}
      {/* ============================================================ */}
      <Section id="gallery" className="py-24 px-6 bg-[#FFF9F0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Gallery</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              Experience the Energy
            </h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              Moments from our community
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px]">
            {GALLERY_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                variants={staggerChild}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
                  item.large ? "md:col-span-2 md:row-span-1" : ""
                }`}
                style={{
                  background: `linear-gradient(135deg, ${item.color}30 0%, ${item.color}15 50%, #1a1a2e20 100%)`,
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 transition-transform duration-300 group-hover:scale-110">
                  <span className="text-4xl opacity-30">{item.emoji}</span>
                  <span className="text-[12px] font-semibold uppercase tracking-wider opacity-30" style={{ color: item.color }}>{item.label}</span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl" />
              </motion.div>
            ))}
          </StaggerContainer>

          <p className="text-center text-[13px] text-gray-400 mt-6 italic">
            Photos and videos from our events coming soon
          </p>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 8 — GET CONNECTED + FOOTER                         */}
      {/* ============================================================ */}
      <section id="get-connected" className="py-24 px-6" style={{ background: "#0a0a1a" }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Join Us</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
              Stay Connected
            </h2>
            <p className="mt-3 text-white/40 max-w-md mx-auto">
              Get updates on upcoming programs and events
            </p>
          </motion.div>

          {/* Email form */}
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
              className="flex-1 rounded-xl bg-white/10 border border-white/10 px-5 py-3.5 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[#E8751A]/40 focus:ring-1 focus:ring-[#E8751A]/20 transition-all"
            />
            <button className="rounded-xl bg-[#E8751A] px-6 py-3.5 text-[14px] font-semibold text-white hover:bg-[#d4680f] transition-colors shadow-[0_0_20px_rgba(232,117,26,0.25)] relative overflow-hidden shrink-0">
              <span className="absolute inset-0 animate-shimmer" style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)" }} />
              <span className="relative">Subscribe</span>
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
              { label: "Instagram", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg> },
              { label: "YouTube", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" /></svg> },
              { label: "WhatsApp", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg> },
            ].map((social, i) => (
              <button
                key={i}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-[#E8751A]/20 hover:border-[#E8751A]/30 hover:text-[#E8751A] transition-all"
                aria-label={social.label}
              >
                {social.icon}
              </button>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="mt-16 h-px bg-white/10" />

          {/* Footer */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <path d="M14 6c-2 3-5 6-5 9a5 5 0 0010 0c0-3-3-6-5-9Z" fill="#E8751A" opacity="0.85" />
                <path d="M14 10c-1.2 2-3 4-3 5.8a3 3 0 006 0c0-1.8-1.8-3.8-3-5.8Z" fill="#D4A843" opacity="0.7" />
              </svg>
              <span className="text-[14px] font-bold text-white/80">
                Gita Life <span className="text-[#E8751A]">NYC</span>
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Home</Link>
              <Link href="/programs" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Programs</Link>
              <a href="#about" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">About</a>
              <a href="#get-connected" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Contact</a>
            </div>

            <p className="text-[11px] text-white/25">
              Made with love in NYC
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
