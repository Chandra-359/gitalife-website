/**
 * programs.ts — Shared types and UI constants for programs
 *
 * The actual program data now lives in PostgreSQL and is fetched via Prisma.
 * This file contains only:
 *  - The Program interface (used by all components)
 *  - CATEGORY_COLORS (used by markers and the detail panel)
 *
 * HOW TO ADD NEW CATEGORIES:
 * 1. Add the new category string to the Program["category"] union type.
 * 2. Add a color entry to CATEGORY_COLORS below.
 * 3. Add an icon to CATEGORY_ICON in ProgramMarker.tsx and ProgramPanel.tsx.
 * 4. Add a seed entry in prisma/seed.ts for that category.
 */

export interface Program {
  id: string;
  title: string;
  category: string;      // e.g. "Kirtan & Prasadam", "Retreat", "Wisdom Session", "Youth Festival"
  description: string;
  longitude: number;     // negative for NYC area (western hemisphere)
  latitude: number;      // positive for NYC area (northern hemisphere)
  date: string;          // ISO date string from the database
  imageUrl: string | null; // optional program photo URL
}

/**
 * Category → accent color mapping
 *
 * Used by both ProgramMarker (dot color + glow) and ProgramPanel (badge, CTA).
 * `bg` is the solid fill; `glow` is the translucent halo / shadow color.
 *
 * If a program has an unknown category, DEFAULT_CATEGORY_COLOR is used.
 */
export const CATEGORY_COLORS: Record<string, { bg: string; glow: string }> = {
  "Kirtan & Prasadam": { bg: "#E8751A", glow: "rgba(232, 117, 26, 0.45)" },   // Saffron
  Retreat:             { bg: "#D4A843", glow: "rgba(212, 168, 67, 0.45)" },     // Gold
  "Wisdom Session":    { bg: "#1A5C5E", glow: "rgba(26, 92, 94, 0.55)" },      // Deep Teal
  "Youth Festival":    { bg: "#e94560", glow: "rgba(233, 69, 96, 0.45)" },     // Crimson
};

/** Fallback for categories not in the map */
export const DEFAULT_CATEGORY_COLOR = { bg: "#6b7280", glow: "rgba(107, 114, 128, 0.45)" };

/** Helper to safely look up category colors */
export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
}
