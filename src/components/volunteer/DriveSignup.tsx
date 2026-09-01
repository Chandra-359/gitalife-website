"use client";

/**
 * DriveSignup — one volunteer drive as a single signup flow.
 *
 * The activity cards ARE the form: each card lists its dated shifts as
 * checkboxes (day · time · spots left), and a "Your details" card at the
 * bottom collects contact info once. One submission per volunteer per
 * drive — re-submitting replaces their shifts (the edit path), mirroring
 * the festival form's one-and-done contract, with success remembered in
 * localStorage per drive.
 */

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { Icon, colorFor } from "@/components/home/icons";
import type { VolunteerColor } from "@/data/volunteer";
import type { VolunteerDriveLive, VolunteerShiftLive } from "@/lib/volunteer";

type IconName = ComponentProps<typeof Icon>["name"];

interface DriveSignupProps {
  drive: VolunteerDriveLive;
  /** Spam-guard token from the server render — echoed back on submit. */
  formToken: string | null;
}

const OCCUPATION_OPTIONS = ["Student", "Working professional", "Other"];

type Phase = "idle" | "submitting" | "done";

interface DoneState {
  alreadyRegistered: boolean;
  emailed: boolean;
  name: string;
  shifts: { activityTitle: string; dayChip: string; timeLabel: string }[];
}

const storageKey = (driveId: string) => `glnyc-volunteer-${driveId}`;

