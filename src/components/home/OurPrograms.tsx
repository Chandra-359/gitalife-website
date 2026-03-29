"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const PROGRAM_CATEGORIES = [
  {
    title: "University Programs",
    description:
      "Weekly Bhagavad Gita study groups at NYU, Columbia, Rutgers, and more. Perfect for students looking for deeper meaning beyond textbooks.",
    tags: ["Various days", "Campus locations"],
    gradient: "from-[#E8751A]/20 to-[#D4A843]/20",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="5" y="18" width="30" height="18" rx="2" stroke="#E8751A" strokeWidth="1.5" fill="none" />
        <path d="M20 4L4 18h32L20 4Z" stroke="#E8751A" strokeWidth="1.5" fill="none" />
        <rect x="16" y="26" width="8" height="10" rx="1" stroke="#E8751A" strokeWidth="1.2" fill="#E8751A" opacity="0.2" />
        <line x1="10" y1="24" x2="10" y2="30" stroke="#E8751A" strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="24" x2="30" y2="30" stroke="#E8751A" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
  },
  {
    title: "Monday Youth Forum",
    description:
      "Our flagship weekly gathering for young professionals. Dive into Gita philosophy, enjoy kirtan, and connect with like-minded seekers — every Monday evening.",
    tags: ["Mondays", "7:00 PM"],
    gradient: "from-[#1A5C5E]/20 to-[#D4A843]/20",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="14" r="6" stroke="#1A5C5E" strokeWidth="1.5" fill="none" />
        <path d="M8 34c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="#1A5C5E" strokeWidth="1.5" fill="none" />
        <circle cx="31" cy="12" r="4" stroke="#1A5C5E" strokeWidth="1" opacity="0.5" fill="none" />
        <circle cx="9" cy="12" r="4" stroke="#1A5C5E" strokeWidth="1" opacity="0.5" fill="none" />
      </svg>
    ),
  },
  {
    title: "Retreats",
    description:
      "Step away from the city noise. Our weekend retreats combine meditation, philosophy workshops, nature walks, and soul-nourishing prasadam.",
    tags: ["Monthly", "Seasonal"],
    gradient: "from-[#D4A843]/20 to-[#1A5C5E]/20",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M4 36L16 12l8 14 8-8 4 18H4Z" stroke="#D4A843" strokeWidth="1.5" fill="none" />
        <circle cx="30" cy="10" r="4" stroke="#D4A843" strokeWidth="1.2" fill="#D4A843" opacity="0.2" />
        <path d="M12 24l4-6 3 4" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
  },
  {
    title: "Girls' Preaching",
    description:
      "A dedicated space for women to explore spirituality, share experiences, and grow together in a supportive, understanding environment.",
    tags: ["Weekly"],
    gradient: "from-[#E8751A]/15 to-pink-200/30",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M20 8c-3 4-8 9-8 14a8 8 0 0 0 16 0c0-5-5-10-8-14Z" fill="#E8751A" opacity="0.2" stroke="#E8751A" strokeWidth="1.5" />
        <path d="M20 14c-1.5 2.5-4 5.5-4 8a4 4 0 0 0 8 0c0-2.5-2.5-5.5-4-8Z" fill="#D4A843" opacity="0.3" />
        <circle cx="20" cy="22" r="1.5" fill="#E8751A" opacity="0.6" />
      </svg>
    ),
  },
  {
    title: "Festival Celebrations",
    description:
      "Experience the joy of Janmashtami, Gaura Purnima, Ratha Yatra, and other vibrant Vedic festivals with hundreds of enthusiastic participants.",
    tags: ["Throughout the year"],
    gradient: "from-[#D4A843]/20 to-[#E8751A]/15",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="14" stroke="#D4A843" strokeWidth="1.5" fill="none" />
        <path d="M20 8v4M20 28v4M8 20h4M28 20h4" stroke="#D4A843" strokeWidth="1.2" />
        <path d="M12 12l2.8 2.8M25.2 25.2L28 28M12 28l2.8-2.8M25.2 14.8L28 12" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
        <circle cx="20" cy="20" r="5" fill="#D4A843" opacity="0.2" stroke="#D4A843" strokeWidth="1" />
      </svg>
    ),
  },
  {
    title: "Home Programs",
    description:
      "Intimate gatherings in devotee homes across NYC. Home-cooked prasadam, small group discussions, and lasting friendships.",
    tags: ["Various locations"],
    gradient: "from-[#1A5C5E]/15 to-[#E8751A]/10",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M6 20L20 8l14 12" stroke="#1A5C5E" strokeWidth="1.5" fill="none" />
        <rect x="10" y="20" width="20" height="14" rx="1" stroke="#1A5C5E" strokeWidth="1.5" fill="none" />
        <rect x="16" y="26" width="8" height="8" rx="1" stroke="#1A5C5E" strokeWidth="1.2" fill="#1A5C5E" opacity="0.15" />
        <path d="M20 12v-4h4v7" stroke="#1A5C5E" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
  },
];

export default function OurPrograms() {
  return (
    <section id="programs" className="bg-[#FFF9F0] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
            Our Programs
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#E8751A] to-[#D4A843]" />
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            From campus study groups to weekend retreats, find the program that
            speaks to you.
          </p>
        </motion.div>

        {/* Program cards grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROGRAM_CATEGORIES.map((program, i) => (
            <motion.div
              key={program.title}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm transition-all hover:shadow-lg"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              whileHover={{ y: -4 }}
            >
              {/* Gradient header */}
              <div
                className={`flex h-32 items-center justify-center bg-gradient-to-br ${program.gradient}`}
              >
                <div className="rounded-2xl bg-white/60 p-4 backdrop-blur-sm">
                  {program.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-gray-900">
                  {program.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {program.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {program.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#FFF3E0] px-3 py-1 text-xs font-medium text-[#E8751A]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Learn More link */}
                <Link
                  href="/programs"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1A5C5E] transition-colors hover:text-[#E8751A]"
                >
                  Learn More
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#E8751A] px-8 py-3 text-base font-semibold text-[#E8751A] transition-all hover:bg-[#E8751A] hover:text-white"
          >
            View Upcoming Events
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10h12M12 6l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
