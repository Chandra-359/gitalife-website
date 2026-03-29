"use client";

import { motion } from "framer-motion";

export default function WhatIsGitaLife() {
  return (
    <section id="about" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* ---- Text column ---- */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
              What is <span className="text-[#E8751A]">Gita Life</span>?
            </h2>

            <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#E8751A] to-[#D4A843]" />

            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Gita Life NYC is a community of young seekers exploring the
              Bhagavad Gita&apos;s timeless wisdom &mdash; through weekly discussions,
              kirtans, retreats, and deep friendships.
            </p>

            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Founded under the guidance of ISKCON, we host programs across
              New York City &mdash; at universities, community centers, temples,
              and homes.
            </p>

            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              No prior experience needed. No pressure. Just genuine
              conversations about life&apos;s biggest questions.
            </p>
          </motion.div>

          {/* ---- Illustration placeholder ---- */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            <div className="relative flex h-80 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8751A]/10 via-[#D4A843]/10 to-[#1A5C5E]/10">
              {/* Decorative lotus */}
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                fill="none"
                className="opacity-30"
              >
                <circle cx="80" cy="80" r="70" stroke="#E8751A" strokeWidth="1" />
                <circle cx="80" cy="80" r="55" stroke="#D4A843" strokeWidth="0.5" />
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const cx = 80 + Math.cos(angle) * 35;
                  const cy = 80 + Math.sin(angle) * 35;
                  return (
                    <ellipse
                      key={i}
                      cx={cx}
                      cy={cy}
                      rx="16"
                      ry="7"
                      fill="#E8751A"
                      opacity="0.15"
                      transform={`rotate(${i * 30}, ${cx}, ${cy})`}
                    />
                  );
                })}
                <path
                  d="M80 35c-5 10-15 22-15 32a15 15 0 0 0 30 0c0-10-10-22-15-32Z"
                  fill="#E8751A"
                  opacity="0.25"
                />
              </svg>

              {/* Placeholder text */}
              <p className="absolute bottom-4 text-sm text-gray-400">
                Photo coming soon
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
