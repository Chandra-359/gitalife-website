"use client";

/**
 * ParallaxBackground — Decorative elements at 3 depth layers that move
 * at different speeds as the user scrolls, creating a sense of depth.
 *
 * Uses Framer Motion useTransform to map scrollY to y-offset per layer.
 * All elements are purely decorative (aria-hidden, pointer-events: none).
 */

import { useState, useEffect } from "react";
import { type MotionValue, motion, useTransform, useReducedMotion } from "framer-motion";

interface ParallaxBackgroundProps {
  scrollY: MotionValue<number>;
}

/** Slow-rotating mandala ring SVG */
function MandalaRing({
  size,
  stroke,
  opacity,
  duration,
  reverse,
}: {
  size: number;
  stroke: string;
  opacity: number;
  duration: number;
  reverse?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      style={{
        animation: `parallax-spin ${duration}s linear infinite ${reverse ? "reverse" : ""}`,
      }}
    >
      <circle cx="100" cy="100" r="95" stroke={stroke} strokeWidth="0.5" opacity={opacity} />
      <circle cx="100" cy="100" r="80" stroke={stroke} strokeWidth="0.3" opacity={opacity * 0.6} />
      {/* Petal decorations */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const cx = 100 + Math.cos(angle) * 60;
        const cy = 100 + Math.sin(angle) * 60;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx="12"
            ry="5"
            fill={stroke}
            opacity={opacity * 0.4}
            transform={`rotate(${i * 30}, ${cx}, ${cy})`}
          />
        );
      })}
    </svg>
  );
}

/** Soft radial gradient orb */
function GradientOrb({ size, color }: { size: number; color: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
    />
  );
}

/** Cluster of small dots */
function DotCluster({
  count,
  color,
  opacity,
}: {
  count: number;
  color: string;
  opacity: number;
}) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      {Array.from({ length: count }, (_, i) => {
        const cx = 30 + (i * 47) % 60;
        const cy = 20 + (i * 31) % 80;
        const r = 2 + (i % 3);
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill={color} opacity={opacity} />
        );
      })}
    </svg>
  );
}

export default function ParallaxBackground({ scrollY }: ParallaxBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const [pageHeight, setPageHeight] = useState(5000);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      setPageHeight(document.documentElement.scrollHeight - window.innerHeight);
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Layer speeds — each moves at a fraction of actual scroll
  const bgY = useTransform(scrollY, [0, pageHeight], [0, -pageHeight * 0.15]);
  const midY = useTransform(scrollY, [0, pageHeight], [0, -pageHeight * 0.4]);
  const fgY = useTransform(scrollY, [0, pageHeight], [0, -pageHeight * 0.7]);

  // For reduced motion, don't apply transforms
  const staticY = 0;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
    >
      {/* ============ Background layer (0.15x) ============ */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: reducedMotion ? staticY : bgY,
          willChange: "transform",
        }}
      >
        {/* Mandala ring — top-left */}
        <div className="absolute" style={{ top: "15vh", left: "-5%" }}>
          <MandalaRing size={500} stroke="#E8751A" opacity={0.03} duration={120} />
        </div>

        {/* Gradient orb — center-right */}
        <div className="absolute" style={{ top: "250vh", right: "5%" }}>
          <GradientOrb size={300} color="rgba(26, 92, 94, 0.06)" />
        </div>

        {/* Dot cluster — bottom-left */}
        {!isMobile && (
          <div className="absolute" style={{ top: "450vh", left: "10%" }}>
            <DotCluster count={8} color="#D4A843" opacity={0.05} />
          </div>
        )}
      </motion.div>

      {/* ============ Midground layer (0.4x) ============ */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: reducedMotion ? staticY : midY,
          willChange: "transform",
        }}
      >
        {/* Mandala ring — right side */}
        <div className="absolute hidden md:block" style={{ top: "100vh", right: "-8%" }}>
          <MandalaRing size={350} stroke="#D4A843" opacity={0.04} duration={90} reverse />
        </div>

        {/* Gradient orb — left */}
        <div className="absolute" style={{ top: "300vh", left: "-3%" }}>
          <GradientOrb size={200} color="rgba(232, 117, 26, 0.05)" />
        </div>

        {/* Dot cluster — center */}
        {!isMobile && (
          <div className="absolute" style={{ top: "500vh", left: "45%" }}>
            <DotCluster count={6} color="#1A5C5E" opacity={0.04} />
          </div>
        )}
      </motion.div>

      {/* ============ Foreground layer (0.7x) — desktop only ============ */}
      {!isMobile && (
        <motion.div
          className="absolute inset-0"
          style={{
            y: reducedMotion ? staticY : fgY,
            willChange: "transform",
          }}
        >
          {/* Small orb */}
          <div className="absolute" style={{ top: "180vh", right: "15%" }}>
            <GradientOrb size={120} color="rgba(212, 168, 67, 0.04)" />
          </div>

          {/* Dot cluster */}
          <div className="absolute" style={{ top: "380vh", left: "20%" }}>
            <DotCluster count={5} color="#E8751A" opacity={0.03} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
