"use client";

/**
 * FeedbackForm — post-event feedback for /bhajanclubbing/feedback.
 *
 * Mirrors the organizers' paper feedback form (no phone/email fields).
 * Submissions POST to /api/bhajanclubbing/feedback, which appends each
 * response to the "reviews" tab of the registrations spreadsheet.
 * Styled with the same bc2 glass/amber language as the ticket flow.
 */

import { useState } from "react";
import { motion } from "framer-motion";

const RATINGS = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Fair" },
  { value: 3, label: "Good" },
  { value: 4, label: "Very Good" },
  { value: 5, label: "Excellent" },
];

const INTEREST_OPTIONS = ["Yes, definitely!", "Maybe", "Not at the moment"];

const PROGRAM_OPTIONS = [
  "Spiritual Discussions",
  "Bhagavad Gita session",
  "Kirtan & Music",
  "Monthly Youth Festival",
  "Retreats",
  "Volunteering",
];

// 16px on phones so iOS Safari doesn't zoom on focus (same as TicketFlow)
const inputClass =
  "w-full rounded-xl border px-4 py-3 text-[16px] sm:text-[14px] text-club-ink outline-none transition-all placeholder:text-[rgba(244,240,235,0.3)] focus:ring-2 focus:ring-[#D98A4A]/30";
const inputStyle: React.CSSProperties = {
  background: "rgba(244,240,235,0.06)",
  borderColor: "rgba(244,240,235,0.16)",
};

const labelClass = "mb-2 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]";
const labelStyle: React.CSSProperties = { color: "var(--bc2-ink-dim)" };

/** Selectable pill — used for ratings, interest choices, and programs. */
function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full px-4 py-2.5 text-[13px] font-bold transition-all"
      style={
        active
          ? {
              background: "linear-gradient(135deg, #E5C08D, #D98A4A)",
              color: "#241505",
              boxShadow: "0 0 16px rgba(217,138,74,0.45)",
            }
          : {
              background: "rgba(244,240,235,0.06)",
              border: "1px solid rgba(244,240,235,0.16)",
              color: "var(--bc2-ink-dim)",
            }
      }
    >
      {children}
    </button>
  );
}

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [enjoyed, setEnjoyed] = useState("");
  const [programsInterest, setProgramsInterest] = useState("");
  const [programs, setPrograms] = useState<string[]>([]);
  const [otherProgram, setOtherProgram] = useState("");
  const [inspire, setInspire] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const toggleProgram = (p: string) =>
    setPrograms((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating == null) {
      setError("Please pick an overall rating");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bhajanclubbing/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rating,
          enjoyed,
          programsInterest,
          programs: [...programs, ...(otherProgram.trim() ? [`Other: ${otherProgram.trim()}`] : [])],
          inspire,
          suggestions,
          website: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String(data.error || "Couldn't send your feedback — please try again"));
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your feedback — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 13 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "rgba(143,207,168,0.1)", border: "1.5px solid rgba(143,207,168,0.45)" }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke="#8FCFA8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <h2 className="bc2-display mt-5 text-[26px] text-club-ink">Thank you 🙏</h2>
        <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
          Your feedback means a lot — it directly shapes Vol. 02. See you there!
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-7" noValidate>
      {/* honeypot — hidden from real visitors, bots fill it */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div>
        <label htmlFor="fb-name" className={labelClass} style={labelStyle}>
          Name <span className="normal-case tracking-normal" style={{ color: "var(--bc2-ink-faint)" }}>(optional)</span>
        </label>
        <input
          id="fb-name"
          type="text"
          placeholder="Your name"
          className={inputClass}
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <p className={labelClass} style={labelStyle}>
          Overall, how would you rate the event? <span style={{ color: "var(--bc2-saffron)" }}>*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((r) => (
            <Pill key={r.value} active={rating === r.value} onClick={() => setRating(r.value)}>
              {r.value} · {r.label}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="fb-enjoyed" className={labelClass} style={labelStyle}>
          What did you enjoy the most about the event?
        </label>
        <textarea
          id="fb-enjoyed"
          rows={3}
          placeholder="The kirtan, the energy, the prasadam…"
          className={`${inputClass} resize-y`}
          style={inputStyle}
          value={enjoyed}
          onChange={(e) => setEnjoyed(e.target.value)}
        />
      </div>

      <div>
        <p className={labelClass} style={labelStyle}>
          Would you be interested in being part of Gita Life NYC programs?
        </p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((o) => (
            <Pill key={o} active={programsInterest === o} onClick={() => setProgramsInterest(o)}>
              {o}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <p className={labelClass} style={labelStyle}>
          What programs would you be interested in?{" "}
          <span className="normal-case tracking-normal" style={{ color: "var(--bc2-ink-faint)" }}>
            (select all that apply)
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {PROGRAM_OPTIONS.map((p) => (
            <Pill key={p} active={programs.includes(p)} onClick={() => toggleProgram(p)}>
              {p}
            </Pill>
          ))}
        </div>
        <input
          type="text"
          placeholder="Others…"
          className={`${inputClass} mt-2.5`}
          style={inputStyle}
          value={otherProgram}
          onChange={(e) => setOtherProgram(e.target.value)}
          aria-label="Other programs you'd be interested in"
        />
      </div>

      <div>
        <p className={labelClass} style={labelStyle}>
          Would you like to be part of the INSPIRE charity program?
        </p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((o) => (
            <Pill key={o} active={inspire === o} onClick={() => setInspire(o)}>
              {o}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="fb-suggestions" className={labelClass} style={labelStyle}>
          Any suggestions for us
        </label>
        <textarea
          id="fb-suggestions"
          rows={3}
          placeholder="Be honest — sound, seating, check-in, timing, anything at all"
          className={`${inputClass} resize-y`}
          style={inputStyle}
          value={suggestions}
          onChange={(e) => setSuggestions(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-center text-[12.5px] font-semibold" style={{ color: "#FF8E8E" }} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bc2-btn-glow w-full rounded-full py-3.5 text-[13px] font-extrabold uppercase tracking-[0.08em] disabled:opacity-60"
        style={{ animation: "none" }}
      >
        {submitting ? "Sending…" : "Submit feedback"}
      </button>
    </form>
  );
}
