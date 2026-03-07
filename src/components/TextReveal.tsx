"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TextReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!textRef.current) return;

      const text = textRef.current.textContent || "";
      textRef.current.innerHTML = "";

      // Split text into words, wrapping highlight words in saffron spans
      const highlightWords = [
        "Bhagavad",
        "Gita",
        "community",
        "wisdom",
        "NYC",
        "kirtans",
        "retreats",
        "friendships",
        "questions",
      ];

      text.split(" ").forEach((word, i) => {
        const span = document.createElement("span");
        span.textContent = word + " ";
        span.className = "inline-block opacity-20 transition-none";

        if (highlightWords.some((hw) => word.toLowerCase().includes(hw.toLowerCase()))) {
          span.dataset.highlight = "true";
        }

        textRef.current!.appendChild(span);
      });

      const words = textRef.current.querySelectorAll("span");

      gsap.to(words, {
        opacity: 1,
        stagger: 0.03,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 1,
        },
        onUpdate: function () {
          words.forEach((word) => {
            const el = word as HTMLElement;
            const opacity = parseFloat(el.style.opacity || "0.2");
            if (opacity > 0.6 && el.dataset.highlight === "true") {
              el.style.color = "#E8751A";
            }
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center bg-[#0d0d0d] px-6 py-32"
    >
      <div className="mx-auto max-w-4xl">
        <p
          ref={textRef}
          className="font-serif text-3xl leading-relaxed font-light text-white sm:text-4xl lg:text-5xl lg:leading-relaxed"
        >
          Gita Life NYC is a community of young seekers exploring the Bhagavad
          Gita&apos;s timeless wisdom — through weekly discussions, kirtans,
          retreats, and deep friendships. No prior experience needed. No
          pressure. Just genuine conversations about life&apos;s biggest
          questions.
        </p>
      </div>
    </section>
  );
}
