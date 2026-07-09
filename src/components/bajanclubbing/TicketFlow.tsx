"use client";

/**
 * TicketFlow — in-page multi-step registration & checkout.
 *
 *   Step 1  Pick a tier (General / Front Row — free · VIP — $21 seva)
 *   Step 2  Details (name, email, phone, crew size)
 *   Step 3  Review → free tiers register instantly; VIP registers then
 *           hands off to Stripe Checkout when the server has keys, and
 *           falls back to pay-at-the-door when it doesn't.
 *
 * Returning from Stripe with ?paid=1 (read client-side) shows the paid
 * confirmation. Registration rows land in the existing admin RSVP table.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Icon } from "@/components/home/icons";
import { EVENT, SHARE, TIERS, type TicketTier } from "@/data/bajanClubbing";

const ACCENT: Record<string, string> = {
  gold: "#FFB25C",
  saffron: "#FF7A1A",
  peacock: "#4D9FFF",
  lotus: "#E86BB7",
};

interface DetailsForm {
  name: string;
  email: string;
  phone?: string;
  guests: number;
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
  "w-full rounded-xl border px-4 py-3 text-[14px] text-white outline-none transition-all placeholder:text-[rgba(244,239,255,0.3)] focus:ring-2 focus:ring-[#FF7A1A]/25";
const inputStyle = (err?: boolean): React.CSSProperties => ({
  background: "rgba(244,239,255,0.06)",
  borderColor: err ? "rgba(255,110,110,0.6)" : "rgba(244,239,255,0.16)",
});

/* ------------------------------------------------------------------ */
/*  Stepper header                                                     */
/* ------------------------------------------------------------------ */
function Stepper({ step }: { step: number }) {
  const labels = ["Tier", "Details", "Confirm"];
  return (
    <div className="flex items-center justify-center gap-0" aria-label={`Step ${step + 1} of 3`}>
      {labels.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-extrabold transition-all"
              style={
                i <= step
                  ? { background: "linear-gradient(135deg, #FFB25C, #FF7A1A)", color: "#1C0A02", boxShadow: "0 0 18px rgba(255,122,26,0.55)" }
                  : { background: "rgba(244,239,255,0.07)", color: "var(--bc2-ink-faint)", border: "1px solid rgba(244,239,255,0.15)" }
              }
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: i <= step ? "var(--bc2-amber)" : "var(--bc2-ink-faint)" }}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <span className="bc2-step-line mx-3 mb-5 h-px w-10 sm:w-16" style={i < step ? { background: "linear-gradient(90deg, #FF7A1A, #FFB25C)" } : undefined} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — tier cards                                                */
/* ------------------------------------------------------------------ */
function TierStep({ selected, onSelect, onNext }: { selected: TicketTier; onSelect: (t: TicketTier) => void; onNext: () => void }) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const a = ACCENT[tier.accent];
          const active = selected.id === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelect(tier)}
              className="bc2-edge-top relative rounded-2xl p-5 text-left transition-all"
              style={{
                "--bc2-edge": a,
                background: active ? `linear-gradient(165deg, ${a}1f, rgba(11,6,32,0.6))` : "rgba(244,239,255,0.045)",
                border: active ? `1.5px solid ${a}99` : "1px solid rgba(244,239,255,0.13)",
                boxShadow: active ? `0 16px 44px -16px ${a}66` : "none",
                transform: active ? "translateY(-3px)" : "none",
              } as React.CSSProperties}
              aria-pressed={active}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.16em]" style={{ background: `${a}1f`, border: `1px solid ${a}59`, color: a }}>
                  {tier.tag}
                </span>
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full border transition-all"
                  style={{ borderColor: active ? a : "rgba(244,239,255,0.25)", background: active ? a : "transparent" }}
                  aria-hidden
                >
                  {active && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L19 7" stroke="#1C0A02" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </div>
              <h4 className="bc2-display mt-3 text-[16px] text-white" style={{ fontWeight: 700 }}>
                {tier.name}
              </h4>
              <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
                {tier.blurb}
              </p>
              <ul className="mt-3 space-y-1.5">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-[11.5px]" style={{ color: "var(--bc2-ink-dim)" }}>
                    <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full" style={{ background: a }} aria-hidden />
                    {perk}
                  </li>
                ))}
              </ul>
              <p className="bc2-display mt-4 text-[20px]" style={{ color: a, fontWeight: 700 }}>
                {tier.priceUsd === 0 ? "Free" : `$${tier.priceUsd}`}
              </p>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onNext} className="bc2-btn-glow mt-6 w-full rounded-full py-4 text-[14px] font-extrabold uppercase tracking-[0.08em]">
        Continue — {selected.name}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Flow                                                               */
