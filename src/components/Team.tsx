"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const team = [
  {
    name: "Team Member 1",
    role: "Program Director",
    gradient: "from-saffron/30 via-ember/20 to-void-surface",
  },
  {
    name: "Team Member 2",
    role: "University Outreach Lead",
    gradient: "from-indigo/30 via-violet-900/20 to-void-surface",
  },
  {
    name: "Team Member 3",
    role: "Girls' Preaching Coordinator",
    gradient: "from-lotus/30 via-rose-900/20 to-void-surface",
  },
  {
    name: "Team Member 4",
    role: "Retreat Organizer",
    gradient: "from-sage/30 via-emerald-900/20 to-void-surface",
  },
  {
    name: "Team Member 5",
    role: "MYF Host",
    gradient: "from-amethyst/30 via-purple-900/20 to-void-surface",
  },
  {
    name: "Team Member 6",
    role: "Volunteer Coordinator",
    gradient: "from-gold/30 via-amber-900/20 to-void-surface",
  },
];

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-text",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none none",
          },
        }
      );

      const photos = sectionRef.current?.querySelectorAll(".team-photo");
      photos?.forEach((photo, i) => {
        gsap.fromTo(
          photo,
          {
            clipPath: "circle(0% at 50% 50%)",
            scale: 0.8,
          },
          {
            clipPath: "circle(50% at 50% 50%)",
            scale: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: photo,
              start: "top 75%",
              toggleActions: "play none none none",
            },
            delay: i * 0.1,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="section-midnight relative px-6 py-32"
    >
      {/* Atmospheric orb */}
      <div
        className="pointer-events-none absolute top-0 right-1/4 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* About text */}
        <div className="about-text mx-auto max-w-3xl text-center">
          <p className="label-saffron">About Us</p>
          <h2 className="mt-4 text-4xl text-offwhite sm:text-5xl lg:text-6xl">
            The People Behind
            <span className="text-gradient-saffron"> Gita Life</span>
          </h2>
          <p className="mt-6 font-sans text-lg leading-relaxed text-offwhite/35">
            Guided by the teachings of His Divine Grace A.C. Bhaktivedanta Swami
            Prabhupada and the ISKCON tradition, our team of dedicated mentors
            and volunteers brings ancient wisdom to modern life in New York City.
          </p>
        </div>

        {/* Team grid */}
        <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {team.map((member) => (
            <div key={member.name} className="group text-center">
              <div
                className={`team-photo mx-auto aspect-square w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br ${member.gradient} transition-all duration-500 group-hover:border-white/10`}
              >
                <div className="flex h-full items-center justify-center">
                  <svg
                    className="h-12 w-12 text-white/15"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 font-sans text-sm font-medium text-offwhite transition-colors group-hover:text-saffron">
                {member.name}
              </h3>
              <p className="mt-1 font-sans text-xs text-offwhite/25">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
