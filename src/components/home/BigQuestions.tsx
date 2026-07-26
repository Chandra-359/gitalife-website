/**
 * BigQuestions — "Questions we explore" section for first-time visitors.
 * Leads with the universal questions a curious visitor is already asking,
 * anchors each in the Gita / Bhagavatam, and funnels to class registration.
 */

import Link from "next/link";
import { BIG_QUESTIONS } from "@/data/home";
import { C, Icon, colorFor } from "./icons";

export default function BigQuestions() {
  return (
    <section id="questions" className="surface-paper-light relative py-14 px-5 sm:py-20 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: C.gold }}
          >
            <Icon name="sparkle" size={14} />
            The Big Questions
          </span>
          <h2
            className="section-heading mt-2 text-3xl sm:text-4xl"
            style={{ color: C.krishnaBlue }}
          >
            Questions we explore every week
          </h2>
          <p className="mt-2 max-w-lg mx-auto text-sm text-gray-500">
            The Bhagavad Gita is a conversation — a person in crisis asking a
            friend what life is for. Our classes pick that conversation up where
            it left off.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {BIG_QUESTIONS.map((q) => {
            const color = colorFor(q.color);
            return (
              <div
                key={q.question}
                className="glass-card hover-lift flex h-full flex-col rounded-2xl p-5 sm:p-6"
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                    boxShadow: `0 4px 12px -4px ${color}80`,
                  }}
                >
                  <Icon name={q.icon} size={20} />
                </div>
                <h3
                  className="text-[17px] font-semibold leading-snug"
                  style={{ color: C.krishnaBlue }}
                >
                  {q.question}
                </h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-gray-600">
                  {q.blurb}
                </p>
                <span
                  className="mt-4 inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ background: `${color}18`, color }}
                >
                  {q.source}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Bring one of these to a class. Free, weekly, in person — nothing to
            believe first, everything to ask.
          </p>
          <Link
            href="/programs"
            className="btn-primary-gradient mt-4 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white"
          >
            Register for a class
            <Icon name="arrowRight" size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