export default function DriveSignup({ drive, formToken }: DriveSignupProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [notes, setNotes] = useState("");
  // Honeypot — humans never see or fill this; bots stuff every field
  const [website, setWebsite] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState<DoneState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rememberedName, setRememberedName] = useState<string | null>(null);

  const closed = drive.status !== "published";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(drive.id));
      if (saved) setRememberedName(saved);
    } catch {
      /* private mode */
    }
  }, [drive.id]);

  const shiftByKey = useMemo(() => {
    const map = new Map<string, VolunteerShiftLive>();
    for (const a of drive.activities) for (const s of a.shifts) map.set(s.key, s);
    return map;
  }, [drive.activities]);

  function toggleShift(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0) {
      setError("Pick at least one shift above — that's the whole point!");
      return;
    }
    setError(null);
    setPhase("submitting");
    try {
      const res = await fetch("/api/volunteer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driveId: drive.id,
          name,
          email,
          phone,
          whatsapp,
          location,
          occupation,
          notes,
          shiftKeys: Array.from(selected),
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
        shifts: Array.isArray(data.shifts) ? data.shifts : [],
      });
      setPhase("done");
      try {
        localStorage.setItem(storageKey(drive.id), name);
      } catch {
        /* ignore */
      }
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Something went wrong — please try again");
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(21,34,79,0.18)",
    color: "var(--ink-primary)",
  };

  return (
    <form onSubmit={submit} aria-label={`Volunteer signup for ${drive.title}`}>
      {/* Honeypot — visually removed and skipped by keyboard/screen
          readers; only auto-form-fillers ever put a value here */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${drive.id}-website`}>Website</label>
        <input
          id={`${drive.id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {/* ----- Activity cards with shift pickers ----- */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {drive.activities.map((activity) => {
          const accent = colorFor(activity.color as VolunteerColor);
          return (
            <section
              key={activity.id}
              className="glass-card overflow-hidden rounded-3xl"
              style={{ borderTop: `4px solid ${accent}` }}
              aria-label={activity.title}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}CC)` }}
                    aria-hidden
                  >
                    <Icon name={activity.icon as IconName} size={20} />
                  </div>
                  <div>
                    <h3
                      className="font-serif text-xl leading-tight"
                      style={{ color: "var(--ink-primary)", fontWeight: 600 }}
                    >
                      {activity.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                      {activity.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {activity.shifts.map((shift) => {
                    const isSelected = selected.has(shift.key);
                    const isFull = shift.spotsLeft === 0 && !isSelected;
                    const disabled = closed || isFull || phase !== "idle";
                    return (
                      <label
                        key={shift.key}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                          disabled ? "cursor-not-allowed opacity-55" : "hover:-translate-y-px"
                        }`}
                        style={{
                          background: isSelected ? `${accent}16` : "rgba(255,255,255,0.55)",
                          border: `1.5px solid ${isSelected ? accent : "rgba(21,34,79,0.12)"}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 shrink-0 accent-current"
                          style={{ color: accent }}
                          checked={isSelected}
                          disabled={disabled}
                          onChange={() => toggleShift(shift.key)}
                          aria-label={`${activity.title}, ${shift.dateLabel}, ${shift.timeLabel}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline gap-x-2">
                            <span className="text-[13px] font-bold" style={{ color: "var(--ink-primary)" }}>
                              {shift.dayChip}
                            </span>
                            <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-secondary)" }}>
                              {shift.timeLabel}
                            </span>
                          </span>
                          {shift.note && (
                            <span className="mt-0.5 block text-[11.5px]" style={{ color: "var(--ink-tertiary)" }}>
                              {shift.note}
                            </span>
                          )}
                        </span>
                        <span
                          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
                          style={
                            isFull
                              ? { background: "rgba(21,34,79,0.08)", color: "var(--ink-tertiary)" }
                              : { background: `${accent}18`, color: accent }
                          }
                        >
                          {isFull
                            ? "Full"
                            : shift.spotsLeft == null
                              ? "Open"
                              : `${shift.spotsLeft} spot${shift.spotsLeft === 1 ? "" : "s"} left`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* ----- Details / success ----- */}
      <div className="mx-auto mt-8 max-w-2xl">
        {phase === "done" && done ? (
          <div
            className="glass-card rounded-3xl p-8 text-center"
            style={{ borderTop: "4px solid var(--divine-gold)" }}
          >
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl text-white"
              style={{ background: "var(--divine-gold)" }}
              aria-hidden
            >
              ✓
            </div>
            <h4 className="mt-4 font-serif text-2xl" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
              {done.alreadyRegistered
                ? `Your seva is updated, ${done.name.split(" ")[0]}`
                : `You're on the crew, ${done.name.split(" ")[0]}!`}
            </h4>
            {done.shifts.length > 0 && (
              <ul className="mx-auto mt-4 flex max-w-md flex-col gap-2">
                {done.shifts.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(21,34,79,0.12)",
                      color: "var(--ink-primary)",
                    }}
                  >
                    {s.activityTitle} · {s.dayChip} · {s.timeLabel}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
              {done.emailed
                ? "Your confirmation and calendar invites are on their way from no-reply@gitalifenyc.com. A coordinator will reach out before your first shift."
                : "You're signed up — check your spam folder in a few minutes for the confirmation email."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {drive.whatsappUrl && (
                <a
                  href={drive.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-gradient rounded-full px-6 py-3 text-sm font-bold text-white"
                >
                  Join the crew WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => setPhase("idle")}
                className="rounded-full px-6 py-3 text-sm font-semibold"
                style={{ color: "var(--ink-primary)", border: "1px solid rgba(21,34,79,0.18)" }}
              >
                Change my shifts
              </button>
            </div>
          </div>
        ) : (
          <div
            id={`${drive.id}-details`}
            className="glass-card rounded-3xl p-6 sm:p-8"
            style={{ borderTop: "4px solid var(--divine-gold)" }}
          >
            <h3 className="font-serif text-2xl" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
              Your details
            </h3>

            {rememberedName && (
              <div
                className="mt-3 rounded-xl px-4 py-3 text-xs leading-relaxed"
                style={{
                  background: "rgba(201,162,72,0.1)",
                  border: "1px solid rgba(201,162,72,0.4)",
                  color: "var(--ink-secondary)",
                }}
              >
                You already signed up for this drive from this device,{" "}
                <strong style={{ color: "var(--ink-primary)" }}>{rememberedName.split(" ")[0]}</strong>.
                Submitting again with the same email just updates your shifts.
              </div>
            )}

            {/* Live selection summary */}
            <div className="mt-4">
              {selected.size === 0 ? (
                <p className="text-[12.5px] font-semibold" style={{ color: "var(--ink-tertiary)" }}>
                  No shifts picked yet — tick the ones above that fit your week.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {Array.from(selected).map((key) => {
                    const s = shiftByKey.get(key);
                    if (!s) return null;
                    return (
                      <li
                        key={key}
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-bold"
                        style={{
                          background: "rgba(201,162,72,0.12)",
                          border: "1px solid rgba(201,162,72,0.45)",
                          color: "var(--ink-primary)",
                        }}
                      >
                        {s.activityTitle} · {s.dayChip}
                        <button
                          type="button"
                          onClick={() => toggleShift(key)}
                          aria-label={`Remove ${s.activityTitle} on ${s.dateLabel}`}
                          className="text-[13px] leading-none opacity-60 hover:opacity-100"
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`${drive.id}-name`}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Full name
                  </label>
                  <input
                    id={`${drive.id}-name`}
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
                    htmlFor={`${drive.id}-email`}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Email
                  </label>
                  <input
                    id={`${drive.id}-email`}
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
                    htmlFor={`${drive.id}-phone`}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Mobile
                  </label>
                  <input
                    id={`${drive.id}-phone`}
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
                    htmlFor={`${drive.id}-whatsapp`}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    WhatsApp{" "}
                    <span className="font-normal normal-case tracking-normal">(if different)</span>
                  </label>
                  <input
                    id={`${drive.id}-whatsapp`}
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
                    htmlFor={`${drive.id}-location`}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Location <span className="font-normal normal-case tracking-normal">(City, State)</span>
                  </label>
                  <input
                    id={`${drive.id}-location`}
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
                    htmlFor={`${drive.id}-occupation`}
                    className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    You are
                  </label>
                  <select
                    id={`${drive.id}-occupation`}
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
                    style={inputStyle}
                  >
                    <option value="">Student or working?</option>
                    {OCCUPATION_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${drive.id}-notes`}
                  className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: "var(--ink-tertiary)" }}
                >
                  Anything we should know?{" "}
                  <span className="font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  id={`${drive.id}-notes`}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  placeholder="Skills (cooking, photography, first aid…), timing constraints, friends you're coming with"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
                  style={inputStyle}
                />
              </div>

            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{
                  background: "rgba(233,69,96,0.1)",
                  color: "#B02A40",
                  border: "1px solid rgba(233,69,96,0.3)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={phase === "submitting" || closed}
              className="btn-primary-gradient mt-5 w-full rounded-full px-6 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              {closed
                ? "This drive has wrapped — thank you, crew!"
                : phase === "submitting"
                  ? "Saving your seva…"
                  : selected.size === 0
                    ? "Count me in"
                    : `Count me in — ${selected.size} shift${selected.size === 1 ? "" : "s"}`}
            </button>

            <p className="mt-3 text-center text-[11px] leading-relaxed" style={{ color: "var(--ink-tertiary)" }}>
              You&apos;ll get a confirmation email with calendar invites for each shift.
              Plans change? Submit again with the same email to update your shifts.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
