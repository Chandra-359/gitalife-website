"use client";

/**
 * SocialLinks — large, glowing official-profile buttons (Instagram/YouTube).
 * Rendered at the top of the page (hero) and again at the bottom (outro)
 * so the profiles are impossible to miss.
 */

import { SOCIALS } from "@/data/bhajanClubbing";

const LINKS = [
  {
    href: SOCIALS.instagram,
    label: "Instagram",
    aria: "Gita Life NYC on Instagram",
    color: "#DBB8C8",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: SOCIALS.youtube,
    label: "YouTube",
    aria: "Gita Life NYC on YouTube",
    color: "#FF8E8E",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23 7.6a3 3 0 0 0-2.1-2.2C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.6 32.6 32.6 0 0 0 .5 12 32.6 32.6 0 0 0 1 16.4a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A32.6 32.6 0 0 0 23.5 12 32.6 32.6 0 0 0 23 7.6ZM9.7 15.1V8.9l6 3.1-6 3.1Z" />
      </svg>
    ),
  },
];

export default function SocialLinks() {
  return (
    <div className="flex items-center justify-center gap-5">
      {LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.aria}
          title={`${link.label} — @gitalifenyc`}
          className="group flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-110"
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
            style={{
              background: "rgba(244,240,235,0.07)",
              border: `1.5px solid ${link.color}66`,
              boxShadow: `0 0 24px ${link.color}40`,
              backdropFilter: "blur(8px)",
              color: link.color,
            }}
          >
            {link.icon}
          </span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: link.color }}>
            {link.label}
          </span>
        </a>
      ))}
    </div>
  );
}
