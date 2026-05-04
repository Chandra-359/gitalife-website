/**
 * ExploreGrid — Simple icon category grid.
 * 8 tiles linking to sub-pages.
 */

import Link from "next/link";
import { EXPLORE_CATEGORIES } from "@/data/home";
import { C, Icon, colorFor } from "./icons";

export default function ExploreGrid() {
  return (
    <section id="explore" className="surface-paper-light relative py-14 px-5 sm:py-20 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: C.gold }}
          >
            <Icon name="lotus" size={14} />
            Explore
          </span>
          <h2
            className="section-heading mt-2 text-3xl sm:text-4xl"
            style={{ color: C.krishnaBlue }}
          >
            How to get involved
          </h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-gray-500">
            Daily practice, weekly classes, seva opportunities, and more
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {EXPLORE_CATEGORIES.map((cat) => {
            const color = colorFor(cat.color);
            return (
              <Link
                key={cat.slug}
                href={cat.href}
                className="glass-card hover-lift group flex h-full flex-col items-start gap-3 rounded-xl p-4 sm:p-5"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-white"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                    boxShadow: `0 4px 12px -4px ${color}80`,
                  }}
                >
                  <Icon name={cat.icon} size={20} />
                </div>

                <div>
                  <h3
                    className="text-[15px] font-semibold"
                    style={{ color: C.krishnaBlue }}
                  >
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {cat.blurb}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
