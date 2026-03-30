"use client";

/**
 * ScrollLotus — A fixed-position lotus SVG that blooms as the user scrolls.
 *
 * 4 petal layers + center, each animating across a staggered scroll range.
 * Uses Framer Motion useTransform to map scrollYProgress to per-petal transforms.
 * Renders outside React's render cycle for zero re-renders on scroll.
 */

import { type MotionValue, motion, useTransform, useReducedMotion } from "framer-motion";

interface ScrollLotusProps {
  scrollYProgress: MotionValue<number>;
}

/** Generate petal data for a ring of ellipses */
function petalRing(
  count: number,
  offset: number,
  rx: number,
  ry: number,
  angleOffset: number,
) {
  return Array.from({ length: count }, (_, i) => {
    const angleDeg = i * (360 / count) + angleOffset;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      cx: 200 + Math.cos(angleRad) * offset,
      cy: 200 + Math.sin(angleRad) * offset,
      rx,
      ry,
      angleDeg,
    };
  });
}

const OUTER_PETALS = petalRing(8, 85, 65, 25, 0);
const MIDDLE_PETALS = petalRing(8, 55, 45, 18, 22.5);
const INNER_PETALS = petalRing(8, 30, 28, 10, 0);
const STAMEN_POSITIONS = Array.from({ length: 5 }, (_, i) => {
  const angle = (i * 72 * Math.PI) / 180;
  return { cx: 200 + Math.cos(angle) * 10, cy: 200 + Math.sin(angle) * 10 };
});

/** A single animated petal that maps scroll progress to rotation, scale, opacity */
function AnimatedPetal({
  petal,
  scrollYProgress,
  scrollStart,
  scrollEnd,
  targetOpacity,
  fill,
}: {
  petal: { cx: number; cy: number; rx: number; ry: number; angleDeg: number };
  scrollYProgress: MotionValue<number>;
  scrollStart: number;
  scrollEnd: number;
  targetOpacity: number;
  fill: string;
}) {
  const rotate = useTransform(
    scrollYProgress,
    [scrollStart, scrollEnd],
    [petal.angleDeg + 80, petal.angleDeg],
  );
  const scale = useTransform(scrollYProgress, [scrollStart, scrollEnd], [0.3, 1]);
  const opacity = useTransform(scrollYProgress, [scrollStart, scrollEnd], [0, targetOpacity]);

  return (
    <motion.ellipse
      cx={petal.cx}
      cy={petal.cy}
      rx={petal.rx}
      ry={petal.ry}
      fill={fill}
      style={{
        rotate,
        scale,
        opacity,
        transformOrigin: `${petal.cx}px ${petal.cy}px`,
      }}
    />
  );
}

/** Static fully-bloomed petal for reduced-motion */
function StaticPetal({
  petal,
  targetOpacity,
  fill,
}: {
  petal: { cx: number; cy: number; rx: number; ry: number; angleDeg: number };
  targetOpacity: number;
  fill: string;
}) {
  return (
    <ellipse
      cx={petal.cx}
      cy={petal.cy}
      rx={petal.rx}
      ry={petal.ry}
      fill={fill}
      opacity={targetOpacity}
      transform={`rotate(${petal.angleDeg}, ${petal.cx}, ${petal.cy})`}
    />
  );
}

