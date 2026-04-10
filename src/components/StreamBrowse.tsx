"use client";

/**
 * StreamBrowse — Netflix/Paramount+ inspired programs browser
 *
 * Dark cinematic theme with:
 *  - Auto-rotating hero banner for featured programs
 *  - Horizontal category rows with poster cards
 *  - Cinematic detail modal with trailer-style media
 *  - RSVP integration via existing RsvpModal
 */

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import type { Program } from "@/data/programs";
import { CATEGORY_COLORS, getCategoryColor, getCategoryIcon } from "@/data/programs";
import StreamHero from "./StreamHero";
import StreamRow from "./StreamRow";
import StreamDetailModal from "./StreamDetailModal";
import RsvpModal from "./RsvpModal";
import MobileBottomNav from "./MobileBottomNav";

interface StreamBrowseProps {
  programs: Program[];
}

export default function StreamBrowse({ programs }: StreamBrowseProps) {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [rsvpProgram, setRsvpProgram] = useState<Program | null>(null);

  // Featured programs for the hero banner (max 5)
  const heroPrograms = useMemo(() => {
    const featured = programs.filter((p) => p.featured);
    if (featured.length > 0) return featured.slice(0, 5);
    return programs.slice(0, 5);
  }, [programs]);

  // Group programs by category
  const categoryRows = useMemo(() => {
    const categories = Object.keys(CATEGORY_COLORS);
    const rows: { title: string; programs: Program[]; icon: string; color: string }[] = [];

    // "Happening Soon" — programs within the next 7 days
    const soon = programs.filter((p) => {
      const diff = new Date(p.date).getTime() - Date.now();
      return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
    });
    if (soon.length > 0) {
      rows.push({
        title: "Happening Soon",
        programs: soon,
        icon: "\u{1F525}", // 🔥
        color: "#E8751A",
      });
    }

    // Category rows
    for (const cat of categories) {
      const catPrograms = programs.filter((p) => p.category === cat);
      if (catPrograms.length > 0) {
        const { bg } = getCategoryColor(cat);
        rows.push({
          title: cat,
          programs: catPrograms,
          icon: getCategoryIcon(cat),
          color: bg,
        });
      }
    }

    // Volunteer opportunities
    const volunteer = programs.filter((p) => p.type === "volunteer");
    if (volunteer.length > 0) {
      rows.push({
        title: "Volunteer Opportunities",
        programs: volunteer,
        icon: "\u{1F49A}", // 💚
        color: "#2D8F4E",
      });
    }

    // "All Programs" at the bottom
    if (programs.length > 0) {
      rows.push({
        title: "All Programs",
        programs,
        icon: "\u{2728}", // ✨
        color: "#D4A843",
      });
    }

    return rows;
  }, [programs]);

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "linear-gradient(180deg, #0a0a1a 0%, #0F1B4D10 50%, #0a0a1a 100%)",
        backgroundColor: "#0a0a1a",
      }}
    >
      {/* Hero banner */}
      <StreamHero
        programs={heroPrograms}
        onSelectProgram={setSelectedProgram}
        onRsvp={setRsvpProgram}
      />

      {/* Category rows */}
      <div className="relative z-10 -mt-8 pb-24">
        {categoryRows.map((row) => (
          <StreamRow
            key={row.title}
            title={row.title}
            programs={row.programs}
            onSelectProgram={setSelectedProgram}
            icon={row.icon}
            accentColor={row.color}
          />
        ))}

        {/* Empty state */}
        {programs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center px-6">
            <span className="text-6xl mb-4 opacity-30">&#x1F3B5;</span>
            <h3 className="text-xl font-bold text-white/50 mb-2">No programs yet</h3>
            <p className="text-sm text-white/30 max-w-md">
              Check back soon — we&rsquo;re always adding new kirtans, retreats, and wisdom sessions.
            </p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedProgram && (
          <StreamDetailModal
            program={selectedProgram}
            onClose={() => setSelectedProgram(null)}
          />
        )}
      </AnimatePresence>

      {/* RSVP modal (triggered from hero CTA) */}
      {rsvpProgram && (
        <RsvpModal
          program={rsvpProgram}
          onClose={() => setRsvpProgram(null)}
        />
      )}

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
