"use client";

/**
 * ResetViewButton — "Overview" pill that flies the camera back to HOME_VIEW
 *
 * Z-INDEX: z-30 (same tier as ProgramPanel, below Navbar z-40)
 *
 * Positioned top-left, pushed down (top-20) so it sits below the Navbar.
 * Fades in when a program is selected; fades out otherwise.
 */

interface ResetViewButtonProps {
  visible: boolean;
  onClick: () => void;
}

export default function ResetViewButton({ visible, onClick }: ResetViewButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Reset map to overview"
      className={`absolute left-5 top-20 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-[#0e0e24]/80 px-4 py-2.5 text-sm font-medium text-white/90 shadow-lg backdrop-blur-md transition-all duration-500 hover:border-[#E8751A]/40 hover:bg-[#0e0e24] hover:text-white hover:shadow-[0_0_20px_rgba(232,117,26,0.15)] active:scale-95 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      {/* Return arrow icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M8 1.5L8 11.5M8 1.5L4 5.5M8 1.5L12 5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 10.5C3 12.5 5.2 14.5 8 14.5C10.8 14.5 13 12.5 13 10.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      Overview
    </button>
  );
}
