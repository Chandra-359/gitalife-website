"use client";

/**
 * CustomCursor — A glowing diya-flame cursor that follows the mouse
 *
 * Features:
 *  - Warm saffron/gold glowing dot
 *  - Soft trailing glow halo
 *  - Scales up on hovering interactive elements
 *  - Hidden on mobile (touch devices)
 *  - Uses transform for GPU-accelerated positioning
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  // Raw mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoothed with spring for trailing effect
  const springX = useSpring(mouseX, { damping: 25, stiffness: 250, mass: 0.5 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 250, mass: 0.5 });

  // Outer glow trails even more
  const glowX = useSpring(mouseX, { damping: 18, stiffness: 120, mass: 0.8 });
  const glowY = useSpring(mouseY, { damping: 18, stiffness: 120, mass: 0.8 });

  useEffect(() => {
    // Hide on touch devices
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onMouseDown = () => setClicking(true);
    const onMouseUp = () => setClicking(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("a, button, [role='button'], input, select, textarea, [data-cursor-hover]");
      setHovering(!!isInteractive);
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    // Hide default cursor
    document.documentElement.style.cursor = "none";
    // Also hide on interactive elements
    const style = document.createElement("style");
    style.id = "custom-cursor-style";
    style.textContent = `
      *, *::before, *::after { cursor: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseover", onMouseOver);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      document.documentElement.style.cursor = "";
      document.getElementById("custom-cursor-style")?.remove();
    };
  }, [mouseX, mouseY]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      {/* Outer glow halo — trails behind */}
      <motion.div
        className="absolute"
        style={{
          x: glowX,
          y: glowY,
          width: hovering ? 60 : 40,
          height: hovering ? 60 : 40,
          marginLeft: hovering ? -30 : -20,
          marginTop: hovering ? -30 : -20,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232, 117, 26, 0.15) 0%, rgba(212, 168, 67, 0.06) 50%, transparent 70%)",
          transition: "width 0.3s, height 0.3s, margin 0.3s",
        }}
      />

      {/* Inner cursor dot */}
      <motion.div
        ref={dotRef}
        className="absolute"
        style={{
          x: springX,
          y: springY,
          width: hovering ? 16 : 8,
          height: hovering ? 16 : 8,
          marginLeft: hovering ? -8 : -4,
          marginTop: hovering ? -8 : -4,
          borderRadius: "50%",
          background: hovering
            ? "radial-gradient(circle, #FFD700 0%, #E8751A 60%, transparent 100%)"
            : "radial-gradient(circle, #FFD700 0%, #E8751A 80%)",
          boxShadow: clicking
            ? "0 0 20px rgba(232, 117, 26, 0.8), 0 0 40px rgba(212, 168, 67, 0.4)"
            : hovering
              ? "0 0 16px rgba(232, 117, 26, 0.6), 0 0 30px rgba(212, 168, 67, 0.3)"
              : "0 0 8px rgba(232, 117, 26, 0.5), 0 0 16px rgba(212, 168, 67, 0.2)",
          transition: "width 0.2s, height 0.2s, margin 0.2s, box-shadow 0.2s",
          transform: clicking ? "scale(0.8)" : "scale(1)",
        }}
      />

      {/* Ring that appears on hover */}
      <motion.div
        className="absolute"
        style={{
          x: springX,
          y: springY,
          width: hovering ? 36 : 0,
          height: hovering ? 36 : 0,
          marginLeft: hovering ? -18 : 0,
          marginTop: hovering ? -18 : 0,
          borderRadius: "50%",
          border: "1px solid rgba(232, 117, 26, 0.3)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: hovering ? 1 : 0,
        }}
      />
    </div>
  );
}
