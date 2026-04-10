"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Program } from "@/data/programs";
import { getCategoryColor, getCategoryIcon, VOLUNTEER_COLOR } from "@/data/programs";
import RsvpModal from "@/components/RsvpModal";

interface StreamDetailModalProps {
  program: Program;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCountdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

export default function StreamDetailModal({ program, onClose }: StreamDetailModalProps) {
  const isVolunteer = program.type === "volunteer";
  const { bg, glow } = isVolunteer ? VOLUNTEER_COLOR : getCategoryColor(program.category);
  const icon = getCategoryIcon(program.category);
  const [showRsvp, setShowRsvp] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown(program.date));

  const rsvpCount = program.rsvpCount ?? 0;
  const capacity = program.capacity;
  const spotsLeft = capacity ? capacity - rsvpCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const fillPercent = capacity ? Math.min((rsvpCount / capacity) * 100, 100) : 0;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Live countdown
  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown(program.date)), 60000);
    return () => clearInterval(timer);
  }, [program.date]);

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal container */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-3xl mx-4 my-8 md:my-12 rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#141428" }}
          >
            {/* ====== TRAILER / HERO SECTION ====== */}
            <div className="relative w-full aspect-video max-h-[400px] overflow-hidden">
              {/* Video or Image */}
              {program.videoUrl ? (
                <video
                  src={program.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : program.imageUrl ? (
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at center, ${bg}40 0%, #141428 70%)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[120px] opacity-10">{icon}</span>
                  </div>
                </div>
              )}

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141428] via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#141428] to-transparent" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white backdrop-blur-sm transition-all"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>

              {/* Title overlay at bottom of trailer */}
              <div className="absolute bottom-4 left-6 right-16">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: `${bg}cc` }}
                  >
                    <span className="text-xs">{icon}</span>
                    {program.category}
                  </span>
                  {program.featured && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-[#D4A843] to-[#E8751A] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                      Featured
                    </span>
                  )}
                  {isVolunteer && (
                    <span className="rounded-md bg-emerald-500/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                      Volunteer
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {program.title}
                </h2>
              </div>
            </div>

            {/* ====== DETAILS SECTION ====== */}
            <div className="px-6 pb-8">
              {/* Subtitle */}
              {program.subtitle && (
                <p className="text-[15px] italic text-white/40 mt-2 mb-4 font-serif">
                  &ldquo;{program.subtitle}&rdquo;
                </p>
              )}

              {/* Info row */}
              <div className="flex flex-wrap items-center gap-3 mt-4 mb-5">
                {[
                  {
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M2 7h12" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    ),
                    text: formatDate(program.date),
                  },
                  {
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    ),
                    text: formatTime(program.date),
                  },
                  ...(program.duration
                    ? [{ icon: <span className="text-[12px]">&#9202;</span>, text: program.duration }]
                    : []),
                  ...(program.level
                    ? [{ icon: <span className="text-[12px]">&#9733;</span>, text: program.level }]
                    : []),
                ].map((chip, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[12px] text-white/60 font-medium"
                  >
                    <span className="text-white/30">{chip.icon}</span>
                    {chip.text}
                  </span>
                ))}
              </div>

              {/* Address */}
              {program.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(program.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] text-white/40 hover:text-white/70 transition-colors mb-5 group"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-white/30 group-hover:text-white/60 transition-colors">
                    <path d="M8 1C5.24 1 3 3.13 3 5.75 3 9.5 8 15 8 15s5-5.5 5-9.25C13 3.13 10.76 1 8 1Z" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="5.75" r="1.75" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span className="group-hover:underline underline-offset-2">
                    {program.venueName ? `${program.venueName} · ` : ""}
                    {program.address}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M6 3h7v7M13 3L6 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}

              {/* Countdown timer */}
              {countdown && (
                <div className="flex items-center gap-4 mb-6 py-4 border-t border-b border-white/5">
                  <span className="text-[11px] text-white/30 font-bold uppercase tracking-widest">Starts in</span>
                  <div className="flex items-center gap-2">
                    {[
                      { val: countdown.days, label: "d" },
                      { val: countdown.hours, label: "h" },
                      { val: countdown.minutes, label: "m" },
                    ].map((unit, i) => (
                      <span key={i} className="flex items-center gap-0.5">
                        <span
                          className="inline-flex h-9 w-10 items-center justify-center rounded-lg text-[16px] font-bold text-white tabular-nums"
                          style={{ backgroundColor: `${bg}20` }}
                        >
                          {unit.val}
                        </span>
                        <span className="text-[10px] text-white/30 font-medium">{unit.label}</span>
                        {i < 2 && <span className="text-white/20 mx-0.5">:</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity bar */}
              {capacity && (
                <div className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: isFull ? "#dc2626" : spotsLeft !== null && spotsLeft <= 10 ? bg : "rgba(255,255,255,0.5)" }}
                    >
                      {isFull ? "Event Full" : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
                    </span>
                    <span className="text-[11px] text-white/30">{rsvpCount} / {capacity}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fillPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: isFull
                          ? "#dc2626"
                          : fillPercent > 80
                            ? `linear-gradient(90deg, ${bg}, #dc2626)`
                            : bg,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <p className="text-[14px] leading-[1.9] text-white/50">
                  {program.description}
                </p>
              </div>

              {/* Speaker */}
              {program.speakerName && (
                <div className="mb-6 rounded-xl bg-white/5 border border-white/5 p-5 flex gap-4">
                  <div
                    className="h-14 w-14 shrink-0 rounded-xl flex items-center justify-center text-white text-lg font-bold overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${bg}, ${bg}88)` }}
                  >
                    {program.speakerImageUrl ? (
                      <img
                        src={program.speakerImageUrl}
                        alt={program.speakerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      program.speakerName.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-white/90">{program.speakerName}</p>
                    {program.speakerTitle && (
                      <p className="text-[12px] font-medium mt-0.5" style={{ color: bg }}>
                        {program.speakerTitle}
                      </p>
                    )}
                    {program.speakerBio && (
                      <p className="mt-2 text-[12px] leading-relaxed text-white/40">{program.speakerBio}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Lecture topic */}
              {program.lectureTopic && (
                <div className="mb-6 rounded-xl border border-white/5 p-5 relative overflow-hidden" style={{ background: `${bg}08` }}>
                  <div className="absolute top-2 right-4 text-5xl opacity-5" style={{ color: bg }}>&ldquo;</div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/25 mb-2">Today&rsquo;s Session</p>
                  <p className="text-[15px] font-semibold text-white/80 italic leading-relaxed">
                    &ldquo;{program.lectureTopic}&rdquo;
                  </p>
                  {program.gitaReference && (
                    <p className="mt-2 text-[12px] font-medium" style={{ color: bg }}>{program.gitaReference}</p>
                  )}
                </div>
              )}

              {/* What to Expect */}
              {program.whatToExpect && program.whatToExpect.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/25 mb-3">What to Expect</p>
                  <div className="space-y-2">
                    {program.whatToExpect.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 text-[13px] text-white/50 rounded-lg p-2.5 hover:bg-white/5 transition-colors">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: bg }}
                        >
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What You'll Take Home */}
              {program.whatYouGet && program.whatYouGet.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/25 mb-3">What You&rsquo;ll Take Home</p>
                  <div className="grid grid-cols-1 gap-2">
                    {program.whatYouGet.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 text-[13px] text-white/50 rounded-lg p-3 bg-white/[0.03] border border-white/5">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" style={{ color: "#10b981" }}>
                          <path d="M4.5 8.5l2 2L11.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {program.galleryUrls && program.galleryUrls.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/25 mb-3">Past Sessions</p>
                  <div className="flex gap-2.5 overflow-x-auto snap-x pb-2 scrollbar-hide">
                    {program.galleryUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Past session ${i + 1}`}
                        className="h-28 w-40 shrink-0 rounded-xl object-cover snap-start hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonial */}
              {program.testimonial && (
                <div className="mb-6 rounded-xl bg-white/[0.03] border border-white/5 p-5 relative overflow-hidden">
                  <div className="absolute -top-2 -left-1 text-5xl font-serif opacity-5" style={{ color: bg }}>&ldquo;</div>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="12" height="12" viewBox="0 0 16 16" fill={bg} opacity={0.6}>
                        <path d="M8 1l2.24 4.54 5.01.73-3.63 3.53.86 4.99L8 12.27l-4.48 2.52.86-4.99L.75 6.27l5.01-.73L8 1z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[14px] italic leading-relaxed text-white/40">
                    &ldquo;{program.testimonial}&rdquo;
                  </p>
                  {program.testimonialAuthor && (
                    <p className="mt-3 text-[12px] font-semibold" style={{ color: bg }}>
                      — {program.testimonialAuthor}
                    </p>
                  )}
                </div>
              )}

              {/* RSVP button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowRsvp(true)}
                disabled={isFull}
                className="w-full rounded-xl py-4 text-[15px] font-bold uppercase tracking-wider text-white shadow-xl transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isFull
                    ? "#4b5563"
                    : `linear-gradient(135deg, ${bg}, ${bg}cc)`,
                  boxShadow: isFull ? "none" : `0 4px 24px ${glow}`,
                }}
              >
                {/* Shimmer */}
                {!isFull && (
                  <span className="absolute inset-0 pointer-events-none">
                    <span
                      className="absolute inset-0 animate-shimmer"
                      style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                      }}
                    />
                  </span>
                )}
                <span className="relative flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isFull ? "Join Waitlist" : isVolunteer ? "Sign Up to Volunteer" : "RSVP — Join This Program"}
                </span>
              </motion.button>
              <p className="text-center text-[11px] text-white/20 mt-2">
                Free to attend · No commitment required
              </p>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* RSVP Form Modal */}
      {showRsvp && (
        <RsvpModal program={program} onClose={() => setShowRsvp(false)} />
      )}
    </>
  );
}
