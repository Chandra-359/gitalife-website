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
            The questions you already ask at 2 a.m.
          </h2>
          <p className="mt-2 max-w-lg mx-auto text-sm text-gray-500">
            They&rsquo;ve been examined with total seriousness for five thousand
            years — in the Bhagavad Gita and Śrīmad Bhāgavatam. Every card links
            to the exact verse, so you can check us.
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
                <a
                  href={q.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-opacity hover:opacity-75"
                  style={{ background: `${color}18`, color }}
                >
                  {q.source}
                  <Icon name="arrowRight" size={10} />
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Pick the one that stung and bring it to a class. Free, weekly, in
            person across NYC &amp; Jersey City — nothing to believe first,
            everything to ask.
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
