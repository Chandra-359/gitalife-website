/**
 * ConnectFooter — testimonials + newsletter/social + footer.
 * Simple, mobile-first.
 */

import Link from "next/link";
import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";
import { INSTAGRAM_URL, YOUTUBE_URL } from "@/data/home";
import { C } from "./icons";

interface ConnectFooterProps {
  testimonials: Program[];
}

export default function ConnectFooter({ testimonials }: ConnectFooterProps) {
  return (
    <>
      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="surface-paper-light relative py-16 px-5 sm:py-24 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: C.gold }}
              >
                Testimonials
              </span>
              <h2
                className="section-heading mt-2 text-3xl sm:text-4xl"
                style={{ color: C.krishnaBlue }}
              >
                What people are saying
              </h2>
            </div>

            <div
              className="snap-rail snap-rail-bleed md:m-0 md:grid md:snap-none md:grid-cols-3 md:gap-5 md:overflow-visible md:p-0"
              role="list"
              aria-label="Testimonials"
            >
              {testimonials.map((prog) => {
                const { bg } = getCategoryColor(prog.category);
                return (
                  <div
                    key={prog.id}
                    role="listitem"
                    className="glass-card hover-lift w-[85%] max-w-[340px] shrink-0 rounded-2xl p-6 md:w-auto md:max-w-none md:shrink"
                  >
                    <p className="text-[15px] leading-relaxed text-gray-700 mb-5">
                      &ldquo;{prog.testimonial}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: bg }}
                      >
                        {prog.testimonialAuthor?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: C.krishnaBlue }}
                        >
                          {prog.testimonialAuthor}
                        </p>
                        <p className="text-[11px] text-gray-500">{prog.category}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Get Connected + footer */}
      <section
        id="get-connected"
        className="surface-sacred relative overflow-hidden py-16 px-5 sm:py-24 sm:px-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 0%, rgba(237,214,152,0.16), transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: C.goldLight }}
          >
            Join Us
          </span>
          <h2 className="section-heading mt-2 text-3xl text-white sm:text-4xl">
            Stay connected
          </h2>
          <p className="mt-3 max-w-md mx-auto text-sm text-white/60">
            Get updates on upcoming classes, festivals, and retreats
          </p>

          <form
            className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[var(--accent-saffron)]/40"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,251,242,0.15)",
              }}
            />
            <button
              type="submit"
              className="btn-primary-gradient rounded-lg px-6 py-3 text-sm font-semibold text-white shrink-0"
            >
              Subscribe
            </button>
          </form>

          {/* Social */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              style={{ border: "1px solid rgba(255,251,242,0.15)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"
                  fill="currentColor"
                />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0F1B4D" />
              </svg>
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              style={{ border: "1px solid rgba(255,251,242,0.15)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>

          {/* Footer bar */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0"
                />
                <span className="text-sm font-semibold text-white/80">Gita Life NYC</span>
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
                <Link href="/" className="text-white/50 transition-colors hover:text-white">Home</Link>
                <Link href="/programs" className="text-white/50 transition-colors hover:text-white">Programs</Link>
                <Link href="/festival" className="text-white/50 transition-colors hover:text-white">Festival</Link>
                <Link href="/daily" className="text-white/50 transition-colors hover:text-white">Daily</Link>
                <Link href="/impact" className="text-white/50 transition-colors hover:text-white">Impact</Link>
              </div>
              <p className="text-[11px] text-white/40">
                Hare Krishna &mdash; ISKCON Brooklyn
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
