"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-text",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    // Magnetic button effect (desktop only)
    const button = buttonRef.current;
    if (!button) return () => ctx.revert();

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      ctx.revert();
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6"
      style={{
        background: `
          radial-gradient(ellipse at 30% 50%, rgba(232,117,26,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, rgba(196,107,138,0.04) 0%, transparent 50%),
          var(--color-midnight-warm)
        `,
      }}
    >
      <div className="relative z-10 text-center">
        <h2 className="cta-text text-5xl text-offwhite sm:text-6xl lg:text-7xl">
          Ready to <span className="text-gradient-warm">begin</span>?
        </h2>
        <p className="cta-text mt-6 font-sans text-xl text-offwhite/35">
          Your journey starts with a single step.
        </p>
        <div className="cta-text mt-12">
          <Link
            ref={buttonRef}
            href="/get-connected"
            className="glow-pulse glow-saffron inline-block rounded-full bg-saffron px-12 py-5 font-sans text-xl font-semibold text-white transition-colors duration-300 hover:bg-saffron-light"
          >
            Get Connected
          </Link>
        </div>
      </div>
    </section>
  );
}
