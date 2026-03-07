"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&!?/\\|[]{}()<>*+=-_~^";

interface LineConfig {
  text: string;
  delay: number; // ms before this line starts decoding
}

const lines: LineConfig[] = [
  { text: "GITA LIFE", delay: 200 },
  { text: "NYC", delay: 600 },
  { text: "", delay: 0 }, // spacer
  { text: "Discover the Gita.", delay: 1200 },
  { text: "Transform Your Life.", delay: 1600 },
];

function scramble(finalText: string, progress: number): string {
  // progress: 0 = fully scrambled, 1 = fully resolved
  const result: string[] = [];
  for (let i = 0; i < finalText.length; i++) {
    if (finalText[i] === " ") {
      result.push(" ");
      continue;
    }
    // Characters resolve left to right
    const charThreshold = i / finalText.length;
    if (progress > charThreshold + 0.1) {
      result.push(finalText[i]);
    } else {
      result.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
    }
  }
  return result.join("");
}

function ScrambleLine({
  text,
  delay,
  onComplete,
}: {
  text: string;
  delay: number;
  onComplete?: () => void;
}) {
  const [display, setDisplay] = useState("");
  const [started, setStarted] = useState(false);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!text) {
      const timer = setTimeout(() => onComplete?.(), delay);
      return () => clearTimeout(timer);
    }

    // Initial scramble before decode starts
    const preScrambleInterval = setInterval(() => {
      setDisplay(scramble(text, 0));
    }, 50);

    const startTimer = setTimeout(() => {
      setStarted(true);
      clearInterval(preScrambleInterval);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      clearInterval(preScrambleInterval);
    };
  }, [text, delay, onComplete]);

  useEffect(() => {
    if (!started || !text) return;

    const duration = 800; // ms to fully decode
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        setDisplay(scramble(text, progress));
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [started, text, onComplete]);

  if (!text) return <div className="h-4" />;

  return (
    <div className="overflow-hidden">
      <span className="inline-block font-mono">{display || "\u00A0"}</span>
    </div>
  );
}

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"scramble" | "fadeout" | "done">("scramble");
  const [completedLines, setCompletedLines] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (completedLines >= lines.filter((l) => l.text).length) {
      // All lines decoded — hold for a moment then fade out
      const timer = setTimeout(() => setPhase("fadeout"), 600);
      return () => clearTimeout(timer);
    }
  }, [completedLines]);

  useEffect(() => {
    if (phase === "fadeout") {
      const timer = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  if (phase === "done") return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-700 ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="px-6 text-center">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${
              i < 2
                ? "font-serif text-4xl font-bold text-white sm:text-6xl lg:text-7xl"
                : "text-lg text-white/50 sm:text-xl"
            } ${i === 1 ? "text-gradient-saffron" : ""}`}
          >
            <ScrambleLine
              text={line.text}
              delay={line.delay}
              onComplete={
                line.text
                  ? () => setCompletedLines((c) => c + 1)
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
