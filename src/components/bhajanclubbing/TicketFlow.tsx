"use client";

/**
 * TicketFlow — in-page two-step checkout for the single paid ticket.
 *
 *   Step 1  Details (name, mobile, email, ticket count, optional
 *           how-heard + required email-updates yes/no)
 *   Step 2  Review → PAY-FIRST: hands off to Square Checkout and the
 *           RSVP is only created once the returned order verifies as
 *           paid. No payment, no registration. With Square unconfigured
 *           the flow shows a "sales paused" panel instead of the form.
 *
 * Live availability (GET /api/bhajanclubbing) drives guest-count caps and
 * the sold-out panel. Returning from Square Checkout with ?paid=1&order=…
 * verifies the order server-side before showing the paid confirmation.
 * Registration rows land in the existing admin RSVP table.
 */

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Icon } from "@/components/home/icons";
import { EVENT, SHARE, TIERS } from "@/data/bhajanClubbing";

/** The one ticket on sale — price, tag, and perks live in the data file. */
const TICKET = TIERS[0];

interface DetailsForm {
  name: string;
  email: string;
  phone: string;
  guests: number;
  /** Optional — "How did you hear about this event?" */
  hearAbout: string;
  /** Required consent — "yes" | "no" to email updates about events/programs. */
  emailUpdates: string;
}

const HEAR_ABOUT_OPTIONS = [
  "Instagram",
  "WhatsApp",
  "Friend or family",
  "Temple announcement",
  "YouTube",
  "Other",
];

/* ------------------------------------------------------------------ */
/*  Live availability — GET /api/bhajanclubbing                         */
/* ------------------------------------------------------------------ */
interface TierAvailability {
  limit: number;
  taken: number;
  remaining: number;
}

interface Availability {
  capacity: number;
  confirmed: number | null;
  remaining: number | null; // null → DB offline, fall back to static copy
  tiers: Record<string, TierAvailability> | null;
  payments?: boolean; // false → Square unconfigured, paid tiers unavailable
}

