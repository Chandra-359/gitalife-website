"use client";

/**
 * ProgramRegisterForm — one-and-done registration for a weekly program.
 *
 * Register once → welcome email with a recurring calendar invite →
 * weekly topic reminders until unsubscribe. Duplicate submissions are
 * handled gracefully: the API re-sends the invite and tells us the
 * person was already in, and we remember success in localStorage so a
 * returning visitor sees "you're registered" instead of a blank form.
 */

import { useEffect, useState } from "react";

interface ProgramRegisterFormProps {
  programId: string;
  programName: string;
  dayOfWeek: string;
  accent: string;
}

const HEAR_ABOUT_OPTIONS = [
  "A friend brought me",
  "Instagram",
  "Flyer / QR code",
  "Google search",
  "I've been before",
  "Other",
];

type Phase = "idle" | "submitting" | "done";

interface DoneState {
  alreadyRegistered: boolean;
  emailed: boolean;
  name: string;
}

const storageKey = (programId: string) => `glnyc-registered-${programId}`;

export default function ProgramRegisterForm({
  programId,
  programName,
  dayOfWeek,
  accent,
}: ProgramRegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState<DoneState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rememberedName, setRememberedName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(programId));
      if (saved) setRememberedName(saved);
    } catch {
      /* private mode — no memory, no problem */
    }
  }, [programId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("submitting");
    try {
      const res = await fetch("/api/programs/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, name, email, phone, hearAbout }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong — please try again");
      }
      setDone({
        alreadyRegistered: !!data.alreadyRegistered,
        emailed: !!data.emailed,
        name,
      });
      setPhase("done");
      try {
        localStorage.setItem(storageKey(programId), name);
      } catch {
        /* ignore */
      }
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Something went wrong — please try again");
    }
  }

  /* ----- success state ----- */
  if (phase === "done" && done) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: "rgba(255,255,255,0.55)", border: `1.5px solid ${accent}55` }}
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl text-white"
          style={{ background: accent }}
          aria-hidden
        >
          ✓
        </div>
        <h4 className="mt-4 text-lg font-bold" style={{ color: "var(--ink-primary)" }}>
          {done.alreadyRegistered
            ? `You were already on the list, ${done.name.split(" ")[0]}`
            : `You're in, ${done.name.split(" ")[0]}!`}
        </h4>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
          {done.emailed
            ? `Check your inbox — your ${dayOfWeek} calendar invite is on its way from no-reply@gitalifenyc.com. We'll send a reminder with each week's topic the day before class.`
            : `You're registered for every ${dayOfWeek}. Save the date — and check your spam folder in a few minutes for the calendar invite.`}
        </p>
        <p className="mt-3 text-xs" style={{ color: "var(--ink-tertiary)" }}>
          Registered once, welcome always. No need to sign up again.
        </p>
      </div>
    );
  }

  /* ----- returning visitor shortcut ----- */
  const returningBanner = rememberedName && phase === "idle" && (
    <div
      className="mb-4 rounded-xl px-4 py-3 text-xs leading-relaxed"
      style={{
        background: `${accent}14`,
        border: `1px solid ${accent}40`,
        color: "var(--ink-secondary)",
      }}
    >
      Looks like you already registered from this device,{" "}
      <strong style={{ color: "var(--ink-primary)" }}>{rememberedName.split(" ")[0]}</strong> — you&apos;re
      set for every {dayOfWeek}. Registering again just re-sends your invite.
    </div>
  );

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(21,34,79,0.18)",
    color: "var(--ink-primary)",
  };

  return (
    <form onSubmit={submit} aria-label={`Register for ${programName}`}>
      {returningBanner}

      <div className="space-y-3">
        <div>
          <label
            htmlFor={`${programId}-name`}
            className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Full name
          </label>
          <input
            id={`${programId}-name`}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Arjuna Das"
            autoComplete="name"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-shadow focus:ring-2"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            htmlFor={`${programId}-email`}
            className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Email
          </label>
          <input
            id={`${programId}-email`}
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-shadow focus:ring-2"
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${programId}-phone`}
              className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Mobile <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id={`${programId}-phone`}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(201) 555-0134"
              autoComplete="tel"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-shadow focus:ring-2"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              htmlFor={`${programId}-hear`}
              className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              How did you find us?
            </label>
            <select
              id={`${programId}-hear`}
              value={hearAbout}
              onChange={(e) => setHearAbout(e.target.value)}
              className="w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none transition-shadow focus:ring-2"
              style={inputStyle}
            >
              <option value="">Select…</option>
              {HEAR_ABOUT_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{ background: "rgba(233,69,96,0.1)", color: "#B02A40", border: "1px solid rgba(233,69,96,0.3)" }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={phase === "submitting"}
        className="mt-4 w-full rounded-full px-6 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`,
          boxShadow: `0 1px 2px rgba(80,55,15,0.15), 0 8px 18px -6px ${accent}88`,
        }}
      >
        {phase === "submitting" ? "Saving your seat…" : "Register once — come every week"}
      </button>

      <p className="mt-3 text-center text-[11px] leading-relaxed" style={{ color: "var(--ink-tertiary)" }}>
        Free, always. You&apos;ll get a calendar invite and a weekly reminder — unsubscribe anytime with one click.
      </p>
    </form>
  );
}
