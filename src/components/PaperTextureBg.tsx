"use client";

import { PaperTexture } from "@paper-design/shaders-react";

/**
 * Indigo manuscript-paper shader that fills its parent. Drop into any
 * `.surface-sacred` / `.surface-midnight` section as the first child;
 * give the parent `position: relative` and put real content in a
 * sibling with `relative z-10` so it sits above the canvas.
 *
 * The shader is client-only; the parent's `surface-sacred`
 * background-color stays as the SSR / no-JS fallback.
 */
export default function PaperTextureBg() {
  return (
    <PaperTexture
      colorBack="#0F1B4D"
      colorFront="#EDD698"
      contrast={0.55}
      roughness={0.35}
      fiber={0.45}
      fiberSize={0.55}
      crumples={0.25}
      crumpleSize={0.4}
      folds={0.18}
      foldCount={6}
      fade={0.35}
      drops={0.15}
      seed={7}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
