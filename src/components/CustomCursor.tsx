"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const isVisible = useRef(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    pos.current = { x: e.clientX, y: e.clientY };

    if (!isVisible.current) {
      isVisible.current = true;
      gsap.to([dotRef.current, ringRef.current], {
        opacity: 1,
        duration: 0.3,
      });
    }

    // Dot follows instantly
    gsap.to(dotRef.current, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.15,
      ease: "power2.out",
    });

    // Ring follows with heavier lag — the "magnetic" trailing feel
    gsap.to(ringRef.current, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.5,
      ease: "power3.out",
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    isVisible.current = false;
    gsap.to([dotRef.current, ringRef.current], {
      opacity: 0,
      duration: 0.3,
    });
  }, []);

  const onMouseEnter = useCallback(() => {
    isVisible.current = true;
    gsap.to([dotRef.current, ringRef.current], {
      opacity: 1,
      duration: 0.3,
    });
  }, []);

  // Hover state handlers
  const enterHover = useCallback(() => {
    if (isHovering.current) return;
    isHovering.current = true;

    gsap.to(ringRef.current, {
      width: 80,
      height: 80,
      borderColor: "rgba(232, 117, 26, 0.4)",
      backgroundColor: "rgba(232, 117, 26, 0.08)",
      duration: 0.4,
      ease: "power4.out",
    });

    gsap.to(dotRef.current, {
      scale: 0,
      duration: 0.3,
      ease: "power4.out",
    });

    if (textRef.current) {
      gsap.to(textRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power4.out",
      });
    }
  }, []);

  const leaveHover = useCallback(() => {
    if (!isHovering.current) return;
    isHovering.current = false;

    gsap.to(ringRef.current, {
      width: 36,
      height: 36,
      borderColor: "rgba(245, 245, 245, 0.15)",
      backgroundColor: "transparent",
      duration: 0.4,
      ease: "power4.out",
    });

    gsap.to(dotRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "power4.out",
    });

    if (textRef.current) {
      gsap.to(textRef.current, {
        opacity: 0,
        scale: 0.5,
        duration: 0.2,
        ease: "power4.out",
      });
    }
  }, []);

  useEffect(() => {
    // Only enable on non-touch devices
    if (typeof window === "undefined") return;
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (hasTouch) return;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Watch for interactive elements
    const interactiveSelector =
      'a, button, [role="button"], .program-card, .glow-pulse, input, textarea, select';

    const observer = new MutationObserver(() => {
      attachHoverListeners();
    });

    const attachHoverListeners = () => {
      const elements = document.querySelectorAll(interactiveSelector);
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", enterHover);
        el.removeEventListener("mouseleave", leaveHover);
        el.addEventListener("mouseenter", enterHover);
        el.addEventListener("mouseleave", leaveHover);
      });
    };

    // Initial attach + observe for DOM changes
    attachHoverListeners();
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      observer.disconnect();

      const elements = document.querySelectorAll(interactiveSelector);
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", enterHover);
        el.removeEventListener("mouseleave", leaveHover);
      });
    };
  }, [onMouseMove, onMouseLeave, onMouseEnter, enterHover, leaveHover]);

  return (
    <>
      {/* Small glowing dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] opacity-0"
        style={{
          width: 8,
          height: 8,
          marginLeft: -4,
          marginTop: -4,
          borderRadius: "50%",
          backgroundColor: "#E8751A",
          boxShadow: "0 0 12px rgba(232,117,26,0.6), 0 0 30px rgba(232,117,26,0.2)",
          willChange: "transform",
        }}
      />

      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] flex items-center justify-center opacity-0"
        style={{
          width: 36,
          height: 36,
          marginLeft: -18,
          marginTop: -18,
          borderRadius: "50%",
          border: "1px solid rgba(245,245,245,0.15)",
          willChange: "transform",
          transition: "none",
        }}
      >
        <span
          ref={textRef}
          className="font-sans text-[9px] font-medium tracking-[0.15em] uppercase text-saffron"
          style={{ opacity: 0, transform: "scale(0.5)" }}
        >
          Explore
        </span>
      </div>
    </>
  );
}
