"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";
import Navbar from "@/components/Navbar";

/* ------------------------------------------------------------------ */
/*  Hero particles                                                     */
/* ------------------------------------------------------------------ */
const HERO_PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: `${5 + (i * 43) % 90}%`,
  y: `${3 + (i * 31) % 90}%`,
  size: 2 + (i % 4),
  delay: (i * 0.3) % 3,
  duration: 5 + (i % 4) * 2,
  color: i % 3 === 0 ? "rgba(232,117,26,0.4)" : i % 3 === 1 ? "rgba(212,168,67,0.3)" : "rgba(255,215,0,0.2)",
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

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <Navbar isHomepage />

      {/* ============================================================ */}
      {/*  SECTION 1 — HERO (clean, no mandala)                        */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: "#0a0a1a" }}>
        {/* Gradient backdrops */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(232,117,26,0.08) 0%, transparent 50%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 70%, rgba(212,168,67,0.05) 0%, transparent 40%)" }} />

        {/* Particles */}
        {HERO_PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: p.color }}
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.6, 0.1], scale: [1, 1.5, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, #E8751A, #d4680f)", boxShadow: "0 0 60px rgba(232,117,26,0.3)" }}
        >
          <span className="text-white font-bold text-2xl">G</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="relative text-center text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-3xl px-6 leading-tight"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          Discover Ancient Wisdom{" "}
          <br className="hidden sm:block" />
          in the Heart of <span className="text-[#E8751A]">NYC</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="relative mt-6 max-w-lg px-6 text-center text-base sm:text-lg text-white/45 leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          A community of young seekers exploring the Bhagavad Gita through kirtan, retreats, wisdom sessions, and deep friendships.
        </motion.p>

        {/* CTA */}
        <motion.div
          className="relative flex flex-wrap items-center justify-center gap-4 mt-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Link
            href="/programs"
            className="rounded-full bg-[#E8751A] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(232,117,26,0.3)] hover:bg-[#d4680f] transition-all hover:shadow-[0_0_36px_rgba(232,117,26,0.45)] flex items-center gap-2"
          >
            Explore Programs
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <a
            href="#about"
            className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            Learn More
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="relative flex items-center gap-10 mt-14"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          {[{ value: "5+", label: "Programs" }, { value: "NYC", label: "Citywide" }, { value: "Free", label: "Always" }].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-bold text-[#E8751A]">{s.value}</p>
              <p className="text-[10px] text-white/25 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/15"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
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
                Whether you are a seasoned practitioner or simply curious about what the Gita has to say about stress, purpose, and happiness — you belong here.
              </p>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 mt-6 text-[14px] font-semibold text-[#E8751A] hover:text-[#d4680f] transition-colors"
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
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 3 — YOUTUBE VIDEOS                                  */}
      {/* ============================================================ */}
      <Section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Watch</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              See What We&rsquo;re About
            </h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              Experience the energy of our community
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {YOUTUBE_VIDEOS.map((video, i) => {
              const { bg } = getCategoryColor(video.category);
              return (
                <motion.div key={i} variants={staggerChild} className="group">
                  <div className="rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300">
                    {/* Video embed */}
                    <div className="relative aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.id}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                    {/* Video info */}
                    <div className="p-4">
                      <h3 className="text-[15px] font-semibold text-gray-900">{video.title}</h3>
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

          {/* Channel link */}
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
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
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
      {/*  SECTION 4 — HOW IT WORKS                                    */}
      {/* ============================================================ */}
      <Section className="py-24 px-6 bg-[#FFF9F0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Simple Process</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-[#E8751A]/20 via-[#E8751A]/30 to-[#E8751A]/20" />

            {[
              { step: 1, title: "Browse", desc: "Explore programs on our interactive map across NYC", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg> },
              { step: 2, title: "RSVP", desc: "Reserve your spot in seconds — always free", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg> },
              { step: 3, title: "Experience", desc: "Show up, connect, and transform your perspective", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg> },
            ].map((item) => (
              <motion.div key={item.step} variants={staggerChild} className="text-center relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8751A] text-white text-[12px] font-bold mb-4 mx-auto relative z-10">
                  {item.step}
                </div>
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-[#E8751A] mb-5 mx-auto shadow-sm border border-gray-100">
                  {item.icon}
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-gray-500 max-w-[240px] mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 5 — TESTIMONIALS                                    */}
      {/* ============================================================ */}
      <Section className="py-24 px-6" style={{ background: "#1a1a2e" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Testimonials</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
              What People Are Saying
            </h2>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((prog) => {
              const { bg } = getCategoryColor(prog.category);
              return (
                <motion.div
                  key={prog.id}
                  variants={staggerChild}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 16 16" fill="#E8751A" opacity="0.8">
                        <path d="M8 1l2.24 4.54 5.01.73-3.63 3.53.86 4.99L8 12.27l-4.48 2.52.86-4.99L.75 6.27l5.01-.73L8 1z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[14px] italic leading-relaxed text-white/70 mb-4">
                    &ldquo;{prog.testimonial}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: bg }}>
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
      {/*  SECTION 6 — GALLERY / MEDIA                                 */}
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
                className={`group relative rounded-2xl overflow-hidden cursor-pointer ${item.large ? "md:col-span-2" : ""}`}
                style={{ background: `linear-gradient(135deg, ${item.color}30 0%, ${item.color}15 50%, #1a1a2e20 100%)` }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 transition-transform duration-300 group-hover:scale-110">
                  <span className="text-4xl opacity-30">{item.emoji}</span>
                  <span className="text-[12px] font-semibold uppercase tracking-wider opacity-30" style={{ color: item.color }}>{item.label}</span>
                </div>
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
      {/*  SECTION 7 — GET CONNECTED + FOOTER                         */}
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
            <button className="rounded-xl bg-[#E8751A] px-6 py-3.5 text-[14px] font-semibold text-white hover:bg-[#d4680f] transition-colors shadow-[0_0_20px_rgba(232,117,26,0.25)] shrink-0">
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
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-[#E8751A]/20 hover:border-[#E8751A]/30 hover:text-[#E8751A] transition-all"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </motion.div>

          {/* Footer */}
          <div className="mt-16 h-px bg-white/10" />
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #E8751A, #d4680f)" }}>G</div>
              <span className="text-[14px] font-bold text-white/80">
                Gita Life <span className="text-[#E8751A]">NYC</span>
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Home</Link>
              <Link href="/programs" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Programs</Link>
              <a href="#about" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">About</a>
              <a href="https://www.youtube.com/@gitalifenyc" target="_blank" rel="noopener noreferrer" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">YouTube</a>
            </div>

            <p className="text-[11px] text-white/25">Made with love in NYC</p>
          </div>
        </div>
      </section>
    </div>
  );
}
