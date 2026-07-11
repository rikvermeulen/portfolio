/**
 * Tint wash applied over the refraction for legibility.
 * - `adaptive` follows the user's light or dark color scheme.
 * - `light` / `dark` force one wash regardless of scheme.
 * - `none` keeps the refraction pure.
 */
export type GlassTint = "adaptive" | "light" | "dark" | "none";

export interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Corner radius in px. Use a large value (e.g. 999) for pills. */
  readonly radius?: number;
  /** Multiplies the refraction strength. Default 1. */
  readonly intensity?: number;
  /** Backdrop blur in px. Default 0. */
  readonly blur?: number;
  /** Legibility tint wash. Default "adaptive". */
  readonly tint?: GlassTint;
  /** Adds a pointer-following specular light to clickable glass. */
  readonly interactive?: boolean;
}
