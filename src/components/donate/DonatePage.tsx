"use client";

/**
 * DonatePage — one-time donation flow for /donate.
 *
 *   Pick an amount (preset tiles or custom) → name + email →
 *   PAY-FIRST: hands off to Square Checkout, and the donation is only
 *   recorded once the returned order verifies as paid (same pattern as
 *   the Bhajan Clubbing ticket flow). With Square unconfigured the page
 *   shows a "briefly paused" panel instead of the form.
 *
 * Styled after the main site: khadi paper, Krishna indigo hero, cream
 * glass card, saffron CTA. Copy stays intentionally short.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { C, Icon } from "@/components/home/icons";
import {
  DEFAULT_AMOUNT_USD,
  DONATE,
  donationCents,
  MAX_DONATION_USD,
  MIN_DONATION_USD,
  POPULAR_AMOUNT_USD,
  PRESET_AMOUNTS_USD,
  usd,
} from "@/data/donation";

interface DonorForm {
  name: string;
  email: string;
}

type AmountChoice = number | "custom";

const ERROR_RED = "#B3261E";

// 16px on phones — anything smaller makes iOS Safari zoom the page when a
// field is focused (same rule as the Bhajan Clubbing ticket flow).
const inputClass =
  "w-full rounded-xl border px-4 py-3 text-[16px] sm:text-[14px] outline-none transition-all placeholder:text-[rgba(21,34,79,0.35)] focus:ring-2 focus:ring-[rgba(217,105,26,0.25)]";
const inputStyle = (err?: boolean): React.CSSProperties => ({
  background: "rgba(255,255,255,0.55)",
  borderColor: err ? ERROR_RED : "rgba(154,144,120,0.6)",
  color: "var(--ink-primary)",
});

const ghostBtnStyle: React.CSSProperties = {
  border: "1px solid rgba(21,34,79,0.25)",
  color: "var(--ink-primary)",
  background: "rgba(255,255,255,0.4)",
};

/* ------------------------------------------------------------------ */
/*  Amount tile                                                        */
/* ------------------------------------------------------------------ */
function AmountTile({
  label,
  badge,
  selected,
  onClick,
}: {
  label: string;
  badge?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-pressed={selected}
      className="relative rounded-xl border py-4 text-center transition-all"
      style={
        selected
          ? {
              background: "linear-gradient(135deg, #D9691A 0%, #B85308 100%)",
              borderColor: "transparent",
              color: "white",
              boxShadow: "0 2px 4px rgba(80,55,15,0.18), 0 10px 22px -8px rgba(217,105,26,0.55)",
            }
          : {
              background: "rgba(255,255,255,0.5)",
              borderColor: "rgba(154,144,120,0.6)",
              color: "var(--ink-primary)",
            }
      }
    >
      {badge && (
        <span
          className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
          style={{ background: C.goldLight, border: `1px solid ${C.gold}`, color: C.krishnaBlue }}
        >
          {badge}
        </span>
      )}
      <span className="font-serif text-[20px] font-semibold leading-none">{label}</span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function DonatePage() {
  const [amountChoice, setAmountChoice] = useState<AmountChoice>(DEFAULT_AMOUNT_USD);
  const [customAmount, setCustomAmount] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<string | null>(null);
  const [done, setDone] = useState<null | { name: string; amountCents: number; emailed: boolean }>(null);
  // Optimistic until the probe says otherwise — avoids a flash of "paused".
  const [payments, setPayments] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonorForm>();

  const selectedCents =
    amountChoice === "custom" ? donationCents(customAmount) : amountChoice * 100;

  // Verify a Square order; the donation is only recorded server-side once
  // the order is confirmed paid, so this IS the "record my gift" step.
  const verifyOrder = useCallback((orderId: string) => {
    setPendingOrder(null);
    setVerifying(true);
    fetch(`/api/donate/checkout?order=${encodeURIComponent(orderId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.paid) {
          setDone({
            name: String(data.name || "").split(" ")[0],
            amountCents: Number(data.amountCents) || 0,
            // emailed === false → recorded but the receipt failed;
            // null/undefined (already-handled order) counts as fine.
            emailed: data.emailed !== false,
          });
        } else {
          setPendingOrder(orderId); // show the retry panel
        }
      })
      .catch(() => setPendingOrder(orderId))
      .finally(() => setVerifying(false));
  }, []);

  // Returning from Square Checkout — verify the order before celebrating
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const paid = q.get("paid") === "1";
    const canceled = q.get("canceled") === "1";
    // `order` is pinned by our checkout API; `orderId` is Square's own param
    const orderId = q.get("order") ?? q.get("orderId");
    if (!paid && !canceled) return;

    // Scrub the query so refresh/share doesn't replay the redirect handling
    window.history.replaceState(null, "", window.location.pathname);

    if (canceled) {
      toast("Payment canceled — no charge was made.", { icon: "ℹ️" });
      return;
    }

    document.getElementById("donate-card")?.scrollIntoView({ behavior: "smooth" });

    if (!orderId) {
      toast.error(
        `We couldn't identify your payment. If you were charged, email us at ${DONATE.contactEmail} with your Square receipt and we'll sort it out.`,
      );
      return;
    }

    verifyOrder(orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Availability probe — pauses the form when Square isn't configured.
  useEffect(() => {
    fetch("/api/donate/checkout", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.payments === "boolean") setPayments(data.payments);
      })
      .catch(() => {
        /* probe is progressive enhancement — the form still stands */
      });
  }, []);

  const onSubmit = handleSubmit(async (d) => {
    if (selectedCents === null) {
      setCustomError(`Please enter an amount between $${MIN_DONATION_USD} and $${MAX_DONATION_USD.toLocaleString()}`);
      return;
    }
    setSubmitting(true);
    try {
      // PAY-FIRST: nothing is recorded until Square confirms the payment —
      // the verified return trip writes the donation + sends the receipt.
      const res = await fetch("/api/donate/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The amount is re-clamped server-side; this is a request, not a
        // price. An anonymous gift sends no name at all.
        body: JSON.stringify({
          name: anonymous ? null : d.name,
          email: d.email,
          amount: selectedCents / 100,
          anonymous,
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
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="surface-paper min-h-screen">
      <Navbar />
      <Toaster
        position="top-center"
        toastOptions={{ style: { background: "#FBF5E6", color: "#15224F", border: "1px solid rgba(154,144,120,0.55)" } }}
      />

      {/* ---------- Hero ---------- */}
      <section
        className="relative overflow-hidden px-6 pb-24 pt-28"
        style={{ background: `linear-gradient(170deg, ${C.krishnaDeep} 0%, ${C.krishnaBlue} 100%)` }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.saffron}, ${C.gold}, transparent)` }}
        />
        {/* soft warm glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: `radial-gradient(circle, ${C.gold}2E, transparent 70%)` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full"
          style={{ background: `radial-gradient(circle, ${C.saffron}26, transparent 70%)` }}
        />
        {/* lotus watermark */}
        <div aria-hidden className="pointer-events-none absolute -right-10 top-10 opacity-[0.07] sm:right-6">
          <Icon name="lotus" size={230} style={{ color: C.goldLight }} />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ background: "rgba(212,168,67,0.12)", border: `1px solid ${C.gold}30`, color: C.goldLight }}
          >
            <Icon name="lotus" size={12} />
            {DONATE.eyebrow}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-5 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl"
          >
            {DONATE.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.75] sm:text-[16px]"
            style={{ color: "rgba(255,251,242,0.72)" }}
          >
            {DONATE.blurb}
          </motion.p>
        </div>
      </section>

      {/* ---------- Where it goes — overlapping chips ---------- */}
      {/* z-10 lifts the cards above the positioned hero they overlap */}
      <section className="relative z-10 -mt-10 px-6">
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3">
          {DONATE.whereItGoes.map((item, i) => {
            const color = [C.saffron, C.peacock, C.gold][i % 3];
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl px-3 py-4 text-center"
                style={{ background: "white", border: `1px solid ${C.gold}20`, boxShadow: "0 8px 24px rgba(27,42,107,0.06)" }}
              >
                <span
                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ background: `${color}14`, color }}
                >
                  <Icon name={item.icon as "book" | "food" | "music"} size={17} />
                </span>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: C.krishnaBlue }}>
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------- Donation card ---------- */}
      <section id="donate-card" className="scroll-mt-24 px-6 pb-14 pt-12 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="glass-card mx-auto max-w-xl rounded-3xl p-6 sm:p-9"
        >
          {done ? (
            /* ---------- thank you ---------- */
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 13 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "rgba(0,109,91,0.1)", border: "1.5px solid rgba(0,109,91,0.45)" }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke={C.peacock} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <h2 className="mt-5 font-serif text-[26px] font-semibold" style={{ color: C.krishnaBlue }}>
                {done.name ? `Thank you, ${done.name} 🙏` : "Thank you 🙏"}
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                {done.amountCents > 0 ? `Your ${usd(done.amountCents)} donation is confirmed` : "Your donation is confirmed"}
                {done.emailed
                  ? " — a receipt is on its way to your inbox. Your gift is already at work."
                  : ". We couldn't send your receipt email, but your Square receipt is your proof of donation."}
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                <Link
                  href="/programs"
                  className="btn-primary-gradient inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold text-white sm:w-auto"
                >
                  Explore our programs
                  <Icon name="arrowRight" size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => setDone(null)}
                  className="inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-[13px] font-semibold transition-opacity hover:opacity-75 sm:w-auto"
                  style={ghostBtnStyle}
                >
                  Give again
                </button>
              </div>
            </motion.div>
          ) : verifying ? (
            /* ---------- verifying the Square return ---------- */
            <div className="flex flex-col items-center gap-4 py-12 text-center" role="status">
              <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" style={{ color: C.saffron }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-[14px] font-bold" style={{ color: C.krishnaBlue }}>
                Confirming your donation…
              </p>
              <p className="text-[12.5px]" style={{ color: "var(--ink-secondary)" }}>
                One second — we&rsquo;re checking with Square.
              </p>
            </div>
          ) : pendingOrder ? (
            /* ---------- payment made but not confirmed yet ---------- */
            <div className="py-6 text-center">
              <p className="pill-chip pill-chip-gold mx-auto inline-flex">Almost there</p>
              <h2 className="mt-5 font-serif text-[24px] font-semibold" style={{ color: C.krishnaBlue }}>
                We couldn&rsquo;t confirm your payment yet
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                Card payments can take a few seconds to settle. If you completed the payment, tap retry. If you were
                charged and this keeps failing, email us at{" "}
                <a
                  href={`mailto:${DONATE.contactEmail}`}
                  className="font-semibold underline underline-offset-2"
                  style={{ color: C.saffron }}
                >
                  {DONATE.contactEmail}
                </a>{" "}
                and we&rsquo;ll sort it.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => verifyOrder(pendingOrder)}
                  className="btn-primary-gradient inline-flex w-full items-center justify-center rounded-full px-7 py-3 text-[13px] font-semibold text-white sm:w-auto"
                >
                  Retry confirmation
                </button>
                <button
                  type="button"
                  onClick={() => setPendingOrder(null)}
                  className="inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-[13px] font-semibold transition-opacity hover:opacity-75 sm:w-auto"
                  style={ghostBtnStyle}
                >
                  Back to donations
                </button>
              </div>
            </div>
          ) : !payments ? (
            /* ---------- donations paused (Square unconfigured) ---------- */
            <div className="py-6 text-center">
              <p className="pill-chip pill-chip-gold mx-auto inline-flex">Back soon</p>
              <h2 className="mt-5 font-serif text-[24px] font-semibold" style={{ color: C.krishnaBlue }}>
                Online donations are briefly paused
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                Checkout is momentarily offline — please check back shortly, or write to us at{" "}
                <a
                  href={`mailto:${DONATE.contactEmail}`}
                  className="font-semibold underline underline-offset-2"
                  style={{ color: C.saffron }}
                >
                  {DONATE.contactEmail}
                </a>{" "}
                to give another way.
              </p>
            </div>
          ) : (
            /* ---------- the form ---------- */
            <form onSubmit={onSubmit} noValidate>
              <div className="text-center">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--divine-gold-deep)" }}>
                  One-time gift
                </span>
                <h2 className="mt-1.5 font-serif text-[26px] font-semibold" style={{ color: C.krishnaBlue }}>
                  Choose an amount
                </h2>
              </div>

              {/* amount tiles */}
              <div className="mt-6 grid grid-cols-3 gap-2.5">
                {PRESET_AMOUNTS_USD.map((amt) => (
                  <AmountTile
                    key={amt}
                    label={`$${amt.toLocaleString("en-US")}`}
                    badge={amt === POPULAR_AMOUNT_USD ? "Most chosen" : undefined}
                    selected={amountChoice === amt}
                    onClick={() => {
                      setAmountChoice(amt);
                      setCustomError(null);
                    }}
                  />
                ))}
                <AmountTile
                  label="Custom"
                  selected={amountChoice === "custom"}
                  onClick={() => setAmountChoice("custom")}
                />
              </div>

              {/* custom amount */}
              <AnimatePresence>
                {amountChoice === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative mt-4">
                      <span
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold"
                        style={{ color: "var(--ink-tertiary)" }}
                      >
                        $
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={MIN_DONATION_USD}
                        max={MAX_DONATION_USD}
                        step="1"
                        placeholder="Enter amount"
                        autoFocus
                        aria-label="Custom donation amount in dollars"
                        className={`${inputClass} pl-8`}
                        style={inputStyle(!!customError)}
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setCustomError(null);
                        }}
                      />
                    </div>
                    {customError ? (
                      <p className="mt-1.5 text-[11.5px] font-medium" style={{ color: ERROR_RED }}>
                        {customError}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[11.5px]" style={{ color: "var(--ink-tertiary)" }}>
                        Between ${MIN_DONATION_USD} and ${MAX_DONATION_USD.toLocaleString()} — for larger gifts,{" "}
                        <a href={`mailto:${DONATE.contactEmail}`} className="underline underline-offset-2">
                          email us
                        </a>
                        .
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* anonymous option */}
              <label
                className="mt-5 flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border px-4 py-3 transition-colors"
                style={{
                  borderColor: anonymous ? "rgba(217,105,26,0.45)" : "rgba(154,144,120,0.6)",
                  background: anonymous ? "rgba(217,105,26,0.07)" : "rgba(255,255,255,0.35)",
                }}
              >
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="h-4 w-4 cursor-pointer"
                  style={{ accentColor: C.saffron }}
                />
                <span className="text-[13px] font-semibold" style={{ color: "var(--ink-primary)" }}>
                  Make my donation anonymous
                </span>
              </label>

              {/* donor details */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {!anonymous && (
                  <div>
                    <label
                      htmlFor="don-name"
                      className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]"
                      style={{ color: "var(--ink-secondary)" }}
                    >
                      Your name <span style={{ color: C.saffron }}>*</span>
                    </label>
                    <input
                      id="don-name"
                      type="text"
                      placeholder="Full name"
                      className={inputClass}
                      style={inputStyle(!!errors.name)}
                      // shouldUnregister drops the field (and its required
                      // rule) when the anonymous toggle unmounts it — an
                      // invisible name can never block the submit.
                      {...register("name", { shouldUnregister: true, required: "Your name is required" })}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-[11px] font-medium" style={{ color: ERROR_RED }}>
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                )}
                <div className={anonymous ? "sm:col-span-2" : ""}>
                  <label
                    htmlFor="don-email"
                    className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-[0.18em]"
                    style={{ color: "var(--ink-secondary)" }}
                  >
                    Email for receipt <span style={{ color: C.saffron }}>*</span>
                  </label>
                  <input
                    id="don-email"
                    type="email"
                    placeholder="you@example.com"
                    className={inputClass}
                    style={inputStyle(!!errors.email)}
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email" },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-[11px] font-medium" style={{ color: ERROR_RED }}>
                      {errors.email.message}
                    </p>
                  )}
                  {anonymous && !errors.email && (
                    <p className="mt-1.5 text-[11.5px]" style={{ color: "var(--ink-tertiary)" }}>
                      Only used to send your receipt — never shared or shown anywhere.
                    </p>
                  )}
                </div>
              </div>

              {/* submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-gradient w-full rounded-full py-3.5 text-[14px] font-bold text-white disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Taking you to checkout…
                    </span>
                  ) : selectedCents !== null ? (
                    `Donate ${usd(selectedCents)}`
                  ) : (
                    "Donate"
                  )}
                </button>
                <p
                  className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px]"
                  style={{ color: "var(--ink-tertiary)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="7" width="10" height="7" rx="1.5" />
                    <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                  </svg>
                  Secure card payment via Square · Receipt by email
                </p>
              </div>
            </form>
          )}
        </motion.div>

        {/* transparency note */}
        <p
          className="mx-auto mt-6 max-w-xl text-center text-[12.5px] leading-relaxed"
          style={{ color: "var(--ink-secondary)" }}
        >
          {DONATE.note}
        </p>
      </section>

      {/* ---------- closing ---------- */}
      <section className="px-6 pb-16">
        <div className="ornament-ink mx-auto max-w-xs" />
        <p className="mt-8 text-center text-[13.5px]" style={{ color: "var(--ink-secondary)" }}>
          Prefer to give your time instead?{" "}
          <Link href="/volunteer" className="font-semibold underline underline-offset-2" style={{ color: C.saffron }}>
            Volunteer with us
          </Link>
        </p>
        <p
          className="mt-8 text-center text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--ink-tertiary)" }}
        >
          Gita Life NYC · A community initiative under ISKCON
        </p>
      </section>
    </div>
  );
}