/* ------------------------------------------------------------------ */
export default function TicketFlow() {
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<TicketTier>(TIERS[0]);
  const [details, setDetails] = useState<DetailsForm | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { name: string; paid: boolean; payAtDoor: boolean }>(null);

  // Returning from Stripe Checkout (?paid=1) — client-only read
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("paid") === "1") {
      setDone({ name: "", paid: true, payAtDoor: false });
      document.getElementById("tickets")?.scrollIntoView({ behavior: "smooth" });
    } else if (q.get("canceled") === "1") {
      toast("Payment canceled — your free registration still counts.", { icon: "ℹ️" });
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<DetailsForm>({ defaultValues: { guests: 1 } });

  const registerPass = async (d: DetailsForm) => {
    const res = await fetch("/api/bajanclubbing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: d.name,
        email: d.email,
        phone: d.phone || null,
        guests: d.guests || 1,
        tier: tier.name,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Something went wrong" }));
      // Already registered still lets a VIP proceed to payment
      if (res.status !== 409) throw new Error(err.error || "Failed to register");
    }
  };

  const onConfirm = async () => {
    const d = details ?? getValues();
    setSubmitting(true);
    try {
      await registerPass(d);

      if (tier.priceUsd > 0) {
        // VIP → Stripe Checkout (server returns url when keys are set)
        const res = await fetch("/api/bajanclubbing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: d.name, email: d.email, guests: d.guests || 1 }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) {
          window.location.href = data.url as string; // → Stripe, returns with ?paid=1
          return;
        }
        // Stripe not configured — registered; take seva at the door
        setDone({ name: d.name.split(" ")[0], paid: false, payAtDoor: true });
        toast.success("You're in! Seva donation collected at the door.", { duration: 5000 });
      } else {
        setDone({ name: d.name.split(" ")[0], paid: false, payAtDoor: false });
        toast.success("Pass confirmed — see you on the floor!", { duration: 4500 });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
        <h2 className="bc2-display mt-4 text-[30px] text-white sm:text-[40px]">
          Lock in <span className="bc2-headline-grad">your night</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[14px]" style={{ color: "var(--bc2-ink-dim)" }}>
          {EVENT.capacity} spots total. Free tiers confirm instantly; the VIP seva donation checks out securely without leaving the page flow.
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
              style={{ background: "rgba(77,255,166,0.1)", border: "1.5px solid rgba(77,255,166,0.45)" }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="#4DFFA6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <h3 className="bc2-display mt-5 text-[26px] text-white">
              {done.paid ? "Payment received — you're VIP" : done.name ? `You're on the list, ${done.name}` : "You're on the list"}
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
              {done.paid
                ? "Your seva funds the free feast — thank you. Check your inbox for the receipt and the backstage chai details."
                : done.payAtDoor
                  ? "Your VIP spot is held — bring the $21 seva donation to the door (card or cash) and walk straight in."
                  : "Check your inbox for the details. Doors at 7 — come early, the chai goes fast."}
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
        ) : (
          <>
            <Stepper step={step} />
            <div className="mt-8 overflow-hidden">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="tier" {...stepMotion}>
                    <TierStep selected={tier} onSelect={setTier} onNext={() => setStep(1)} />
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="details" {...stepMotion}>
                    <form
                      onSubmit={handleSubmit((d) => {
                        setDetails(d);
                        setStep(2);
                      })}
                      className="space-y-4"
                      noValidate
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="tf-name" className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-dim)" }}>
                            Your name <span style={{ color: "var(--bc2-saffron)" }}>*</span>
                          </label>
                          <input id="tf-name" type="text" placeholder="Who's coming?" className={inputClass} style={inputStyle(!!errors.name)} {...register("name", { required: "Name is required" })} />
                          {errors.name && <p className="mt-1.5 text-[11px] font-medium" style={{ color: "#FF8E8E" }}>{errors.name.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="tf-email" className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-dim)" }}>
                            Email <span style={{ color: "var(--bc2-saffron)" }}>*</span>
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
                            Phone <span className="normal-case tracking-normal" style={{ color: "var(--bc2-ink-faint)" }}>(optional)</span>
                          </label>
                          <input id="tf-phone" type="tel" placeholder="(555) 123-4567" className={inputClass} style={inputStyle()} {...register("phone")} />
                        </div>
                        <div>
                          <label htmlFor="tf-guests" className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-dim)" }}>
                            Crew
                          </label>
                          <select id="tf-guests" className={`${inputClass} cursor-pointer appearance-none`} style={inputStyle()} {...register("guests", { valueAsNumber: true })}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n} style={{ background: "#150A38" }}>
                                {n === 1 ? "Just me" : `${n} of us`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setStep(0)} className="bc2-btn-ghost flex-1 rounded-full py-3.5 text-[13px] font-bold">
                          Back
                        </button>
                        <button type="submit" className="bc2-btn-glow flex-[2] rounded-full py-3.5 text-[13px] font-extrabold uppercase tracking-[0.08em]" style={{ animation: "none" }}>
                          Review order
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {step === 2 && details && (
                  <motion.div key="confirm" {...stepMotion}>
                    {/* order summary */}
                    <div className="rounded-2xl p-5" style={{ background: "rgba(7,3,19,0.5)", border: "1px solid rgba(244,239,255,0.12)" }}>
                      {[
                        { k: "Ticket", v: `${tier.name} · ${tier.tag}` },
                        { k: "Name", v: details.name },
                        { k: "Email", v: details.email },
                        { k: "Crew", v: details.guests === 1 ? "Just you" : `${details.guests} people` },
                        { k: "Event", v: `${EVENT.dateLabel} · ${EVENT.doorsLabel}` },
                      ].map((row) => (
                        <div key={row.k} className="flex items-baseline justify-between gap-4 border-b py-2.5 last:border-0" style={{ borderColor: "rgba(244,239,255,0.07)" }}>
                          <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-faint)" }}>
                            {row.k}
                          </span>
                          <span className="text-right text-[13px] font-semibold text-white">{row.v}</span>
                        </div>
                      ))}
                      <div className="flex items-baseline justify-between pt-3">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--bc2-ink-faint)" }}>
                          Total
                        </span>
                        <span className="bc2-display text-[24px]" style={{ color: "var(--bc2-amber)", fontWeight: 700 }}>
                          {tier.priceUsd === 0 ? "Free" : `$${tier.priceUsd}`}
                        </span>
                      </div>
                    </div>

                    {tier.priceUsd > 0 && (
                      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px]" style={{ color: "var(--bc2-ink-faint)" }}>
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="7" width="10" height="7" rx="1.5" />
                          <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                        </svg>
                        Secure card payment via Stripe — you&rsquo;ll hop over and come right back.
                      </p>
                    )}

                    <div className="mt-5 flex gap-3">
                      <button type="button" onClick={() => setStep(1)} className="bc2-btn-ghost flex-1 rounded-full py-4 text-[13px] font-bold" disabled={submitting}>
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
                        ) : tier.priceUsd === 0 ? (
                          "Confirm free pass"
                        ) : (
                          `Pay $${tier.priceUsd} securely`
                        )}
                      </button>
                    </div>
                    <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--bc2-ink-faint)" }}>
                      No spam · Sober by design · Feast included
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
