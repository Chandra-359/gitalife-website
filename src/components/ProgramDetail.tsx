"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Program } from "@/data/programs";
import { getCategoryColor, getCategoryIcon } from "@/data/programs";
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

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 24, stiffness: 200 },
  },
};

/* ------------------------------------------------------------------ */
/*  Section divider with lotus center                                  */
/* ------------------------------------------------------------------ */
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-3">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#E8751A]/20" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B8860B]/50">
        {title}
      </span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#E8751A]/20" />
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
  const { bg, glow } = getCategoryColor(program.category);
  const icon = getCategoryIcon(program.category);
  const [showRsvp, setShowRsvp] = useState(false);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* ---- Sticky back header ---- */}
        <div className="sticky top-0 z-20 flex items-center gap-2 px-5 py-3 bg-[#FFF9F0]/90 backdrop-blur-md border-b border-[#E8751A]/10">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Programs
          </button>
        </div>

        {/* ---- Scrollable content ---- */}
        <div className="flex-1 overflow-y-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-5 pb-28"
          >
            {/* Hero image / placeholder */}
            <motion.div
              variants={sectionVariants}
              className="relative -mx-5 h-48 overflow-hidden"
            >
              {program.imageUrl ? (
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background: `linear-gradient(135deg, ${bg}40 0%, #1a1a2e 80%)`,
                  }}
                />
              )}
              {/* Bottom gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FFF9F0] to-transparent" />

              {/* Category badge on image */}
              <div className="absolute bottom-3 left-5 flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-white shadow-lg"
                  style={{ background: bg, boxShadow: `0 0 12px ${glow}` }}
                >
                  {icon}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white"
                  style={{ background: `${bg}cc` }}
                >
                  {program.category}
                </span>
              </div>
            </motion.div>

            {/* Title & subtitle */}
            <motion.div variants={sectionVariants} className="mt-3">
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {program.title}
              </h2>
              {program.subtitle && (
                <p className="mt-1 text-[14px] italic text-[#8B6914]">
                  &ldquo;{program.subtitle}&rdquo;
                </p>
              )}
            </motion.div>

            {/* Info chips */}
            <motion.div variants={sectionVariants} className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-700">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-gray-400">
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M2 7h12" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                {formatDate(program.date)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-700">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-gray-400">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                {formatTime(program.date)}
              </span>
              {program.duration && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-700">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-gray-400">
                    <path d="M8 2v4l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
                  </svg>
                  {program.duration}
                </span>
              )}
            </motion.div>

            {/* Address */}
            {program.address && (
              <motion.a
                variants={sectionVariants}
                href={`https://maps.google.com/?q=${encodeURIComponent(program.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-start gap-2 text-[13px] text-gray-600 hover:text-[#E8751A] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-gray-400">
                  <path d="M8 1C5.24 1 3 3.13 3 5.75 3 9.5 8 15 8 15s5-5.5 5-9.25C13 3.13 10.76 1 8 1Z" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="8" cy="5.75" r="1.75" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                {program.address}
              </motion.a>
            )}

            {/* Level */}
            {program.level && (
              <motion.div variants={sectionVariants} className="mt-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {program.level}
                </span>
              </motion.div>
            )}

            {/* Description */}
            <motion.p
              variants={sectionVariants}
              className="mt-4 text-[14px] leading-relaxed text-gray-600"
            >
              {program.description}
            </motion.p>

            {/* What to Expect */}
            {program.whatToExpect && program.whatToExpect.length > 0 && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="What to Expect" />
                <ul className="space-y-2">
                  {program.whatToExpect.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-600">
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: bg }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Why Attend */}
            {program.whyAttend && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="Why Attend" />
                <p className="text-[13px] leading-relaxed text-gray-600">
                  {program.whyAttend}
                </p>
              </motion.div>
            )}

            {/* Today's Session — Lecture Topic */}
            {program.lectureTopic && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="Today&rsquo;s Session" />
                <div className="rounded-xl bg-white/70 border border-[#D4A843]/20 p-4">
                  <p className="text-[15px] font-semibold text-gray-800 italic">
                    &ldquo;{program.lectureTopic}&rdquo;
                  </p>
                  {program.gitaReference && (
                    <p className="mt-1 text-[12px] text-[#B8860B]">
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
                <div className="flex gap-3 rounded-xl bg-white/70 border border-gray-200 p-4">
                  {/* Speaker avatar */}
                  <div
                    className="h-14 w-14 shrink-0 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ background: `linear-gradient(135deg, ${bg}, ${bg}88)` }}
                  >
                    {program.speakerImageUrl ? (
                      <img
                        src={program.speakerImageUrl}
                        alt={program.speakerName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      program.speakerName.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-800">
                      {program.speakerName}
                    </p>
                    {program.speakerTitle && (
                      <p className="text-[12px] text-gray-500">
                        {program.speakerTitle}
                      </p>
                    )}
                    {program.speakerBio && (
                      <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">
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
                <ul className="space-y-2">
                  {program.whatYouGet.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-600">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" style={{ color: bg }}>
                        <path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* What to Bring */}
            {program.whatToBring && (
              <motion.div variants={sectionVariants} className="mt-4">
                <div className="flex items-start gap-2 rounded-lg bg-[#FFF3E0]/60 border border-[#E8751A]/10 px-4 py-3">
                  <span className="text-[14px]">🎒</span>
                  <p className="text-[13px] text-gray-600">
                    <span className="font-medium text-gray-700">What to bring: </span>
                    {program.whatToBring}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Gallery */}
            {program.galleryUrls && program.galleryUrls.length > 0 && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="Past Sessions" />
                <div className="flex gap-2 overflow-x-auto snap-x pb-2">
                  {program.galleryUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Past session ${i + 1}`}
                      className="h-24 w-32 shrink-0 rounded-lg object-cover snap-start"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Testimonial */}
            {program.testimonial && (
              <motion.div variants={sectionVariants}>
                <SectionDivider title="What Others Say" />
                <div className="border-l-2 border-[#D4A843]/40 pl-4 py-1">
                  <p className="text-[13px] italic leading-relaxed text-gray-600">
                    &ldquo;{program.testimonial}&rdquo;
                  </p>
                  {program.testimonialAuthor && (
                    <p className="mt-1.5 text-[12px] font-medium text-[#B8860B]">
                      — {program.testimonialAuthor}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ---- Sticky RSVP button ---- */}
        <div className="sticky bottom-0 z-20 px-5 py-4 bg-gradient-to-t from-[#FFF3E0] via-[#FFF3E0] to-[#FFF3E0]/0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowRsvp(true)}
            className="w-full rounded-xl py-3.5 text-[14px] font-bold uppercase tracking-wider text-white shadow-lg transition-shadow hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
              boxShadow: `0 4px 24px ${glow}`,
            }}
          >
            RSVP — Join This Program
          </motion.button>
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
