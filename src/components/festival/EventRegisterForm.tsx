"use client";

/**
 * EventRegisterForm — registration for one dated event (festival,
 * monthly youth festival, or volunteering op).
 *
 * Same one-and-done contract as the weekly programs form: duplicates
 * re-send the confirmation instead of double-booking, and success is
 * remembered in localStorage per event. Registrations are individual —
 * everyone in a group registers themselves (no party-size field).
 */

import { useEffect, useState } from "react";

interface EventRegisterFormProps {
  eventId: string;
  eventTitle: string;
  accent: string;
  dateLabel: string;
  spotsLeft: number | null;
  volunteering: boolean;
  /** Spam-guard token from the server render — echoed back on submit. */
  formToken: string | null;
}

// Same list as the Bhajan Clubbing ticket flow, plus Bhajan Clubbing
// itself now that it feeds people into the festivals.
const HEAR_ABOUT_OPTIONS = [
  "Instagram",
  "WhatsApp",
  "Friend or family",
  "Temple announcement",
  "YouTube",
  "Gita Life Volunteer",
  "Flyers/Posters",
  "Bhajan Clubbing",
  "Other",
];

type Phase = "idle" | "submitting" | "done";

interface DoneState {
  alreadyRegistered: boolean;
  emailed: boolean;
  name: string;
}

const storageKey = (eventId: string) => `glnyc-event-${eventId}`;

export default function EventRegisterForm({
  eventId,
  eventTitle,
  accent,
  dateLabel,
  spotsLeft,
  volunteering,
  formToken,
}: EventRegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState("");
  const [organization, setOrganization] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  // Honeypot — humans never see or fill this; bots stuff every field
  const [website, setWebsite] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState<DoneState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rememberedName, setRememberedName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(eventId));
      if (saved) setRememberedName(saved);
    } catch {
      /* private mode */
    }
  }, [eventId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("submitting");
    try {
      const res = await fetch("/api/festivals/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          name,
          email,
          phone,
          whatsapp,
          location,
          organization,
          hearAbout,
          website,
          formToken,
        }),
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
        localStorage.setItem(storageKey(eventId), name);
      } catch {
        /* ignore */
      }
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Something went wrong — please try again");
    }
  }

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
            : volunteering
              ? `You're on the crew, ${done.name.split(" ")[0]}!`
              : `See you there, ${done.name.split(" ")[0]}!`}
        </h4>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
          {done.emailed
            ? `Your QR entry pass and calendar invite for ${dateLabel} are on their way from no-reply@gitalifenyc.com — show the QR at the door, and we'll remind you the day before.`
            : `You're registered for ${dateLabel}. Check your spam folder in a few minutes for your QR entry pass and calendar invite.`}
        </p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(21,34,79,0.18)",
    color: "var(--ink-primary)",
  };

  return (
    <form onSubmit={submit} aria-label={`Register for ${eventTitle}`}>
      {rememberedName && phase === "idle" && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-xs leading-relaxed"
          style={{ background: `${accent}14`, border: `1px solid ${accent}40`, color: "var(--ink-secondary)" }}
        >
          You already registered for this event from this device,{" "}
          <strong style={{ color: "var(--ink-primary)" }}>{rememberedName.split(" ")[0]}</strong>.
          Registering again just re-sends your invite.
        </div>
      )}

      {spotsLeft != null && spotsLeft <= 20 && spotsLeft > 0 && (
        <p
          className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ background: `${accent}18`, color: accent }}
        >
          Only {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
        </p>
      )}

      {/* Honeypot — visually removed and skipped by keyboard/screen
          readers; only auto-form-fillers ever put a value here */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${eventId}-website`}>Website</label>
        <input
          id={`${eventId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${eventId}-name`}
              className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Full name
            </label>
            <input
              id={`${eventId}-name`}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Arjuna Das"
              autoComplete="name"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              htmlFor={`${eventId}-email`}
              className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Email
            </label>
            <input
              id={`${eventId}-email`}
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${eventId}-phone`}
              className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Mobile
            </label>
            <input
              id={`${eventId}-phone`}
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(201) 555-0134"
              autoComplete="tel"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              htmlFor={`${eventId}-whatsapp`}
              className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              WhatsApp <span className="font-normal normal-case tracking-normal">(if different from mobile)</span>
            </label>
            <input
              id={`${eventId}-whatsapp`}
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Same as mobile? Leave blank"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${eventId}-location`}
              className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Location <span className="font-normal normal-case tracking-normal">(City, State)</span>
            </label>
            <input
              id={`${eventId}-location`}
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Brooklyn, NY"
              autoComplete="address-level2"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              htmlFor={`${eventId}-organization`}
              className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              University / Company
            </label>
            <input
              id={`${eventId}-organization`}
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="University if student, company if working"
              autoComplete="organization"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`${eventId}-hear`}
            className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-tertiary)" }}
          >
            How did you find us?
          </label>
          <select
            id={`${eventId}-hear`}
            value={hearAbout}
            onChange={(e) => setHearAbout(e.target.value)}
            className="w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
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
        disabled={phase === "submitting" || spotsLeft === 0}
        className="mt-4 w-full rounded-full px-6 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`,
          boxShadow: `0 1px 2px rgba(80,55,15,0.15), 0 8px 18px -6px ${accent}88`,
        }}
      >
        {spotsLeft === 0
          ? "This event is full"
          : phase === "submitting"
            ? "Saving your spot…"
            : volunteering
              ? "Count me in — join the crew"
              : "Save my spot — it's free"}
      </button>

      <p className="mt-3 text-center text-[11px] leading-relaxed" style={{ color: "var(--ink-tertiary)" }}>
        You&apos;ll get your QR entry pass and a calendar invite by email, plus one
        reminder the day before.
      </p>
    </form>
  );
}
