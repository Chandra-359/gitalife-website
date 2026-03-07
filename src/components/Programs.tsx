"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const programs = [
  {
    title: "University Programs",
    description:
      "Weekly Bhagavad Gita study groups at NYU, Columbia, Rutgers, and more. Perfect for students seeking deeper meaning.",
    tag: "Various Campuses",
    gradient: "from-orange-900/80 to-black/80",
    image: "/programs/university.jpg",
  },
  {
    title: "Monday Youth Forum",
    description:
      "Our flagship weekly gathering. Dive into Gita philosophy, enjoy kirtan, and connect with like-minded seekers every Monday evening.",
    tag: "Mondays · 7 PM",
    gradient: "from-teal-900/80 to-black/80",
    image: "/programs/myf.jpg",
  },
  {
    title: "Retreats",
    description:
      "Step away from the city noise. Weekend retreats with meditation, philosophy workshops, nature walks, and soul-nourishing prasadam.",
    tag: "Monthly / Seasonal",
    gradient: "from-amber-900/80 to-black/80",
    image: "/programs/retreats.jpg",
  },
  {
    title: "Girls' Preaching",
    description:
      "A dedicated space for women to explore spirituality, share experiences, and grow together in a supportive environment.",
    tag: "Weekly",
    gradient: "from-rose-900/80 to-black/80",
    image: "/programs/girls.jpg",
  },
  {
    title: "Festival Celebrations",
    description:
      "Experience the joy of Janmashtami, Gaura Purnima, Ratha Yatra, and other vibrant Vedic festivals with hundreds of participants.",
    tag: "Throughout the Year",
    gradient: "from-purple-900/80 to-black/80",
    image: "/programs/festivals.jpg",
  },
  {
    title: "Home Programs",
    description:
      "Intimate gatherings in devotee homes across NYC. Home-cooked prasadam, small group discussions, and lasting friendships.",
    tag: "Various Locations",
    gradient: "from-emerald-900/80 to-black/80",
    image: "/programs/home.jpg",
  },
];

export default function Programs() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!trackRef.current || !sectionRef.current) return;

      // Only apply horizontal scroll on desktop
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const track = trackRef.current!;
        const cards = track.querySelectorAll(".program-card");
        const totalScroll = track.scrollWidth - window.innerWidth;

        // Pin section and scroll horizontally
        gsap.to(track, {
          x: -totalScroll,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${totalScroll}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Individual card animations
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0.5, scale: 0.92 },
            {
              opacity: 1,
              scale: 1,
              scrollTrigger: {
                trigger: card,
                containerAnimation: gsap.getById("horizontalScroll") || undefined,
                start: "left 80%",
                end: "left 20%",
                scrub: true,
              },
            }
          );
        });
      });

      // Mobile: simple stagger fade in
      mm.add("(max-width: 767px)", () => {
        const cards = trackRef.current!.querySelectorAll(".program-card");
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="programs" className="relative bg-void">
      {/* Section header */}
      <div className="px-6 pt-24 pb-12 md:pb-0">
        <div className="mx-auto max-w-7xl">
          <p className="label-saffron">
            Our Programs
          </p>
          <h2 className="mt-3 text-4xl text-offwhite sm:text-5xl lg:text-6xl">
            Find Your Path
          </h2>
        </div>
      </div>

      {/* Horizontal scroll track (desktop) / Vertical stack (mobile) */}
      <div className="overflow-hidden md:h-screen md:flex md:items-center">
        <div
          ref={trackRef}
          className="flex flex-col gap-6 px-6 pb-24 md:flex-row md:gap-8 md:px-12 md:pb-0"
          style={{ willChange: "transform" }}
        >
          {programs.map((program, i) => (
            <div
              key={program.title}
              className="program-card group relative flex-shrink-0 overflow-hidden rounded-2xl md:h-[70vh] md:w-[55vw]"
            >
              {/* Placeholder background — replace with actual images */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${program.gradient}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Content */}
              <div className="relative flex h-full min-h-[350px] flex-col justify-end p-8 sm:p-10 md:min-h-0">
                <span className="label mb-3 inline-block w-fit rounded-full border border-white/10 px-3 py-1">
                  {program.tag}
                </span>
                <h3 className="font-serif text-3xl font-bold text-offwhite sm:text-4xl">
                  {program.title}
                </h3>
                <p className="mt-3 max-w-md font-sans text-base leading-relaxed text-offwhite/50">
                  {program.description}
                </p>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-saffron/0 transition-colors duration-500 group-hover:bg-saffron/10" />
            </div>
          ))}

          {/* CTA card at the end */}
          <div className="program-card flex flex-shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-void-surface p-12 md:h-[70vh] md:w-[40vw]">
            <div className="text-center">
              <h3 className="font-serif text-3xl font-bold text-offwhite sm:text-4xl">
                Ready to join?
              </h3>
              <p className="mt-4 font-sans text-lg text-offwhite/40">
                Tell us about yourself and we&apos;ll find the perfect program
                for you.
              </p>
              <Link
                href="/get-connected"
                className="mt-8 inline-block rounded-full bg-saffron px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-saffron-light"
              >
                Get Connected
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
