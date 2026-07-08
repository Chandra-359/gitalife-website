"use client";

/**
 * RegisterPanel — venue info (dark glass) + registration form styled as a
 * cream paper ticket stub, perforated between the header and the form.
 *
 * POSTs to /api/bajanclubbing (Program/Rsvp reuse — shows up in admin).
 * GET on mount feeds the live "passes claimed" meter; both degrade
 * gracefully when the database is offline.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { C, Icon } from "@/components/home/icons";
import { EVENT, SHARE } from "@/data/bajanClubbing";
import { StringLights } from "./FestivalBackdrop";

interface PassFormData {
  name: string;
  email: string;
  phone?: string;
  guests: number;
  notes?: string;
}

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 11) % 100}%`,
  delay: (i % 7) * 0.09,
  color: [C.saffron, C.gold, C.lotusPink, C.peacockLight, C.goldLight][i % 5],
  size: 5 + (i % 4) * 2,
  rotation: (i * 53) % 360,
}));

function googleCalendarUrl() {
  const toStamp = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${EVENT.title} — ${EVENT.volume}`,
    dates: `${toStamp(EVENT.startIso)}/${toStamp(EVENT.endIso)}`,
    details: `${EVENT.description}\n\n${EVENT.url}`,
    location: `${EVENT.venue.name}, ${EVENT.venue.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* ------------------------------------------------------------------ */
/*  Input styling (paper ticket)                                       */
/* ------------------------------------------------------------------ */
const inputBase =
  "w-full rounded-xl border bg-white/85 px-4 py-3 text-[14px] outline-none transition-all placeholder:text-[#B3A88F] focus:ring-2";
const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  borderColor: hasError ? "#d05c5c" : "rgba(154,144,120,0.55)",
  color: "#15224F",
  // Tailwind ring color can't read CSS vars here; use boxShadow on focus via class ring util instead
});

