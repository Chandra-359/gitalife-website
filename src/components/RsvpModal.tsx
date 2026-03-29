"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";

interface RsvpFormData {
  name: string;
  email: string;
  phone?: string;
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

export default function RsvpModal({ program, onClose }: RsvpModalProps) {
  const { bg } = getCategoryColor(program.category);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RsvpFormData>();

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
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Something went wrong" }));
        throw new Error(err.error || "Failed to RSVP");
      }

      toast.success("You're in! See you there 🙏", { duration: 4000 });
      onClose();
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
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="relative w-full max-w-md rounded-2xl bg-[#FFF9F0] border border-[#E8751A]/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-lg font-bold text-gray-900">
              RSVP for {program.title}
            </h3>
            <p className="mt-1 text-[13px] text-gray-500">
              {formatDate(program.date)} &middot; {formatTime(program.date)}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="rsvp-name" className="block text-[12px] font-medium text-gray-600 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="rsvp-name"
                type="text"
                placeholder="Your name"
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-300 outline-none transition-colors focus:border-[#E8751A]/40 focus:ring-1 focus:ring-[#E8751A]/20 ${
                  errors.name ? "border-red-300" : "border-gray-200"
                }`}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="rsvp-email" className="block text-[12px] font-medium text-gray-600 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="rsvp-email"
                type="email"
                placeholder="you@example.com"
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-300 outline-none transition-colors focus:border-[#E8751A]/40 focus:ring-1 focus:ring-[#E8751A]/20 ${
                  errors.email ? "border-red-300" : "border-gray-200"
                }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="rsvp-phone" className="block text-[12px] font-medium text-gray-600 mb-1">
                Phone <span className="text-[11px] text-gray-400">(optional)</span>
              </label>
              <input
                id="rsvp-phone"
                type="tel"
                placeholder="(555) 123-4567"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-300 outline-none transition-colors focus:border-[#E8751A]/40 focus:ring-1 focus:ring-[#E8751A]/20"
                {...register("phone")}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl py-3 text-[13px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl py-3 text-[13px] font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
                }}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Confirm RSVP"
                )}
              </button>
            </div>
          </form>

          {/* Close X */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
