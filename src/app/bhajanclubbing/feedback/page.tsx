import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import FeedbackForm from "@/components/bhajanclubbing/FeedbackForm";
import { EVENT } from "@/data/bhajanClubbing";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: `Feedback — ${EVENT.title} ${EVENT.volume} | Gita Life NYC`,
  description: "Tell us how Bhajan Clubbing Vol. 01 was for you — your feedback shapes Vol. 02.",
  robots: { index: false }, // reached via the thank-you email, not search
};

export default function Page() {
  return (
    <div
      className={`${playfair.variable} min-h-screen`}
      style={{ background: "linear-gradient(180deg, var(--bc2-bg) 0%, var(--bc2-bg-2) 100%)" }}
    >
      <Navbar />
      <main className="relative mx-auto max-w-2xl px-6 pb-24 pt-32">
        {/* soft aurora behind the card */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <span
            className="bc2-aurora left-[-20%] top-[5%] h-[480px] w-[480px]"
            style={{ background: "var(--bc2-purple)", "--o": 0.18, "--t": "26s" } as React.CSSProperties}
          />
          <span
            className="bc2-aurora right-[-22%] top-[40%] h-[520px] w-[520px]"
            style={{ background: "var(--bc2-saffron)", "--o": 0.12, "--t": "30s", "--d": "-11s" } as React.CSSProperties}
          />
        </div>

        <div className="relative text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
            {EVENT.title} · {EVENT.volume}
          </p>
          <h1 className="bc2-display mt-4 text-[32px] text-club-ink sm:text-[40px]">
            How was <span className="bc2-headline-grad">your night?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[14px]" style={{ color: "var(--bc2-ink-dim)" }}>
            Your thoughts help us make our events even better! It takes about two minutes — we read
            every single response.
          </p>
        </div>

        <div className="bc2-glass relative mt-10 p-6 sm:p-9">
          <FeedbackForm />
        </div>

        <p className="relative mt-8 text-center text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--bc2-ink-faint)" }}>
          Gita Life NYC · A community initiative under ISKCON
        </p>
      </main>
    </div>
  );
}