/* ------------------------------------------------------------------ */
/*  Venue card (left column)                                           */
/* ------------------------------------------------------------------ */
function VenueCard() {
  return (
    <div
      className="flex h-full flex-col rounded-3xl p-7 sm:p-8"
      style={{
        background: "rgba(251,245,230,0.045)",
        border: "1px solid rgba(201,162,72,0.24)",
      }}
    >
      <p className="eyebrow" style={{ color: C.goldLight }}>
        The Venue
      </p>
      <h3
        className="mt-3 text-[26px] leading-tight text-white sm:text-[30px]"
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 600 }}
      >
        {EVENT.venue.name}
      </h3>
      <p className="mt-2 flex items-start gap-2 text-[14px]" style={{ color: "rgba(251,245,230,0.72)" }}>
        <Icon name="mapPin" size={15} style={{ color: C.goldLight, marginTop: 2, flexShrink: 0 }} />
        {EVENT.venue.address}
      </p>

      <div className="mt-6 space-y-4">
        {[
          { label: "Doors", value: `${EVENT.doorsLabel} — come early, the chai goes fast` },
          { label: "Getting there", value: EVENT.venue.transit },
          { label: "Dress code", value: EVENT.venue.note },
          { label: "Cover", value: `${EVENT.priceLabel} · midnight prasadam feast included` },
        ].map((row) => (
          <div key={row.label} className="flex gap-3.5">
            <span
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: C.saffron, boxShadow: `0 0 8px ${C.saffron}` }}
              aria-hidden
            />
            <p className="text-[13.5px] leading-relaxed" style={{ color: "rgba(251,245,230,0.68)" }}>
              <span className="font-bold uppercase tracking-[0.14em] text-[11px]" style={{ color: C.goldLight }}>
                {row.label}
              </span>
              <br />
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-7">
        <a
          href={EVENT.venue.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-soft btn-soft-gold !px-5 !py-3 !text-[13px]"
        >
          Get directions
          <Icon name="arrowRight" size={14} />
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ticket stub form (right column)                                    */
/* ------------------------------------------------------------------ */
function TicketForm() {
  const [submitting, setSubmitting] = useState(false);
  const [confirmedName, setConfirmedName] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/bajanclubbing")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.confirmed === "number") {
          setClaimed(data.confirmed);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PassFormData>({ defaultValues: { guests: 1 } });

  const onSubmit = async (data: PassFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/bajanclubbing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          guests: data.guests || 1,
          notes: data.notes || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Something went wrong" }));
        throw new Error(err.error || "Failed to register");
      }
      setConfirmedName(data.name.split(" ")[0]);
      setClaimed((c) => (c === null ? c : c + (data.guests || 1)));
      toast.success("Pass confirmed — see you on the floor!", { duration: 4500 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const shareText = encodeURIComponent(`${SHARE.message} ${EVENT.url}`);
  const pct = claimed !== null ? Math.min(100, Math.round((claimed / EVENT.capacity) * 100)) : null;

  return (
    <div id="register" className="relative scroll-mt-24">
      {/* Paper ticket */}
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          // Explicit layers: grain multiplied over a cream gradient. (The
          // .glass-card class leans on the page's light paper backdrop
          // showing through, which doesn't exist on this midnight page.)
          backgroundColor: "#F7EFDA",
          backgroundImage: "var(--tex-grain), linear-gradient(180deg, #FBF5E6 0%, #F2E9CF 100%)",
          backgroundSize: "220px 220px, 100% 100%",
          backgroundBlendMode: "multiply, normal",
          border: "1px solid rgba(154,144,120,0.6)",
          boxShadow: `0 24px 70px -24px ${C.saffron}40, 0 2px 6px rgba(0,0,0,0.35)`,
        }}
      >
        {/* Confetti on success */}
        {confirmedName && (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
            {CONFETTI.map((c) => (
              <motion.div
                key={c.id}
                className="absolute rounded-sm"
                style={{ left: c.left, top: -12, width: c.size, height: c.size, backgroundColor: c.color }}
                initial={{ y: -18, opacity: 1, rotate: c.rotation }}
                animate={{ y: 560, opacity: 0, rotate: c.rotation + 660 }}
                transition={{ duration: 2.1, delay: c.delay, ease: "easeIn" }}
              />
            ))}
          </div>
        )}

        {/* Stub header */}
        <div className="relative px-7 pb-6 pt-7 sm:px-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.26em]" style={{ color: "#A8842A" }}>
                Gita Life NYC presents
              </p>
              <h3
                className="mt-1.5 text-[30px] leading-none sm:text-[34px]"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 700, color: "#15224F" }}
              >
                Free <em style={{ color: C.saffron }}>Pass</em>
              </h3>
            </div>
            <div
              className="rounded-xl px-3 py-2 text-center"
              style={{ background: "rgba(21,34,79,0.06)", border: "1px solid rgba(154,144,120,0.5)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#7A6F58" }}>
                Aug
              </p>
              <p className="text-[24px] font-bold leading-none tabular-nums" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", color: "#15224F" }}>
                15
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-[12.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#4F4634" }}>
            {EVENT.title} · {EVENT.volume} · Admit one (+ up to 4 friends)
          </p>

          {/* Passes-claimed meter */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-[11.5px] font-semibold">
              <span style={{ color: "#4F4634" }}>
                {claimed !== null ? `${claimed} of ${EVENT.capacity} passes claimed` : `Capacity ${EVENT.capacity} — first come, first served`}
              </span>
              {pct !== null && <span style={{ color: C.saffron }}>{pct}%</span>}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: "rgba(21,34,79,0.1)" }}>
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${pct ?? 8}%`,
                  background: `linear-gradient(90deg, ${C.gold}, ${C.saffron})`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative flex items-center" aria-hidden>
          <span className="absolute -left-3 h-6 w-6 rounded-full" style={{ background: "#080E2A" }} />
          <span className="mx-5 h-0 flex-1 border-t-2 border-dashed" style={{ borderColor: "rgba(154,144,120,0.7)" }} />
          <span className="absolute -right-3 h-6 w-6 rounded-full" style={{ background: "#080E2A" }} />
        </div>

        {/* Form / success */}
        {confirmedName ? (
          <div className="relative px-7 py-10 text-center sm:px-9">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 14 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: `${C.peacock}18`, border: `1.5px solid ${C.peacock}55` }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke={C.peacock} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <h4 className="mt-4 text-[24px]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 700, color: "#15224F" }}>
              You&rsquo;re on the list, {confirmedName}!
            </h4>
            <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "#4F4634" }}>
              Check your inbox for the details. Doors at 7 — come early, bring your people, leave the flask at home.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <a
                href={googleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-soft btn-soft-krishna w-full justify-center !py-3 sm:w-auto"
              >
                <Icon name="calendar" size={14} />
                Add to Google Calendar
              </a>
              <a
                href={`https://wa.me/?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-soft btn-soft-peacock w-full justify-center !py-3 sm:w-auto"
              >
                <Icon name="share" size={14} />
                Tell your crew
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-4 px-7 py-7 sm:px-9" noValidate>
            <div>
              <label htmlFor="bc-name" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#4F4634" }}>
                Your name <span style={{ color: C.saffron }}>*</span>
              </label>
              <input
                id="bc-name"
                type="text"
                placeholder="Who's coming?"
                className={`${inputBase} focus:ring-[#D9691A]/20 focus:border-[#D9691A]/60`}
                style={inputStyle(!!errors.name)}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="mt-1.5 text-[11.5px] font-medium" style={{ color: "#b04a4a" }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="bc-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#4F4634" }}>
                Email <span style={{ color: C.saffron }}>*</span>
              </label>
              <input
                id="bc-email"
                type="email"
                placeholder="you@example.com"
                className={`${inputBase} focus:ring-[#D9691A]/20 focus:border-[#D9691A]/60`}
                style={inputStyle(!!errors.email)}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email" },
                })}
              />
              {errors.email && (
                <p className="mt-1.5 text-[11.5px] font-medium" style={{ color: "#b04a4a" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="bc-phone" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#4F4634" }}>
                  Phone <span className="font-medium normal-case tracking-normal" style={{ color: "#7A6F58" }}>(optional)</span>
                </label>
                <input
                  id="bc-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  className={`${inputBase} focus:ring-[#D9691A]/20 focus:border-[#D9691A]/60`}
                  style={inputStyle()}
                  {...register("phone")}
                />
              </div>
              <div>
                <label htmlFor="bc-guests" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#4F4634" }}>
                  Crew
                </label>
                <select
                  id="bc-guests"
                  className={`${inputBase} cursor-pointer appearance-none focus:ring-[#D9691A]/20 focus:border-[#D9691A]/60`}
                  style={inputStyle()}
                  {...register("guests", { valueAsNumber: true })}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "Just me" : `${n} of us`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="bc-notes" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#4F4634" }}>
                Anything we should know? <span className="font-medium normal-case tracking-normal" style={{ color: "#7A6F58" }}>(optional)</span>
              </label>
              <textarea
                id="bc-notes"
                rows={2}
                placeholder="Dietary needs, accessibility, first kirtan ever…"
                className={`${inputBase} resize-none focus:ring-[#D9691A]/20 focus:border-[#D9691A]/60`}
                style={inputStyle()}
                {...register("notes")}
              />
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="btn-primary-gradient w-full rounded-xl py-4 text-[15px] font-bold text-white disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Holding your spot…
                </span>
              ) : (
                "Claim my free pass"
              )}
            </motion.button>

            <p className="text-center text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#7A6F58" }}>
              Free forever · No spam · Sober by design
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */
export default function RegisterPanel() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
      {/* lights strung over the box office */}
      <StringLights flags={false} className="absolute inset-x-0 top-1 z-0 opacity-90" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="eyebrow" style={{ color: C.goldLight }}>
          Get In
        </p>
        <h2 className="mt-3 text-3xl text-white sm:text-4xl" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
          Your name on the list, <em style={{ color: C.goldLight }}>free</em>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed" style={{ color: "rgba(251,245,230,0.65)" }}>
          Passes are capped at {EVENT.capacity} so the floor stays comfortable. Claim yours and we&rsquo;ll hold your spot at the door.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, delay: 0.08 }}
        className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.15fr]"
      >
        <VenueCard />
        <TicketForm />
      </motion.div>
    </section>
  );
}
