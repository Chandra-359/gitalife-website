"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8751A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Weekly Programs",
    text: "Discussions, kirtans, and community every week",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8751A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "All Are Welcome",
    text: "No experience needed — just genuine curiosity",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8751A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Across NYC",
    text: "Universities, homes, parks, and community centers",
  },
];

export default function WhatIsGitaLife() {
  return (
    <section id="about" className="bg-[#FFF9F0] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-20">
          {/* ---- Text column ---- */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
              What is{" "}
              <span className="bg-gradient-to-r from-[#E8751A] to-[#D4A843] bg-clip-text text-transparent">
                Gita Life
              </span>
              ?
            </h2>

            <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-[#E8751A] to-[#D4A843]" />

            <p className="mt-8 text-lg leading-relaxed text-gray-600">
              Gita Life NYC is a community of young seekers exploring the
              Bhagavad Gita&apos;s timeless wisdom &mdash; through weekly discussions,
              kirtans, retreats, and deep friendships.
            </p>

            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Founded under the guidance of ISKCON, we host programs across
              New York City &mdash; at universities, community centers, temples,
              and homes.
            </p>

            <p className="mt-4 text-lg font-medium leading-relaxed text-gray-700">
              No prior experience needed. No pressure. Just genuine
              conversations about life&apos;s biggest questions.
            </p>
          </motion.div>

          {/* ---- Feature cards column ---- */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="flex items-start gap-5 rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: "easeOut" }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8751A]/10">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    {feature.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
