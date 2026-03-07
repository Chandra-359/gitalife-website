"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      setScrolled(scrollY > 100);
      setProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 z-[60] h-[2px] w-full">
        <div
          className="h-full bg-gradient-to-r from-saffron to-gold transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "glass py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="group">
            <span
              className={`font-serif text-xl font-bold tracking-wider transition-all duration-300 ${
                scrolled ? "text-offwhite" : "text-offwhite/80"
              }`}
            >
              GITA{" "}
              <span className="text-gradient-saffron">LIFE</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {["Programs", "About", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-sans text-xs font-medium tracking-[0.15em] uppercase text-offwhite/40 transition-colors duration-300 hover:text-saffron"
              >
                {item}
              </a>
            ))}
            <Link
              href="/get-connected"
              className="glow-saffron rounded-full bg-saffron px-5 py-2 font-sans text-xs font-semibold tracking-wider uppercase text-white transition-all duration-300 hover:scale-105 hover:bg-saffron-light"
            >
              Get Connected
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label="Toggle menu"
          >
            <span
              className={`h-0.5 w-6 bg-white transition-all duration-300 ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-white transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-white transition-all duration-300 ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile menu overlay */}
        <div
          className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-void/98 transition-all duration-500 md:hidden ${
            menuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          {["Programs", "About", "Testimonials"].map((item, i) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className="py-4 font-serif text-3xl text-offwhite/80 transition-colors hover:text-saffron"
              style={{ transitionDelay: `${i * 75}ms` }}
            >
              {item}
            </a>
          ))}
          <Link
            href="/get-connected"
            onClick={() => setMenuOpen(false)}
            className="mt-8 rounded-full bg-saffron px-8 py-3 text-lg font-semibold text-white"
          >
            Get Connected
          </Link>
        </div>
      </nav>
    </>
  );
}