function useAvailability() {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const refresh = useCallback(() => {
    fetch("/api/bhajanclubbing", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setAvailability(data))
      .catch(() => {
        /* the meter is progressive enhancement — static copy still stands */
      });
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { availability, refresh };
}

function googleCalendarUrl() {
  const toStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${EVENT.title} — ${EVENT.volume}`,
    dates: `${toStamp(EVENT.startIso)}/${toStamp(EVENT.endIso)}`,
    details: `${EVENT.description}\n\n${EVENT.url}`,
    location: `${EVENT.venue.name}, ${EVENT.venue.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const inputClass =
  "w-full rounded-xl border px-4 py-3 text-[14px] text-club-ink outline-none transition-all placeholder:text-[rgba(244,240,235,0.3)] focus:ring-2 focus:ring-[#D98A4A]/30";
const inputStyle = (err?: boolean): React.CSSProperties => ({
  background: "rgba(244,240,235,0.06)",
  borderColor: err ? "rgba(255,110,110,0.6)" : "rgba(244,240,235,0.16)",
});

/* ------------------------------------------------------------------ */
/*  Stepper header                                                     */
/* ------------------------------------------------------------------ */
function Stepper({ step }: { step: number }) {
  const labels = ["Details", "Confirm"];
  return (
    <div className="flex items-center justify-center gap-0" aria-label={`Step ${step + 1} of ${labels.length}`}>
      {labels.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-extrabold transition-all"
              style={
                i <= step
                  ? { background: "linear-gradient(135deg, #E5C08D, #D98A4A)", color: "#241505", boxShadow: "0 0 18px rgba(217,138,74,0.55)" }
                  : { background: "rgba(244,240,235,0.07)", color: "var(--bc2-ink-faint)", border: "1px solid rgba(244,240,235,0.15)" }
              }
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: i <= step ? "var(--bc2-amber)" : "var(--bc2-ink-faint)" }}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <span className="bc2-step-line mx-3 mb-5 h-px w-10 sm:w-16" style={i < step ? { background: "linear-gradient(90deg, #D98A4A, #E5C08D)" } : undefined} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Flow                                                               */
/* ------------------------------------------------------------------ */
export default function TicketFlow() {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<DetailsForm | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<string | null>(null);
  const [done, setDone] = useState<null | { name: string; emailed: boolean }>(null);
  const { availability, refresh } = useAvailability();

  // Verify a Square order; the RSVP is only created server-side once the
  // order is confirmed paid, so this IS the registration step.
  const verifyOrder = useCallback(
    (orderId: string) => {
      setPendingOrder(null);
      setVerifying(true);
      fetch(`/api/bhajanclubbing/checkout?order=${encodeURIComponent(orderId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.paid) {
            // emailed === false → registration saved but the email failed;
            // null/undefined (already-handled order) counts as fine.
            setDone({ name: String(data.name || "").split(" ")[0], emailed: data.emailed !== false });
            refresh();
          } else {
            setPendingOrder(orderId); // show the retry panel
          }
        })
        .catch(() => setPendingOrder(orderId))
        .finally(() => setVerifying(false));
    },
    [refresh],
  );

  // Returning from Square Checkout — verify the order before celebrating
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const paid = q.get("paid") === "1";
    const canceled = q.get("canceled") === "1";
    // `order` is pinned by our checkout API; `orderId` is Square's own param
    const orderId = q.get("order") ?? q.get("orderId");
    if (!paid && !canceled) return;

    // Scrub the query so refresh/share doesn't replay the redirect handling
    window.history.replaceState(null, "", window.location.pathname + (window.location.hash || "#tickets"));

    if (canceled) {
      toast("Payment canceled — no charge was made.", { icon: "ℹ️" });
      return;
    }

    document.getElementById("tickets")?.scrollIntoView({ behavior: "smooth" });

    if (!orderId) {
      toast.error("We couldn't identify your payment. If you were charged, your Square receipt is in your inbox — reply to it and we'll sort your ticket.");
      return;
    }

    verifyOrder(orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<DetailsForm>({ defaultValues: { guests: 1, hearAbout: "", emailUpdates: "" } });

  const onConfirm = async () => {
    const d = details ?? getValues();
    setSubmitting(true);
    try {
      // PAY-FIRST: no registration exists until Square confirms the
      // payment — the verified return trip creates the RSVP.
      const res = await fetch("/api/bhajanclubbing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          email: d.email,
          phone: d.phone,
          guests: d.guests || 1,
          hearAbout: d.hearAbout || null,
          emailOptIn: d.emailUpdates === "yes",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url as string; // → Square, returns with ?paid=1&order=…
        return;
      }
      throw new Error(data.error || "Couldn't start checkout — please try again");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start checkout. Please try again.");
      refresh(); // a capacity rejection means availability just moved
    } finally {
      setSubmitting(false);
    }
  };

  const maxGuests = Math.max(1, Math.min(5, availability?.remaining ?? 5));
  const soldOut = availability?.remaining === 0;
  const paymentsOff = !soldOut && availability?.payments === false;

  const shareText = encodeURIComponent(`${SHARE.message} ${EVENT.url}`);
  const stepMotion = {
    initial: { opacity: 0, x: 32 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -32 },
    transition: { duration: 0.35 },
  };

  return (
    <section id="tickets" className="relative mx-auto max-w-4xl scroll-mt-20 px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
          Tickets
        </p>
        <h2 className="bc2-display mt-4 text-[30px] text-club-ink sm:text-[40px]">
          Lock in <span className="bc2-headline-grad">your night</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[14px]" style={{ color: "var(--bc2-ink-dim)" }}>
          {TICKET.tag} per person. Secure card checkout via Square — free packed prasadam included.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay: 0.08 }}
        className="bc2-glass mt-12 p-6 sm:p-9"
      >
        {done ? (
          /* ---------- confirmation ---------- */
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 13 }}
              className="mx-auto flex h-18 w-18 items-center justify-center rounded-full p-5"
              style={{ background: "rgba(143,207,168,0.1)", border: "1.5px solid rgba(143,207,168,0.45)" }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="#8FCFA8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <h3 className="bc2-display mt-5 text-[26px] text-club-ink">
              {done.name ? `Payment received — you're in, ${done.name}` : "Payment received — you're in"}
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
              {done.emailed
                ? "Check your inbox for your receipt and the event details. Doors at 6 — come early."
                : "You're on the door list under your name. We couldn't send your confirmation email, but your Square receipt is your proof of purchase. Doors at 6 — come early."}
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="bc2-btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold sm:w-auto">
                <Icon name="calendar" size={14} />
                Add to Google Calendar
              </a>
              <a
                href={`https://wa.me/?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bc2-btn-glow inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-extrabold sm:w-auto"
                style={{ animation: "none" }}
              >
                <Icon name="share" size={14} />
                Tell your crew
              </a>
            </div>
          </motion.div>
        ) : verifying ? (
          /* ---------- verifying the Square return ---------- */
          <div className="flex flex-col items-center gap-4 py-14 text-center" role="status">
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" style={{ color: "var(--bc2-amber)" }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[14px] font-bold text-club-ink">Confirming your payment…</p>
            <p className="text-[12.5px]" style={{ color: "var(--bc2-ink-dim)" }}>
              One second — we&rsquo;re checking with Square.
            </p>
          </div>
        ) : pendingOrder ? (
          /* ---------- payment made but not confirmed yet ---------- */
          <div className="py-8 text-center">
            <p
              className="mx-auto inline-block rounded-full px-4 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.22em]"
              style={{ background: "rgba(229,192,141,0.1)", border: "1px solid rgba(229,192,141,0.4)", color: "var(--bc2-amber)" }}
            >
              Almost there
            </p>
            <h3 className="bc2-display mt-5 text-[24px] text-club-ink">We couldn&rsquo;t confirm your payment yet</h3>
            <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
              Card payments can take a few seconds to settle. If you completed the payment, tap retry — your ticket is
              issued the moment it confirms. If you were charged and this keeps failing, reply to your Square receipt
              and we&rsquo;ll sort it.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => verifyOrder(pendingOrder)}
                className="bc2-btn-glow inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3 text-[13px] font-extrabold sm:w-auto"
                style={{ animation: "none" }}
              >
                Retry confirmation
              </button>
              <button
                type="button"
                onClick={() => setPendingOrder(null)}
                className="bc2-btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold sm:w-auto"
              >
                Back to tickets
              </button>
            </div>
          </div>
        ) : soldOut ? (
          /* ---------- sold out ---------- */
          <div className="py-8 text-center">
            <p
              className="mx-auto inline-block rounded-full px-4 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.22em]"
              style={{ background: "rgba(255,110,110,0.1)", border: "1px solid rgba(255,110,110,0.4)", color: "#FF9E9E" }}
            >
              Sold out
            </p>
            <h3 className="bc2-display mt-5 text-[26px] text-club-ink">Every ticket is claimed</h3>
            <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
              No-show spots open at the door — the line starts at 5:45 PM. Bring your crew and your patience.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="bc2-btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold sm:w-auto">
                <Icon name="calendar" size={14} />
                Save the date anyway
              </a>
              <a
                href={`https://wa.me/?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bc2-btn-glow inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-extrabold sm:w-auto"
                style={{ animation: "none" }}
              >
                <Icon name="share" size={14} />
                Rally the door line
              </a>
            </div>
          </div>
        ) : paymentsOff ? (
          /* ---------- ticket sales paused (Square unconfigured) ---------- */
          <div className="py-8 text-center">
            <p
              className="mx-auto inline-block rounded-full px-4 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.22em]"
              style={{ background: "rgba(229,192,141,0.1)", border: "1px solid rgba(229,192,141,0.4)", color: "var(--bc2-amber)" }}
            >
              Back soon
            </p>
            <h3 className="bc2-display mt-5 text-[24px] text-club-ink">Ticket sales are briefly paused</h3>
            <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
              Online checkout is momentarily offline. Save the date and check back shortly — tickets are {TICKET.tag} per
              person, free packed prasadam included.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="bc2-btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold sm:w-auto">
                <Icon name="calendar" size={14} />
                Save the date
              </a>
            </div>
          </div>
        ) : (
          <>
            <Stepper step={step} />
            <div className="mt-8 overflow-hidden">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="details" {...stepMotion}>
                    <form
                      onSubmit={handleSubmit((d) => {
                        setDetails(d);
                        setStep(1);
                      })}
                      className="space-y-4"
                      noValidate
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="tf-name" className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-dim)" }}>
                            Full name <span style={{ color: "var(--bc2-saffron)" }}>*</span>
                          </label>
                          <input id="tf-name" type="text" placeholder="Who's coming?" className={inputClass} style={inputStyle(!!errors.name)} {...register("name", { required: "Full name is required" })} />
                          {errors.name && <p className="mt-1.5 text-[11px] font-medium" style={{ color: "#FF8E8E" }}>{errors.name.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="tf-email" className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-dim)" }}>
                            Email address <span style={{ color: "var(--bc2-saffron)" }}>*</span>
                          </label>
                          <input
                            id="tf-email"
                            type="email"
                            placeholder="you@example.com"
                            className={inputClass}
                            style={inputStyle(!!errors.email)}
                            {...register("email", {
                              required: "Email is required",
                              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email" },
                            })}
                          />
                          {errors.email && <p className="mt-1.5 text-[11px] font-medium" style={{ color: "#FF8E8E" }}>{errors.email.message}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label htmlFor="tf-phone" className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-dim)" }}>
                            Mobile number <span style={{ color: "var(--bc2-saffron)" }}>*</span>
                          </label>
                          <input
                            id="tf-phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            className={inputClass}
                            style={inputStyle(!!errors.phone)}
                            {...register("phone", {
                              required: "Mobile number is required",
                              pattern: { value: /^[+()\d\s.-]{7,20}$/, message: "Please enter a valid mobile number" },
                            })}
                          />
                          {errors.phone && <p className="mt-1.5 text-[11px] font-medium" style={{ color: "#FF8E8E" }}>{errors.phone.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="tf-guests" className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-dim)" }}>
                            Tickets <span style={{ color: "var(--bc2-saffron)" }}>*</span>
                          </label>
                          <select
                            id="tf-guests"
                            className={`${inputClass} cursor-pointer appearance-none`}
                            style={inputStyle()}
                            {...register("guests", {
                              valueAsNumber: true,
                              validate: (n) => n <= maxGuests || `Only ${maxGuests} ticket${maxGuests === 1 ? "" : "s"} left`,
                            })}
                          >
                            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n} style={{ background: "#241831" }}>
                                {n === 1 ? "1 ticket" : `${n} tickets`}
                              </option>
                            ))}
                          </select>
                          {errors.guests && <p className="mt-1.5 text-[11px] font-medium" style={{ color: "#FF8E8E" }}>{errors.guests.message}</p>}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="tf-hear" className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-dim)" }}>
                          How did you hear about this event? <span className="normal-case tracking-normal" style={{ color: "var(--bc2-ink-faint)" }}>(optional)</span>
                        </label>
                        <select id="tf-hear" className={`${inputClass} cursor-pointer appearance-none`} style={inputStyle()} {...register("hearAbout")}>
                          <option value="" style={{ background: "#241831" }}>
                            Pick one (optional)
                          </option>
                          {HEAR_ABOUT_OPTIONS.map((option) => (
                            <option key={option} value={option} style={{ background: "#241831" }}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="tf-updates" className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-dim)" }}>
                          Would you like to receive updates regarding events/programs by email? <span style={{ color: "var(--bc2-saffron)" }}>*</span>
                        </label>
                        <select
                          id="tf-updates"
                          className={`${inputClass} cursor-pointer appearance-none`}
                          style={inputStyle(!!errors.emailUpdates)}
                          {...register("emailUpdates", { required: "Please select Yes or No" })}
                        >
                          <option value="" style={{ background: "#241831" }}>
                            Select Yes or No
                          </option>
                          <option value="yes" style={{ background: "#241831" }}>
                            Yes
                          </option>
                          <option value="no" style={{ background: "#241831" }}>
                            No
                          </option>
                        </select>
                        {errors.emailUpdates && <p className="mt-1.5 text-[11px] font-medium" style={{ color: "#FF8E8E" }}>{errors.emailUpdates.message}</p>}
                      </div>
                      <div className="pt-2">
                        <button type="submit" className="bc2-btn-glow w-full rounded-full py-3.5 text-[13px] font-extrabold uppercase tracking-[0.08em]" style={{ animation: "none" }}>
                          Review order
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {step === 1 && details && (
                  <motion.div key="confirm" {...stepMotion}>
                    {/* order summary */}
                    <div className="rounded-2xl p-5" style={{ background: "rgba(26,22,35,0.5)", border: "1px solid rgba(244,240,235,0.12)" }}>
                      {[
                        { k: "Ticket", v: `${TICKET.name} · ${TICKET.tag}${details.guests > 1 ? ` × ${details.guests}` : ""}` },
                        { k: "Name", v: details.name },
                        { k: "Email", v: details.email },
                        { k: "Mobile", v: details.phone },
                        { k: "Tickets", v: details.guests === 1 ? "1 ticket" : `${details.guests} tickets` },
                        ...(details.hearAbout ? [{ k: "Heard via", v: details.hearAbout }] : []),
                        { k: "Email updates", v: details.emailUpdates === "yes" ? "Yes" : "No" },
                        { k: "Event", v: `${EVENT.dateLabel} · ${EVENT.doorsLabel}` },
                      ].map((row) => (
                        <div key={row.k} className="flex items-baseline justify-between gap-4 border-b py-2.5 last:border-0" style={{ borderColor: "rgba(244,240,235,0.07)" }}>
                          <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-faint)" }}>
                            {row.k}
                          </span>
                          <span className="text-right text-[13px] font-semibold text-club-ink">{row.v}</span>
                        </div>
                      ))}
                      <div className="flex items-baseline justify-between pt-3">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-faint)" }}>
                          Total
                        </span>
                        <span className="bc2-display text-[24px]" style={{ color: "var(--bc2-amber)", fontWeight: 700 }}>
                          ${(TICKET.priceUsd * details.guests).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px]" style={{ color: "var(--bc2-ink-faint)" }}>
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="7" width="10" height="7" rx="1.5" />
                        <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                      </svg>
                      Secure card payment via Square — your ticket is issued the moment the payment confirms.
                    </p>

                    <div className="mt-5 flex gap-3">
                      <button type="button" onClick={() => setStep(0)} className="bc2-btn-ghost flex-1 rounded-full py-4 text-[13px] font-bold" disabled={submitting}>
                        Back
                      </button>
                      <button type="button" onClick={onConfirm} disabled={submitting} className="bc2-btn-glow flex-[2] rounded-full py-4 text-[14px] font-extrabold uppercase tracking-[0.08em] disabled:opacity-60">
                        {submitting ? (
                          <span className="inline-flex items-center gap-2">
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Locking it in…
                          </span>
                        ) : (
                          `Pay $${(TICKET.priceUsd * details.guests).toFixed(2)} securely`
                        )}
                      </button>
                    </div>
                    <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--bc2-ink-faint)" }}>
                      No spam · Sober by design · Packed prasadam included
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}
