"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Program } from "@/data/programs";
import { getCategoryColor, getCategoryIcon, VOLUNTEER_COLOR } from "@/data/programs";
import RsvpModal from "@/components/RsvpModal";

/* ------------------------------------------------------------------ */
/*  Date formatting helpers                                            */
/* ------------------------------------------------------------------ */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Compute countdown to the event */
function getCountdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 22, stiffness: 200 },
  },
};

/* ------------------------------------------------------------------ */
/*  Section divider                                                    */
/* ------------------------------------------------------------------ */
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E8751A]/15 to-transparent" />
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8860B]/50">
        {title}
      </span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#E8751A]/15 to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Countdown box                                                      */
/* ------------------------------------------------------------------ */
function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14 rounded-xl bg-white/80 border border-[#E8751A]/10 flex items-center justify-center shadow-sm">
        <span className="text-xl font-bold text-gray-900 tabular-nums">{value}</span>
      </div>
      <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface ProgramDetailProps {
  program: Program;
  onBack: () => void;
}

export default function ProgramDetail({ program, onBack }: ProgramDetailProps) {
  const isVolunteer = program.type === "volunteer";
  const { bg, glow } = isVolunteer ? VOLUNTEER_COLOR : getCategoryColor(program.category);
  const icon = getCategoryIcon(program.category);
  const [showRsvp, setShowRsvp] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown(program.date));

  // Capacity
  const rsvpCount = program.rsvpCount ?? 0;
  const capacity = program.capacity;
  const spotsLeft = capacity ? capacity - rsvpCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  // Live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(program.date));
    }, 60000);
    return () => clearInterval(timer);
  }, [program.date]);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* ---- Sticky back header ---- */}
        <div className="sticky top-0 z-20 flex items-center gap-2 px-5 py-3 bg-[#FFF9F0]/90 backdrop-blur-xl border-b border-[#E8751A]/10">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 border border-gray-200 group-hover:border-gray-300 group-hover:bg-white transition-all shadow-sm">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            All Programs
          </button>
        </div>

        {/* ---- Scrollable content ---- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-5 pb-32"
          >
            {/* Hero image / gradient */}
            <motion.div
              variants={sectionVariants}
              className="relative -mx-5 h-56 overflow-hidden"
            >
              {program.imageUrl ? (
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="h-full w-full relative"
                  style={{
                    background: `linear-gradient(135deg, ${bg}50 0%, ${bg}20 30%, #1a1a2e 100%)`,
                  }}
                >
                  {/* Decorative pattern overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, ${bg} 1px, transparent 1px), radial-gradient(circle at 80% 20%, ${bg} 1px, transparent 1px), radial-gradient(circle at 60% 80%, ${bg} 1px, transparent 1px)`,
                    backgroundSize: "60px 60px, 80px 80px, 40px 40px",
                  }} />
                  {/* Large centered icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-20">{icon}</span>
                  </div>
                </div>
              )}
              {/* Bottom gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FFF9F0] to-transparent" />

              {/* Category badge on image */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", damping: 20 }}
                className="absolute bottom-4 left-5 flex items-center gap-2"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-white shadow-lg"
                  style={{ background: bg, boxShadow: `0 0 20px ${glow}` }}
                >
                  {icon}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg"
                  style={{ background: `${bg}dd`, boxShadow: `0 4px 12px ${glow}` }}
                >
                  {program.category}
                </span>
                {isVolunteer && (
                  <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
                    Volunteer
                  </span>
                )}
              </motion.div>
            </motion.div>

            {/* Title & subtitle */}
            <motion.div variants={sectionVariants} className="mt-4">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {program.title}
              </h2>
              {program.subtitle && (
                <p className="mt-1.5 text-[15px] italic text-[#8B6914]/80">
                  &ldquo;{program.subtitle}&rdquo;
                </p>
              )}
            </motion.div>

            {/* Info chips */}
            <motion.div variants={sectionVariants} className="mt-5 flex flex-wrap gap-2">
              {[
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M2 7h12" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  ),
                  text: formatDate(program.date),
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  ),
                  text: formatTime(program.date),
                },
                ...(program.duration
                  ? [{
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                          <path d="M8 2v4l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
                        </svg>
                      ),
                      text: program.duration,
                    }]
                  : []),
              ].map((chip, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-gray-200/80 px-3.5 py-2 text-[12px] font-medium text-gray-700 shadow-sm"
                >
                  <span className="text-gray-400">{chip.icon}</span>
                  {chip.text}
                </motion.span>
              ))}
            </motion.div>

            {/* Address */}
            {program.address && (
              <motion.a
                variants={sectionVariants}
                href={`https://maps.google.com/?q=${encodeURIComponent(program.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-start gap-2.5 text-[13px] text-gray-600 hover:text-[#E8751A] transition-colors group rounded-lg p-2 -ml-2 hover:bg-[#E8751A]/5"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-gray-400 group-hover:text-[#E8751A] transition-colors">
                  <path d="M8 1C5.24 1 3 3.13 3 5.75 3 9.5 8 15 8 15s5-5.5 5-9.25C13 3.13 10.76 1 8 1Z" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="8" cy="5.75" r="1.75" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span className="group-hover:underline underline-offset-2">{program.address}</span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <path d="M6 3h7v7M13 3L6 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.a>
            )}

            {/* Level */}
            {program.level && (
              <motion.div variants={sectionVariants} className="mt-3">
                <span className="inline-flex items-center gap-2 text-[12px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-3 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  {program.level}
                </span>
              </motion.div>
            )}

            {/* Capacity bar */}
            {capacity && (
              <motion.div variants={sectionVariants} className="mt-4">
                <div className="rounded-xl bg-white/80 border border-gray-200/60 px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-semibold text-gray-700">
                      {isFull ? "Event Full" : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
                    </span>
                    <span className="text-[11px] text-gray-400">{rsvpCount} / {capacity} registered</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((rsvpCount / capacity) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: isFull
                          ? "#dc2626"
                          : rsvpCount / capacity > 0.8
                            ? `linear-gradient(90deg, ${bg}, #dc2626)`
                            : bg,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Countdown timer */}
            {countdown && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="Starts In" />
                <div className="flex justify-center gap-4">
                  <CountdownUnit value={countdown.days} label="Days" />
                  <div className="flex items-center text-gray-300 text-xl font-light pt-[-8px]">:</div>
                  <CountdownUnit value={countdown.hours} label="Hours" />
                  <div className="flex items-center text-gray-300 text-xl font-light pt-[-8px]">:</div>
                  <CountdownUnit value={countdown.minutes} label="Mins" />
                </div>
              </motion.div>
            )}

            {/* Description */}
            <motion.div variants={sectionVariants} className="mt-6">
              <p className="text-[14px] leading-[1.8] text-gray-600">
                {program.description}
              </p>
            </motion.div>

            {/* What to Expect */}
            {program.whatToExpect && program.whatToExpect.length > 0 && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="What to Expect" />
                <div className="space-y-3">
                  {program.whatToExpect.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="flex items-start gap-3 text-[13px] text-gray-600 rounded-lg p-2.5 hover:bg-white/50 transition-colors"
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: bg }}
                      >
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Why Attend */}
            {program.whyAttend && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="Why Attend" />
                <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: `${bg}08` }}>
                  <div className="absolute top-3 left-4 text-4xl opacity-10" style={{ color: bg }}>&ldquo;</div>
                  <p className="relative text-[14px] leading-[1.8] text-gray-600 pl-4">
                    {program.whyAttend}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Today's Session — Lecture Topic */}
            {program.lectureTopic && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="Today&rsquo;s Session" />
                <div className="rounded-2xl bg-white/80 border border-[#D4A843]/20 p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5" style={{
                    background: `radial-gradient(circle, ${bg}, transparent)`,
                  }} />
                  <p className="text-[16px] font-semibold text-gray-800 italic leading-relaxed">
                    &ldquo;{program.lectureTopic}&rdquo;
                  </p>
                  {program.gitaReference && (
                    <p className="mt-2 text-[12px] font-medium" style={{ color: bg }}>
                      {program.gitaReference}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Speaker */}
            {program.speakerName && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="Speaker" />
                <div className="flex gap-4 rounded-2xl bg-white/80 border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                  {/* Speaker avatar */}
                  <div
                    className="h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${bg}, ${bg}88)`, boxShadow: `0 4px 16px ${glow}` }}
                  >
                    {program.speakerImageUrl ? (
                      <img
                        src={program.speakerImageUrl}
                        alt={program.speakerName}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      program.speakerName.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-gray-800">
                      {program.speakerName}
                    </p>
                    {program.speakerTitle && (
                      <p className="text-[12px] font-medium mt-0.5" style={{ color: bg }}>
                        {program.speakerTitle}
                      </p>
                    )}
                    {program.speakerBio && (
                      <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
                        {program.speakerBio}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* What You'll Take Home */}
            {program.whatYouGet && program.whatYouGet.length > 0 && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="What You&rsquo;ll Take Home" />
                <div className="grid grid-cols-1 gap-2">
                  {program.whatYouGet.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="flex items-start gap-3 text-[13px] text-gray-600 rounded-xl p-3 bg-white/50 border border-white/80 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" style={{ color: "#10b981" }}>
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                        <path d="M4.5 8.5l2 2L11.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="leading-relaxed">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* What to Bring */}
            {program.whatToBring && (
              <motion.div variants={sectionVariants} className="mt-5">
                <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/60 border border-[#E8751A]/10 px-5 py-4">
                  <span className="text-[18px] mt-0.5">🎒</span>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-wider text-[#B8860B]/60 mb-1">What to bring</p>
                    <p className="text-[13px] text-gray-600 leading-relaxed">
                      {program.whatToBring}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Gallery */}
            {program.galleryUrls && program.galleryUrls.length > 0 && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="Past Sessions" />
                <div className="flex gap-2.5 overflow-x-auto snap-x pb-2">
                  {program.galleryUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Past session ${i + 1}`}
                      className="h-28 w-36 shrink-0 rounded-xl object-cover snap-start shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Testimonial */}
            {program.testimonial && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="What Others Say" />
                <div className="rounded-2xl bg-white/70 border border-gray-200/60 p-5 relative overflow-hidden shadow-sm">
                  {/* Decorative quote mark */}
                  <div className="absolute -top-2 -left-1 text-6xl font-serif opacity-[0.06]" style={{ color: bg }}>&ldquo;</div>
                  <div className="relative">
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill={bg} opacity={0.7}>
                          <path d="M8 1l2.24 4.54 5.01.73-3.63 3.53.86 4.99L8 12.27l-4.48 2.52.86-4.99L.75 6.27l5.01-.73L8 1z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-[14px] italic leading-relaxed text-gray-600">
                      &ldquo;{program.testimonial}&rdquo;
                    </p>
                    {program.testimonialAuthor && (
                      <p className="mt-3 text-[12px] font-semibold" style={{ color: bg }}>
                        — {program.testimonialAuthor}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ---- Sticky RSVP button ---- */}
        <div className="sticky bottom-0 z-20 px-5 py-4 bg-gradient-to-t from-[#FFF9F0] via-[#FFF9F0] to-[#FFF9F0]/0">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: `0 8px 40px ${glow}` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowRsvp(true)}
            className="w-full rounded-2xl py-4 text-[15px] font-bold uppercase tracking-wider text-white shadow-xl transition-all relative overflow-hidden group animate-rsvp-pulse"
            style={{
              background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
              boxShadow: `0 4px 24px ${glow}`,
            }}
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 pointer-events-none">
              <span
                className="absolute inset-0 animate-shimmer"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
                }}
              />
            </span>
            <span className="relative flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isFull ? "Join Waitlist" : isVolunteer ? "Sign Up to Volunteer" : "RSVP — Join This Program"}
            </span>
          </motion.button>

          {/* Subtle reassurance text */}
          <p className="text-center text-[11px] text-gray-400 mt-2">
            Free to attend · No commitment required
          </p>
        </div>
      </div>

      {/* RSVP Modal */}
      {showRsvp && (
        <RsvpModal
          program={program}
          onClose={() => setShowRsvp(false)}
        />
      )}
    </>
  );
}