export default function ScrollLotus({ scrollYProgress }: ScrollLotusProps) {
  const reducedMotion = useReducedMotion();

  // Gentle upward drift as user scrolls
  const driftY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Ring path drawing
  const outerRingPath = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const innerRingPath = useTransform(scrollYProgress, [0.05, 0.65], [0, 1]);

  // Center elements
  const centerScale = useTransform(scrollYProgress, [0.6, 1], [0, 1]);
  const centerOpacity = useTransform(scrollYProgress, [0.6, 1], [0, 0.15]);

  if (reducedMotion) {
    return (
      <div
        className="pointer-events-none fixed bottom-[10vh] right-[-40px] z-[2] hidden md:block"
        aria-hidden="true"
      >
        <div className="relative">
          <svg width="320" height="320" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="180" stroke="#E8751A" strokeWidth="0.5" opacity="0.04" />
            <circle cx="200" cy="200" r="160" stroke="#D4A843" strokeWidth="0.5" opacity="0.03" />
            {OUTER_PETALS.map((p, i) => (
              <StaticPetal key={`o${i}`} petal={p} targetOpacity={0.06} fill="#E8751A" />
            ))}
            {MIDDLE_PETALS.map((p, i) => (
              <StaticPetal key={`m${i}`} petal={p} targetOpacity={0.08} fill="#D4A843" />
            ))}
            {INNER_PETALS.map((p, i) => (
              <StaticPetal key={`i${i}`} petal={p} targetOpacity={0.1} fill="#E8751A" />
            ))}
            <circle cx="200" cy="200" r="12" fill="#D4A843" opacity="0.15" />
            {STAMEN_POSITIONS.map((s, i) => (
              <circle key={`s${i}`} cx={s.cx} cy={s.cy} r="3" fill="#FFD700" opacity="0.12" />
            ))}
          </svg>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="pointer-events-none fixed bottom-[10vh] right-[-40px] z-[2] hidden md:block"
      style={{ y: driftY, willChange: "transform" }}
      aria-hidden="true"
    >
      {/* Glow behind the lotus */}
      <div
        className="absolute inset-0 -z-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(232, 117, 26, 0.08) 0%, transparent 60%)",
        }}
      />

      <svg width="320" height="320" viewBox="0 0 400 400" fill="none">
        {/* Outer decorative rings */}
        <motion.circle
          cx="200" cy="200" r="180"
          stroke="#E8751A" strokeWidth="0.5" opacity="0.04"
          style={{ pathLength: outerRingPath }}
        />
        <motion.circle
          cx="200" cy="200" r="160"
          stroke="#D4A843" strokeWidth="0.5" opacity="0.03"
          style={{ pathLength: innerRingPath }}
        />

        {/* Layer 1: Outer petals — scroll 0% to 50% */}
        {OUTER_PETALS.map((petal, i) => (
          <AnimatedPetal
            key={`outer-${i}`}
            petal={petal}
            scrollYProgress={scrollYProgress}
            scrollStart={0.0 + i * 0.02}
            scrollEnd={0.5 + i * 0.02}
            targetOpacity={0.06}
            fill="#E8751A"
          />
        ))}

        {/* Layer 2: Middle petals — scroll 15% to 65% */}
        {MIDDLE_PETALS.map((petal, i) => (
          <AnimatedPetal
            key={`mid-${i}`}
            petal={petal}
            scrollYProgress={scrollYProgress}
            scrollStart={0.15 + i * 0.02}
            scrollEnd={0.65 + i * 0.02}
            targetOpacity={0.08}
            fill="#D4A843"
          />
        ))}

        {/* Layer 3: Inner petals — scroll 35% to 80% */}
        {INNER_PETALS.map((petal, i) => (
          <AnimatedPetal
            key={`inner-${i}`}
            petal={petal}
            scrollYProgress={scrollYProgress}
            scrollStart={0.35 + i * 0.02}
            scrollEnd={0.8 + i * 0.02}
            targetOpacity={0.1}
            fill="#E8751A"
          />
        ))}

        {/* Layer 4: Center — scroll 60% to 100% */}
        <motion.circle
          cx="200" cy="200" r="12"
          fill="#D4A843"
          style={{ scale: centerScale, opacity: centerOpacity, transformOrigin: "200px 200px" }}
        />
        {STAMEN_POSITIONS.map((s, i) => {
          const stamenStart = 0.65 + i * 0.03;
          const stamenEnd = Math.min(stamenStart + 0.25, 1.0);
          return (
            <AnimatedStamen
              key={`stamen-${i}`}
              cx={s.cx}
              cy={s.cy}
              scrollYProgress={scrollYProgress}
              scrollStart={stamenStart}
              scrollEnd={stamenEnd}
            />
          );
        })}
      </svg>
    </motion.div>
  );
}

function AnimatedStamen({
  cx,
  cy,
  scrollYProgress,
  scrollStart,
  scrollEnd,
}: {
  cx: number;
  cy: number;
  scrollYProgress: MotionValue<number>;
  scrollStart: number;
  scrollEnd: number;
}) {
  const scale = useTransform(scrollYProgress, [scrollStart, scrollEnd], [0, 1]);
  const opacity = useTransform(scrollYProgress, [scrollStart, scrollEnd], [0, 0.12]);

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r="3"
      fill="#FFD700"
      style={{ scale, opacity, transformOrigin: `${cx}px ${cy}px` }}
    />
  );
}
