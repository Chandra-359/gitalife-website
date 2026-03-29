"use client";

import { motion } from "framer-motion";

const TEAM_MEMBERS = [
  {
    name: "Radha Govind Das",
    role: "Program Director",
    initial: "R",
    bio: "Guiding young seekers through Gita wisdom for 10+ years",
    gradient: "from-[#E8751A] to-[#D4A843]",
  },
  {
    name: "Nitai Prema Das",
    role: "University Outreach Lead",
    initial: "N",
    bio: "Former Wall Street analyst turned spiritual educator",
    gradient: "from-[#1A5C5E] to-[#D4A843]",
  },
  {
    name: "Vrindavan Das",
    role: "Retreat Coordinator",
    initial: "V",
    bio: "Leading transformative retreat experiences for young adults",
    gradient: "from-[#D4A843] to-[#E8751A]",
  },
  {
    name: "Gaura Vani",
    role: "Kirtan Director",
    initial: "G",
    bio: "International kirtan artist passionate about youth engagement",
    gradient: "from-[#1A5C5E] to-[#E8751A]",
  },
];

export default function MeetTheTeam() {
  return (
    <section className="bg-[#FFF9F0] py-20 sm:py-28">
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
            Meet the Team
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#E8751A] to-[#D4A843]" />
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Gita Life NYC is guided by dedicated mentors and volunteers who
            have committed their lives to sharing the Bhagavad Gita&apos;s wisdom.
            Under the spiritual guidance of ISKCON and the teachings of His
            Divine Grace A.C. Bhaktivedanta Swami Prabhupada, our team brings
            ancient wisdom to modern life.
          </p>
        </motion.div>

        {/* Team grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              className="flex flex-col items-center rounded-2xl border border-gray-200/60 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            >
              {/* Avatar */}
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient} shadow-lg`}
              >
                <span className="text-2xl font-bold text-white">
                  {member.initial}
                </span>
              </div>

              <h3 className="mt-4 font-serif text-base font-bold text-gray-900 sm:text-lg">
                {member.name}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#E8751A]">
                {member.role}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
