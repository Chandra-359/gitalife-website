"use client";

import { PaperTexture } from "@paper-design/shaders-react";

/**
 * Calm indigo manuscript-paper shader that fills its parent. Tuned
 * to read as a single sheet of dyed paper, not as a busy fibre rug:
 *
 *  - colorBack / colorFront stay in the same indigo family so the
 *    grain shows as soft tonal variation rather than a two-tone
 *    pattern. Warmth comes from the existing gold/saffron radial
 *    glows already overlaid on each section.
 *  - fiber kept very subtle and small so the curly noise reads as
 *    paper fibres at viewing distance instead of macaroni.
 *  - crumples / folds disabled — those add page-fold drama that
 *    fights the editorial layout.
 *
 * Drop in as the first child of a `position: relative` section and
 * put real content in a sibling with `relative z-10`. The parent's
 * `.surface-sacred` background-color stays as the SSR / no-JS
 * fallback.
 */
export default function PaperTextureBg() {
  return (
    <PaperTexture
      colorBack="#0F1B4D"
      colorFront="#1F2C5E"
      contrast={0.22}
      roughness={0.08}
      fiber={0.18}
      fiberSize={0.28}
      crumples={0}
      crumpleSize={0.35}
      folds={0}
      foldCount={3}
      fade={0.15}
      drops={0.03}
      seed={11}
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
