import type { GlassTint } from "./Glass.types.ts";

import { GLASS_DEFAULTS } from "@/lib/glass/displacementMap.ts";

/** Legibility tint wash class per tint mode. */
export const TINT_CLASSES: Record<GlassTint, string> = {
  none: "",
  light: "bg-white/10",
  dark: "bg-black/10",
  adaptive: "bg-white/50 dark:bg-black/30",
};

// Specular edge highlight, precomputed once from the constant angle.
const ANGLE_RAD = (GLASS_DEFAULTS.specularAngle * Math.PI) / 180;
const EDGE_X = Math.cos(ANGLE_RAD).toFixed(2);
const EDGE_Y = Math.sin(ANGLE_RAD).toFixed(2);
const EDGE_SIDE = (GLASS_DEFAULTS.edgeHighlight * 0.6).toFixed(2);

/**
 * Pointer-following specular hotspot: a soft pool of light gathered under the
 * input while pressed, faded by the active ramp. `display:none` until
 * `useGlassLight` re-arms it, so it costs nothing to composite at rest.
 */
export const hotspotStyle = (radius: number): React.CSSProperties => ({
  borderRadius: radius,
  background:
    "radial-gradient(circle var(--glass-light-r, 80px) at var(--glass-light-x, 50%) var(--glass-light-y, 50%), rgba(255,255,255,0.72), rgba(255,255,255,0) 75%)",
  opacity: "var(--glass-active, 0)",
  mixBlendMode: "screen",
  display: "none",
});

/** Whole-surface illuminate: the interior brightens while pressed. */
export const illuminateStyle = (radius: number): React.CSSProperties => ({
  borderRadius: radius,
  backgroundColor: "rgba(255,255,255,0.9)",
  opacity: "calc(0.14 * var(--glass-active, 0))",
  display: "none",
});

/** Rim light: bright ring + directional top-left catch + gentle inner glow. */
export const rimStyle = (radius: number): React.CSSProperties => ({
  borderRadius: radius,
  boxShadow: [
    `inset 0 0 0 0.5px rgba(255,255,255,${GLASS_DEFAULTS.edgeHighlight})`,
    `inset ${EDGE_X}px ${EDGE_Y}px 2px rgba(255,255,255,${EDGE_SIDE})`,
    `inset 0 0 8px rgba(255,255,255,${GLASS_DEFAULTS.glow})`,
  ].join(", "),
});
