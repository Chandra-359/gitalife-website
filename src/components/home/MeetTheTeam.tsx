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
    gradient: "from-[#1A5C5E] to-[#2d8f91]",
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
    gradient: "from-[#0f3460] to-[#1A5C5E]",
  },
];

export default function MeetTheTeam() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            Meet the Team
          </h2>
          <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-[#E8751A] to-[#D4A843]" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Guided by dedicated mentors under ISKCON and the teachings of
            His Divine Grace A.C. Bhaktivedanta Swami Prabhupada, our team
            brings ancient wisdom to modern life.
          </p>
        </motion.div>

        {/* Team grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-gray-100 bg-[#FFF9F0] p-8 text-center transition-all hover:border-[#E8751A]/20 hover:shadow-lg"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            >
              {/* Avatar */}
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient} shadow-lg ring-4 ring-white`}
              >
                <span className="text-3xl font-bold text-white">
                  {member.initial}
                </span>
              </div>

              <h3 className="mt-5 font-serif text-base font-bold text-gray-900 sm:text-lg">
                {member.name}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#E8751A]">
                {member.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
