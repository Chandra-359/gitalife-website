import Link from "next/link";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "#about" },
  { label: "Programs", href: "/programs" },
  { label: "Get Connected", href: "#contact" },
];

const PROGRAM_LINKS = [
  { label: "University Programs", href: "/programs" },
  { label: "Monday Youth Forum", href: "/programs" },
  { label: "Retreats", href: "/programs" },
  { label: "Girls' Preaching", href: "/programs" },
  { label: "Festivals", href: "/programs" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="4" />
        <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "#",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1zm5 0a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "#",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 7L2 7" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#1A5C5E] pt-16 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="#E8751A" strokeWidth="1.2" opacity="0.5" />
                <path d="M14 6c-2 3-5 6-5 9a5 5 0 0 0 10 0c0-3-3-6-5-9Z" fill="#E8751A" opacity="0.85" />
              </svg>
              <span className="text-lg font-bold">
                Gita Life <span className="text-[#E8751A]">NYC</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              A community of young seekers exploring the Bhagavad Gita&apos;s
              timeless wisdom in New York City.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-[#E8751A]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              Programs
            </h3>
            <ul className="space-y-2">
              {PROGRAM_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-[#E8751A]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              Connect
            </h3>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((link) => (
                <button
                  key={link.label}
                  disabled
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/40 cursor-not-allowed"
                  aria-label={`${link.label} (coming soon)`}
                >
                  {link.icon}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-white/60">
              Questions? Reach out anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-12 border-t border-white/10 py-6">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs text-white/40">
            Gita Life NYC &mdash; A community initiative under ISKCON
            &nbsp;&bull;&nbsp; &copy; {new Date().getFullYear()} All rights
            reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
