"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { Program } from "@/data/programs";
import { getCategoryColor, getCategoryIcon, VOLUNTEER_COLOR } from "@/data/programs";

interface RsvpFormData {
  name: string;
  email: string;
  phone?: string;
  guests: number;
  notes?: string;
}

interface RsvpModalProps {
  program: Program;
  onClose: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
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

/** Confetti pieces for success celebration */
const CONFETTI = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 0.5,
  color: ["#E8751A", "#D4A843", "#e94560", "#1A5C5E", "#FFD700"][i % 5],
  size: 4 + Math.random() * 6,
  rotation: Math.random() * 360,
}));

export default function RsvpModal({ program, onClose }: RsvpModalProps) {
  const isVolunteer = program.type === "volunteer";
  const { bg, glow } = isVolunteer ? VOLUNTEER_COLOR : getCategoryColor(program.category);
  const icon = getCategoryIcon(program.category);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const spotsLeft = program.capacity && program.rsvpCount != null
    ? program.capacity - program.rsvpCount
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RsvpFormData>({
    defaultValues: { guests: 1 },
  });

  const onSubmit = async (data: RsvpFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: program.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          guests: data.guests || 1,
          notes: data.notes || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Something went wrong" }));
        throw new Error(err.error || "Failed to RSVP");
      }

      setSuccess(true);
      toast.success("You're in! See you there!", { duration: 4000 });
      setTimeout(onClose, 2500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to RSVP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFF9F0] border border-[#E8751A]/10 shadow-2xl"
        >
          {/* Success confetti overlay */}
          {success && (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {CONFETTI.map((c) => (
                <motion.div
                  key={c.id}
                  className="absolute rounded-sm"
                  style={{
                    left: c.left,
                    top: -10,
                    width: c.size,
                    height: c.size,
                    backgroundColor: c.color,
                    transform: `rotate(${c.rotation}deg)`,
                  }}
                  initial={{ y: -20, opacity: 1 }}
                  animate={{ y: 500, opacity: 0, rotate: c.rotation + 720 }}
                  transition={{ duration: 2, delay: c.delay, ease: "easeIn" }}
                />
              ))}
            </div>
          )}

          {/* Top accent gradient bar */}
          <div
            className="h-1.5 w-full"
            style={{ background: `linear-gradient(90deg, ${bg}, ${bg}88, ${bg})` }}
          />

          {success ? (
            /* ---- Success state ---- */
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="px-8 py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, delay: 0.1 }}
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: `${bg}15` }}
              >
                <motion.svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <motion.path
                    d="M5 12l5 5L19 7"
                    stroke={bg}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  />
                </motion.svg>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                You&rsquo;re All Set!
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                We&rsquo;ll send you a confirmation email with all the details for <span className="font-semibold text-gray-700">{program.title}</span>.
              </p>
              <p className="mt-3 text-[13px] font-medium" style={{ color: bg }}>
                See you on {formatDate(program.date)}!
              </p>
            </motion.div>
          ) : (
            /* ---- Form state ---- */
            <>
              {/* Header with event preview */}
              <div className="px-6 pt-6 pb-5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg text-white shadow-lg"
                    style={{ background: bg, boxShadow: `0 4px 16px ${glow}` }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {isVolunteer ? "Sign Up to Volunteer" : "RSVP"} for {program.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                          <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M2 7h12" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                        {formatDate(program.date)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="inline-flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        {formatTime(program.date)}
                      </span>
                    </div>
                    {spotsLeft !== null && spotsLeft > 0 && (
                      <p className="mt-1.5 text-[11px] font-semibold" style={{ color: bg }}>
                        {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} remaining
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="rsvp-name" className="block text-[12px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <input
                      id="rsvp-name"
                      type="text"
                      placeholder="Enter your name"
                      className={`w-full rounded-xl border bg-white pl-11 pr-4 py-3 text-[14px] text-gray-800 placeholder:text-gray-300 outline-none transition-all focus:border-[#E8751A]/40 focus:ring-2 focus:ring-[#E8751A]/10 focus:shadow-sm ${
                        errors.name ? "border-red-300 bg-red-50/30" : "border-gray-200"
                      }`}
                      {...register("name", { required: "Name is required" })}
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 text-[11px] text-red-500 font-medium"
                    >
                      {errors.name.message}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="rsvp-email" className="block text-[12px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="4" width="20" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 7l-10 6L2 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <input
                      id="rsvp-email"
                      type="email"
                      placeholder="you@example.com"
                      className={`w-full rounded-xl border bg-white pl-11 pr-4 py-3 text-[14px] text-gray-800 placeholder:text-gray-300 outline-none transition-all focus:border-[#E8751A]/40 focus:ring-2 focus:ring-[#E8751A]/10 focus:shadow-sm ${
                        errors.email ? "border-red-300 bg-red-50/30" : "border-gray-200"
                      }`}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email",
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 text-[11px] text-red-500 font-medium"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Phone + Guests row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Phone */}
                  <div className="col-span-2">
                    <label htmlFor="rsvp-phone" className="block text-[12px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Phone <span className="text-[10px] text-gray-400 normal-case tracking-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <input
                        id="rsvp-phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 py-3 text-[14px] text-gray-800 placeholder:text-gray-300 outline-none transition-all focus:border-[#E8751A]/40 focus:ring-2 focus:ring-[#E8751A]/10 focus:shadow-sm"
                        {...register("phone")}
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label htmlFor="rsvp-guests" className="block text-[12px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Guests
                    </label>
                    <select
                      id="rsvp-guests"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-[14px] text-gray-800 outline-none transition-all focus:border-[#E8751A]/40 focus:ring-2 focus:ring-[#E8751A]/10 focus:shadow-sm appearance-none cursor-pointer"
                      {...register("guests", { valueAsNumber: true })}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n === 1 ? "Just me" : `${n} people`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes (optional) */}
                <div>
                  <label htmlFor="rsvp-notes" className="block text-[12px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Notes <span className="text-[10px] text-gray-400 normal-case tracking-normal">(dietary needs, accessibility, etc.)</span>
                  </label>
                  <textarea
                    id="rsvp-notes"
                    rows={2}
                    placeholder="Any special requirements..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-800 placeholder:text-gray-300 outline-none transition-all focus:border-[#E8751A]/40 focus:ring-2 focus:ring-[#E8751A]/10 focus:shadow-sm resize-none"
                    {...register("notes")}
                  />
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 py-2">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" />
                      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                    </svg>
                    Secure
                  </span>
                  <span className="w-px h-3 bg-gray-200" />
                  <span className="text-[10px] text-gray-400">No spam, ever</span>
                  <span className="w-px h-3 bg-gray-200" />
                  <span className="text-[10px] text-gray-400">100% free</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl py-3.5 text-[13px] font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Maybe Later
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 rounded-xl py-3.5 text-[13px] font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
                      boxShadow: `0 4px 20px ${glow}`,
                    }}
                  >
                    {/* Shimmer */}
                    <span className="absolute inset-0 pointer-events-none">
                      <span
                        className="absolute inset-0 animate-shimmer"
                        style={{
                          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                        }}
                      />
                    </span>
                    <span className="relative">
                      {submitting ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Reserving...
                        </span>
                      ) : (
                        "Reserve My Spot"
                      )}
                    </span>
                  </motion.button>
                </div>
              </form>
            </>
          )}

          {/* Close X */}
          {!success && (
            <button
              onClick={onClose}
              className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
