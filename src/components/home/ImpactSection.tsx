/**
 * ImpactSection — Big-number stats. Static, mobile-first.
 */

import Link from "next/link";
import { IMPACT_STATS } from "@/data/home";
import { C, Icon } from "./icons";

export default function ImpactSection() {
  return (
    <section
      id="impact"
      className="relative py-14 px-5 sm:py-20 sm:px-8"
      style={{ background: C.krishnaDeep }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: C.goldLight }}
          >
            <Icon name="trophy" size={14} />
            Our Impact
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
            What the last year has looked like
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm text-white/60">
            Real numbers from our community &mdash; books shared, meals served, classes held,
            retreats offered
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {IMPACT_STATS.map((stat, i) => (
            <div key={i}>
              <p
                className="text-[2rem] sm:text-5xl font-bold leading-tight tracking-tight break-words"
                style={{ color: C.goldLight }}
              >
                {stat.number}
              </p>
              <p
                className="mt-2 text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: C.gold }}
              >
                {stat.label}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/impact"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
            style={{
              border: `1px solid ${C.gold}50`,
              color: C.goldLight,
            }}
          >
            See the full impact story
            <Icon name="arrowRight" size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
