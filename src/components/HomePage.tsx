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
    color: "#E8751A",
    icon: "book" as const,
    highlight: "3x per week",
  },
  {
    title: "Harinam Sankirtan",
    description: "Every Sunday we take the holy names to the streets of New York City, sharing the joy of kirtan with everyone we meet.",
    color: "#D4A843",
    icon: "music" as const,
    highlight: "Every Sunday",
  },
  {
    title: "Book Distribution",
    description: "Sharing transcendental literature across Newport, Jersey City, and NYU campuses — bringing ancient wisdom to college students and professionals alike.",
    color: "#1A5C5E",
    icon: "gift" as const,
    highlight: "3 locations",
  },
  {
    title: "Upstate Retreats",
    description: "Weekend getaways in upstate New York for immersive scripture reading, dramatic performances, and cooking prasadam with exalted Vaishnavas visiting ISKCON Brooklyn.",
    color: "#e94560",
    icon: "mountain" as const,
    highlight: "Upstate NY",
  },
  {
    title: "Ratha Yatra",
    description: "Every year we participate in the grand Ratha Yatra festival in New York — one of the biggest celebrations of Lord Jagannath outside of India.",
    color: "#9333ea",
    icon: "festival" as const,
    highlight: "Annual event",
  },
  {
    title: "Govinda's Restaurant",
    description: "Our students run the beloved Govinda's restaurant at ISKCON Brooklyn, serving sanctified vegetarian meals to the community with love and devotion.",
    color: "#2D8F4E",
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

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <Navbar isHomepage />

      {/* ============================================================ */}
      {/*  SECTION 1 — HERO                                            */}
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
          className="relative text-center text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl px-6 leading-tight"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          Students Living the{" "}
          <span className="text-[#E8751A]">Gita</span>
          <br className="hidden sm:block" />
          in the Heart of <span className="text-[#D4A843]">New York City</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="relative mt-6 max-w-xl px-6 text-center text-base sm:text-lg text-white/45 leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          We are a community of young devotees based at ISKCON Brooklyn — studying the Bhagavad Gita, chanting on the streets, distributing books, and serving prasadam every single day.
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
            href="#what-we-do"
            className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            What We Do
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="relative flex flex-wrap items-center justify-center gap-8 sm:gap-10 mt-14"
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
      {/*  SECTION 2 — ABOUT / WHO WE ARE                              */}
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
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Who We Are</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              What is <span className="text-gradient-saffron">Gita Life NYC</span>?
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
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
                Gita Life NYC is a vibrant community of young students and professionals who live together at the ISKCON Brooklyn temple. We&rsquo;ve dedicated our lives to exploring the timeless wisdom of the Bhagavad Gita — not just in theory, but through daily practice.
              </p>
              <p className="text-[15px] leading-[1.9] text-gray-600 mb-5">
                From running <strong className="text-gray-800">Govinda&rsquo;s restaurant</strong> at ISKCON Brooklyn to taking <strong className="text-gray-800">Harinam</strong> to the streets every Sunday, from distributing sacred literature at NYU and across Jersey City to hosting <strong className="text-gray-800">Bhagavad Gita classes three times a week</strong> — we live and breathe this wisdom.
              </p>
              <p className="text-[15px] leading-[1.9] text-gray-600">
                Whether you&rsquo;re a seasoned practitioner or simply curious about what the Gita has to say about purpose, peace, and happiness — you belong here. Come for a class, stay for the prasadam, leave with a new perspective on life.
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
              className="space-y-6"
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

              {/* Home base callout */}
              <div className="rounded-2xl bg-gradient-to-br from-[#1A5C5E]/10 to-[#1A5C5E]/5 border border-[#1A5C5E]/15 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A5C5E]/15 text-[#1A5C5E] shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-800">Based at ISKCON Brooklyn Temple</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">All Gita Life students live and serve at the temple</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 3 — WHAT WE DO (Activities)                         */}
      {/* ============================================================ */}
      <Section id="what-we-do" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">What We Do</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              Our <span className="text-gradient-saffron">Activities</span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              From daily classes to annual festivals — here&rsquo;s how we live the Gita every day
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACTIVITIES.map((activity, i) => (
              <motion.div
                key={i}
                variants={staggerChild}
                className="group relative rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Accent top border */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: activity.color }} />

                {/* Highlight badge */}
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4"
                  style={{ background: `${activity.color}12`, color: activity.color }}
                >
                  {activity.highlight}
                </span>

                {/* Icon */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${activity.color}10`, color: activity.color }}
                >
                  {getActivityIcon(activity.icon)}
                </div>

                <h3 className="text-[17px] font-bold text-gray-900 mb-2">{activity.title}</h3>
                <p className="text-[13px] leading-relaxed text-gray-500">{activity.description}</p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 4 — WEEKLY SCHEDULE                                 */}
      {/* ============================================================ */}
      <Section className="py-24 px-6 bg-[#FFF9F0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#E8751A]">Join Us</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              Weekly <span className="text-gradient-saffron">Schedule</span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              All programs are free and open to everyone
            </p>
          </div>

          <StaggerContainer className="space-y-3">
            {WEEKLY_SCHEDULE.map((item, i) => (
              <motion.div
                key={i}
                variants={staggerChild}
                className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#E8751A]/20 transition-all duration-300"
              >
                {/* Day badge */}
                <div className="shrink-0">
                  <span className="inline-flex items-center justify-center rounded-xl bg-[#E8751A]/10 text-[#E8751A] px-4 py-2 text-[13px] font-bold min-w-[100px] text-center">
                    {item.day}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                  style={{ background: item.icon === "book" ? "#1A5C5E15" : item.icon === "music" ? "#D4A84315" : "#e9456015", color: item.icon === "book" ? "#1A5C5E" : item.icon === "music" ? "#D4A843" : "#e94560" }}
                >
                  {getActivityIcon(item.icon)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-gray-900">{item.activity}</h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">{item.time}</p>
                </div>

                {/* Location */}
                <div className="shrink-0 flex items-center gap-1.5 text-[12px] text-gray-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {item.location}
                </div>
              </motion.div>
            ))}
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
              className="inline-flex items-center gap-2 rounded-full bg-[#E8751A] px-7 py-3 text-[13px] font-semibold text-white hover:bg-[#d4680f] transition-colors shadow-[0_0_20px_rgba(232,117,26,0.2)]"
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
                    <div className="relative aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.id}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
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
      {/*  SECTION 6 — TESTIMONIALS                                    */}
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

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Home</Link>
              <Link href="/programs" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Programs</Link>
              <a href="#about" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">About</a>
              <a href="#what-we-do" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Activities</a>
              <a href="https://www.youtube.com/@gitalifenyc" target="_blank" rel="noopener noreferrer" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">YouTube</a>
            </div>

            <p className="text-[11px] text-white/25">Made with love at ISKCON Brooklyn</p>
          </div>
        </div>
      </section>
    </div>
  );
}
