"use client";

/**
 * RetreatRegisterForm — registration for one retreat (src/data/retreats.ts).
 *
 * The usual details (name, email, mobile, WhatsApp, location, university
 * or company) plus "student or working" — which sets the price — and a
 * Zelle payment card (QR + number + suggested memo) with an "I've sent
 * it" tick. Same one-and-done contract as the other forms: re-submitting
 * with the same email updates the registration (and can flip payment to
 * "reported") instead of duplicating; success is remembered in
 * localStorage per retreat.
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  OCCUPATIONS,
  formatUsd,
  retreatPrice,
  zelleMemo,
  type Occupation,
  type RetreatConfig,
} from "@/data/retreats";

interface RetreatRegisterFormProps {
  retreat: RetreatConfig & { spotsLeft: number | null };
  /** Spam-guard token from the server render — echoed back on submit. */
  formToken: string | null;
}

type Phase = "idle" | "submitting" | "done";

interface DoneState {
  alreadyRegistered: boolean;
  emailed: boolean;
  paymentReported: boolean;
  amount: number;
  name: string;
}

const storageKey = (id: string) => `glnyc-retreat-${id}`;

const labelCls = "mb-1 block text-[11px] font-bold uppercase tracking-[0.14em]";
const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2";

export default function RetreatRegisterForm({ retreat, formToken }: RetreatRegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState<Occupation | "">("");
  const [organization, setOrganization] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentSent, setPaymentSent] = useState(false);
  // Honeypot — humans never see or fill this; bots stuff every field
  const [website, setWebsite] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState<DoneState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rememberedName, setRememberedName] = useState<string | null>(null);

  const closed = retreat.status !== "published";
  const full = retreat.spotsLeft === 0;
  const amount = occupation ? retreatPrice(retreat, occupation) : null;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(retreat.id));
      if (saved) setRememberedName(saved);
    } catch {
      /* private mode */
    }
  }, [retreat.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!occupation) {
      setError("Let us know if you're a student or working — it sets your contribution.");
      return;
    }
    setError(null);
    setPhase("submitting");
    try {
      const res = await fetch("/api/retreat/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: retreat.slug,
          name,
          email,
          phone,
          whatsapp,
          location,
          occupation,
          organization,
          notes,
          paymentSent,
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
        paymentReported: !!data.paymentReported,
        amount: typeof data.amount === "number" ? data.amount : retreatPrice(retreat, occupation),
        name,
      });
      setPhase("done");
      try {
        localStorage.setItem(storageKey(retreat.id), name);
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

  if (phase === "done" && done) {
    const first = done.name.split(" ")[0];
    return (
      <div className="text-center">
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl text-white"
          style={{ background: "var(--divine-gold)" }}
          aria-hidden
        >
          ✓
        </div>
        <h3 className="mt-4 font-serif text-2xl" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
          {done.alreadyRegistered ? `You're on the list, ${first}` : `See you at the farm, ${first}!`}
        </h3>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
          {done.emailed
            ? "Your confirmation, calendar invite, and QR entry pass are on their way from no-reply@gitalifenyc.com."
            : "You're registered — check your spam folder in a few minutes for the confirmation email."}
          {" "}We&rsquo;ll remind you the day before and on the morning of the retreat.
        </p>
        {done.paymentReported ? (
          <p
            className="mx-auto mt-5 max-w-md rounded-xl px-4 py-3 text-[13px] font-semibold"
            style={{ background: "rgba(0,109,91,0.08)", border: "1px solid rgba(0,109,91,0.3)", color: "var(--ink-primary)" }}
          >
            Thanks for sending your {formatUsd(done.amount)} Zelle payment — we&rsquo;ll match it up on our end.
          </p>
        ) : (
          <div className="mx-auto mt-5 max-w-md">
            <ZelleCard retreat={retreat} name={done.name} amount={done.amount} emphasis />
            <p className="mt-3 text-[12px] leading-relaxed" style={{ color: "var(--ink-tertiary)" }}>
              Sent it? Submit the form again with the same email and tick &ldquo;I&rsquo;ve sent my Zelle payment&rdquo; so we can mark you paid.
            </p>
            <button
              type="button"
              onClick={() => {
                setPhase("idle");
                setPaymentSent(true);
              }}
              className="mt-3 rounded-full px-5 py-2.5 text-[13px] font-semibold"
              style={{ color: "var(--ink-primary)", border: "1px solid rgba(21,34,79,0.18)" }}
            >
              I&rsquo;ve just sent it
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} aria-label={`Register for ${retreat.title}`}>
      {/* Honeypot — visually removed and skipped by keyboard/screen
          readers; only auto-form-fillers ever put a value here */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="retreat-website">Website</label>
        <input
          id="retreat-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {rememberedName && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-xs leading-relaxed"
          style={{ background: "rgba(201,162,72,0.1)", border: "1px solid rgba(201,162,72,0.4)", color: "var(--ink-secondary)" }}
        >
          You already registered from this device,{" "}
          <strong style={{ color: "var(--ink-primary)" }}>{rememberedName.split(" ")[0]}</strong>.
          Submitting again with the same email just updates your details (and lets you tell us you&rsquo;ve paid).
        </div>
      )}

      {retreat.spotsLeft != null && retreat.spotsLeft <= 10 && retreat.spotsLeft > 0 && (
        <p
          className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ background: "rgba(201,162,72,0.12)", color: "var(--divine-gold-deep)" }}
        >
          Only {retreat.spotsLeft} spot{retreat.spotsLeft === 1 ? "" : "s"} left
        </p>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="retreat-name" className={labelCls} style={{ color: "var(--ink-tertiary)" }}>
              Full name
            </label>
            <input
              id="retreat-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Arjuna Das"
              autoComplete="name"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="retreat-email" className={labelCls} style={{ color: "var(--ink-tertiary)" }}>
              Email
            </label>
            <input
              id="retreat-email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputCls}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="retreat-phone" className={labelCls} style={{ color: "var(--ink-tertiary)" }}>
              Mobile
            </label>
            <input
              id="retreat-phone"
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(201) 555-0134"
              autoComplete="tel"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="retreat-whatsapp" className={labelCls} style={{ color: "var(--ink-tertiary)" }}>
              WhatsApp <span className="font-normal normal-case tracking-normal">(if different)</span>
            </label>
            <input
              id="retreat-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Same as mobile? Leave blank"
              className={inputCls}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <p className={labelCls} style={{ color: "var(--ink-tertiary)" }}>
            You are
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Student or working">
            {OCCUPATIONS.map((o) => {
              const selected = occupation === o;
              return (
                <label
                  key={o}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all hover:-translate-y-px"
                  style={{
                    background: selected ? "rgba(201,162,72,0.14)" : "rgba(255,255,255,0.6)",
                    border: `1.5px solid ${selected ? "var(--divine-gold-deep)" : "rgba(21,34,79,0.14)"}`,
                  }}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="occupation"
                      value={o}
                      checked={selected}
                      onChange={() => {
                        setOccupation(o);
                        setError(null);
                      }}
                      className="h-4 w-4"
                      required
                    />
                    <span className="text-[13.5px] font-bold" style={{ color: "var(--ink-primary)" }}>
                      {o}
                    </span>
                  </span>
                  <span className="font-serif text-xl" style={{ color: "var(--divine-gold-deep)", fontWeight: 600 }}>
                    {formatUsd(retreat.pricing[o])}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="retreat-organization" className={labelCls} style={{ color: "var(--ink-tertiary)" }}>
              {occupation === "Student" ? "University" : occupation ? "Company" : "University / Company"}
            </label>
            <input
              id="retreat-organization"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder={occupation === "Student" ? "e.g. NYU, Rutgers, Columbia" : occupation ? "Where you work" : "University if student, company if working"}
              autoComplete="organization"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="retreat-location" className={labelCls} style={{ color: "var(--ink-tertiary)" }}>
              Location <span className="font-normal normal-case tracking-normal">(City, State)</span>
            </label>
            <input
              id="retreat-location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Brooklyn, NY"
              autoComplete="address-level2"
              className={inputCls}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label htmlFor="retreat-notes" className={labelCls} style={{ color: "var(--ink-tertiary)" }}>
            Anything we should know? <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="retreat-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            placeholder="Allergies or dietary needs, need a ride / can offer one, friends you're coming with"
            className={inputCls}
            style={inputStyle}
          />
        </div>

        {/* ----- Payment ----- */}
        <div className="pt-2">
          <p className={labelCls} style={{ color: "var(--ink-tertiary)" }}>
            Payment · Zelle
          </p>
          <ZelleCard retreat={retreat} name={name} amount={amount} />
          <label
            className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3"
            style={{
              background: paymentSent ? "rgba(0,109,91,0.08)" : "rgba(255,255,255,0.6)",
              border: `1.5px solid ${paymentSent ? "var(--peacock-green)" : "rgba(21,34,79,0.14)"}`,
            }}
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0"
              checked={paymentSent}
              onChange={(e) => setPaymentSent(e.target.checked)}
            />
            <span className="text-[13px] leading-snug" style={{ color: "var(--ink-primary)" }}>
              <strong>I&rsquo;ve sent my Zelle payment{amount ? ` of ${formatUsd(amount)}` : ""}.</strong>
              <span className="block text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
                Not yet? Leave this unticked — your confirmation email will carry the Zelle details, and you can
                come back and tick it once it&rsquo;s sent.
              </span>
            </span>
          </label>
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
        disabled={phase === "submitting" || closed || full}
        className="btn-primary-gradient mt-5 w-full rounded-full px-6 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
      >
        {closed
          ? "Registration has closed"
          : full
            ? "This retreat is full"
            : phase === "submitting"
              ? "Saving your spot…"
              : amount
                ? `Register — ${formatUsd(amount)} via Zelle`
                : "Register for the retreat"}
      </button>

      <p className="mt-3 text-center text-[11px] leading-relaxed" style={{ color: "var(--ink-tertiary)" }}>
        You&rsquo;ll get a confirmation email with the Zelle details, a calendar invite, and your QR entry pass —
        plus a reminder the day before and on the morning of the retreat.
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Zelle card — QR + number + memo (placeholders until configured)    */
/* ------------------------------------------------------------------ */

function ZelleCard({
  retreat,
  name,
  amount,
  emphasis = false,
}: {
  retreat: RetreatConfig;
  name: string;
  amount: number | null;
  emphasis?: boolean;
}) {
  const z = retreat.zelle;
  return (
    <div
      className="grid gap-4 rounded-2xl p-4 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center"
      style={{
        background: emphasis ? "rgba(217,105,26,0.08)" : "rgba(255,255,255,0.6)",
        border: `1.5px solid ${emphasis ? "rgba(217,105,26,0.45)" : "rgba(21,34,79,0.14)"}`,
      }}
    >
      {/* QR code slot */}
      <div
        className="mx-auto flex h-[132px] w-[132px] items-center justify-center overflow-hidden rounded-xl bg-white"
        style={{ border: z.qrUrl ? "1px solid rgba(21,34,79,0.14)" : "2px dashed rgba(21,34,79,0.3)" }}
      >
        {z.qrUrl ? (
          <Image src={z.qrUrl} alt="Zelle QR code" width={132} height={132} className="h-full w-full object-contain p-1.5" />
        ) : (
          <span className="px-3 text-center text-[10.5px] font-bold uppercase leading-snug tracking-[0.12em]" style={{ color: "var(--ink-tertiary)" }}>
            Zelle QR
            <span className="block font-normal normal-case tracking-normal">coming soon</span>
          </span>
        )}
      </div>

      <div className="text-center sm:text-left">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#B85308" }}>
          Send {amount ? formatUsd(amount) : "your contribution"} via Zelle to
        </p>
        <p className="mt-1 font-serif text-2xl tracking-wide" style={{ color: "var(--ink-primary)", fontWeight: 600 }}>
          {z.phone || "Zelle number coming soon"}
        </p>
        <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--ink-secondary)" }}>
          Recipient shows as <strong style={{ color: "var(--ink-primary)" }}>{z.recipientName}</strong>
        </p>
        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--ink-tertiary)" }}>
          Memo: <strong style={{ color: "var(--ink-primary)" }}>{zelleMemo(retreat, name)}</strong> — so we can match your payment to your registration.
        </p>
      </div>
    </div>
  );
}
