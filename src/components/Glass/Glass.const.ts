import type { GlassTint } from "./Glass.types.ts";

import { GLASS_DEFAULTS } from "@/lib/glass/displacementMap.ts";

/** Legibility tint wash class per tint mode. */
export const TINT_CLASSES: Record<GlassTint, string> = {
  none: "",
  light: "bg-white/10",
  dark: "bg-black/10",
  adaptive: "bg-white/50 dark:bg-black/30",
};

// Specular rim gradient, precomputed once from the constant light angle: the
// lit corner faces the light, the far corner catches a softer bounce.
const RIM_ANGLE = GLASS_DEFAULTS.specularAngle + 90;
const RIM_LIT = GLASS_DEFAULTS.edgeHighlight + 0.3;
const RIM_BOUNCE = GLASS_DEFAULTS.edgeHighlight;
const RIM_SIDE = GLASS_DEFAULTS.edgeHighlight * 0.35;
const RIM_GRADIENT = `linear-gradient(${RIM_ANGLE}deg, rgba(255,255,255,${RIM_LIT}), rgba(255,255,255,${RIM_SIDE}) 30%, rgba(255,255,255,${RIM_SIDE}) 70%, rgba(255,255,255,${RIM_BOUNCE}))`;
// Keeps only the rim span's padding ring: a gradient border that follows radius.
const RING_MASK =
  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";

/** Soft inner glow, painted on the glass root above the refracted backdrop. */
export const GLOW_SHADOW = `inset 0 0 8px rgba(255,255,255,${GLASS_DEFAULTS.glow})`;

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

/**
 * Rim light: a 1px specular ring, brightest on the corners facing (and opposite)
 * the light, so the rounded corners read. A full pixel, not a hairline: the
 * parent's `overflow-hidden` rounded clip anti-aliases a 0.5px ring away, worst
 * on the corner curves.
 */
export const rimStyle = (radius: number): React.CSSProperties => ({
  borderRadius: radius,
  padding: 1,
  background: RIM_GRADIENT,
  mask: RING_MASK,
  maskComposite: "exclude",
  WebkitMask: RING_MASK,
  WebkitMaskComposite: "xor",
});
