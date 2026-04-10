"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { Program } from "@/data/programs";
import StreamPosterCard from "./StreamPosterCard";

interface StreamRowProps {
  title: string;
  programs: Program[];
  onSelectProgram: (program: Program) => void;
  icon?: string;
  accentColor?: string;
}

export default function StreamRow({
  title,
  programs,
  onSelectProgram,
  icon,
  accentColor = "#D4A843",
}: StreamRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -420 : 420;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (programs.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative py-4"
    >
      {/* Row title */}
      <div className="flex items-center gap-3 px-6 md:px-12 mb-4">
        {icon && <span className="text-xl">{icon}</span>}
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <div
          className="flex-1 h-px max-w-[120px] opacity-30"
          style={{
            background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          }}
        />
        <span className="text-[11px] text-white/30 font-medium">
          {programs.length} program{programs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Scrollable row */}
      <div className="relative group/row">
        {/* Left scroll arrow */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-12 items-center justify-center bg-gradient-to-r from-[#0a0a1a] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 cursor-pointer"
          aria-label="Scroll left"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/70 hover:text-white transition-colors">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Cards container */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto px-6 md:px-12 pb-4 scrollbar-hide scroll-smooth snap-x"
        >
          {programs.map((program, i) => (
            <StreamPosterCard
              key={program.id}
              program={program}
              index={i}
              onClick={() => onSelectProgram(program)}
            />
          ))}
        </div>

        {/* Right scroll arrow */}
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-12 items-center justify-center bg-gradient-to-l from-[#0a0a1a] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 cursor-pointer"
          aria-label="Scroll right"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/70 hover:text-white transition-colors">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </motion.section>
  );
}
