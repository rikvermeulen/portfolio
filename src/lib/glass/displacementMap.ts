/**
 * Glass displacement map generation.
 *
 * Implements the technique described in Aave's "Building glass for the web"
 * (https://aave.com/design/building-glass-for-the-web):
 *
 *   1. A displacement map is generated for the glass shape/size. Its red and
 *      green channels encode how far each pixel bends horizontally/vertically.
 *   2. The map is neutral (gray, 128/128) outside the lens so only pixels under
 *      the glass move; the bend is concentrated in the rounded-rect bezel band
 *      while the flat center stays neutral.
 *   3. For performance the map has 4-fold symmetry: only the top-left quadrant
 *      is computed and mirrored across both axes (75% fewer per-pixel calcs).
 *
 * `computeDisplacement` is pure (no DOM) and unit-tested. `paintDisplacementMap`
 * is the browser-only painter that rasterises it onto a canvas.
 */

export interface GlassParams {
  /** Corner radius in px. */
  readonly radius: number;
  /** Displacement scale factor (docs demo: 0.1). */
  readonly scale: number;
  /** Bezel depth in px — width of the refracting edge band (docs demo: 10). */
  readonly depth: number;
  /** Edge curvature shaping the falloff profile (docs demo: 40). */
  readonly curvature: number;
  /** Splay — spreads the bend across the bezel (docs demo: 1.0). */
  readonly splay: number;
  /** Chromatic aberration amount (docs demo: 0.2). */
  readonly chroma: number;
  /** Backdrop blur in px (docs demo: 0). */
  readonly blur: number;
  /** Inner glow amount (docs demo: 0.1). */
  readonly glow: number;
  /** Edge highlight strength (docs demo: 0.25). */
  readonly edgeHighlight: number;
  /** Specular light angle in degrees (docs demo: 45). */
  readonly specularAngle: number;
}

/**
 * Default parameters taken verbatim from the Aave demo's controls.
 */
export const GLASS_DEFAULTS: GlassParams = {
  radius: 28,
  scale: 0.1,
  depth: 8,
  curvature: 40,
  splay: 1,
  chroma: 0.1,
  blur: 0,
  glow: 0.14,
  edgeHighlight: 0.6,
  specularAngle: 45,
};

export interface Displacement {
  /** Horizontal bend, normalized to roughly [-1, 1]. */
  readonly dx: number;
  /** Vertical bend, normalized to roughly [-1, 1]. */
  readonly dy: number;
}

/**
 * Signed distance from a point to a rounded rectangle centered at the origin.
 * Negative inside, zero on the surface, positive outside.
 *
 * @param px - point x relative to center
 * @param py - point y relative to center
 * @param halfW - half width
 * @param halfH - half height
 * @param radius - corner radius
 */
function roundedRectSDF(
  px: number,
  py: number,
  halfW: number,
  halfH: number,
  radius: number,
): number {
  const r = Math.min(radius, halfW, halfH);
  const qx = Math.abs(px) - (halfW - r);
  const qy = Math.abs(py) - (halfH - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  const outside = Math.hypot(ax, ay);
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - r;
}

/**
 * Compute the displacement (bend) vector at a point inside the glass.
 *
 * Coordinates are in pixels relative to the glass center. Pixels in the flat
 * interior return a neutral {0, 0}; pixels inside the bezel band bend inward
 * (toward the center), with magnitude shaped by `curvature`/`splay` across the
 * band and scaled by `depth * scale`.
 *
 * @param px - point x relative to center, in px
 * @param py - point y relative to center, in px
 * @param halfW - half width of the glass in px
 * @param halfH - half height of the glass in px
 * @param params - glass parameters
 */
export function computeDisplacement(
  px: number,
  py: number,
  halfW: number,
  halfH: number,
  params: GlassParams,
): Displacement {
  const { radius, depth, curvature, splay } = params;

  // The bend reaches `band` px inward from the surface. Tying part of the reach
  // to the element size makes the glass bulge across its whole surface like a
  // convex bubble (Apple's lens) instead of a thin, perfectly-round edge ring;
  // `splay` controls how far that bulge spreads toward the center.
  const minHalf = Math.min(halfW, halfH);
  const band = Math.min(
    Math.max(depth, 1) + minHalf * 0.35 * Math.max(splay, 0),
    minHalf,
  );

  const dist = roundedRectSDF(px, py, halfW, halfH, radius);

  // Outside the shape or past the bulge: neutral, flat center.
  if (dist >= 0 || dist <= -band) {
    return { dx: 0, dy: 0 };
  }

  // `t` = 0 at the inner edge of the bulge, 1 at the surface.
  const t = 1 + dist / band;

  // Smoothstep dome: a rounded, convex bubble profile (gentle in the interior,
  // steepest mid-slope, easing toward the rim) rather than a hard linear ramp.
  // `curvature` biases the dome toward the rim (higher) or the interior (lower).
  const k = Math.max(curvature, 1) / 40;
  const dome = t * t * (3 - 2 * t);
  const profile = Math.pow(dome, k);

  // Surface normal (inward) via the gradient of the SDF, by finite difference.
  const eps = 0.5;
  const gx =
    roundedRectSDF(px + eps, py, halfW, halfH, radius) -
    roundedRectSDF(px - eps, py, halfW, halfH, radius);
  const gy =
    roundedRectSDF(px, py + eps, halfW, halfH, radius) -
    roundedRectSDF(px, py - eps, halfW, halfH, radius);
  /* istanbul ignore next — zero-gradient only occurs at the symmetric center, where profile===0 causes an early return */
  const len = Math.hypot(gx, gy) || 1;

  // Bend inward (negative gradient = toward center). The map encodes only the
  // normalized profile (0..1, peaking at the surface); the actual pixel reach
  // is applied downstream by the SVG feDisplacementMap `scale`.
  return {
    dx: (-gx / len) * profile,
    dy: (-gy / len) * profile,
  };
}

/**
 * Paint the displacement map onto a canvas and return it as a PNG data URL.
 * Browser-only (uses Canvas 2D). Computes the top-left quadrant and mirrors it
 * across both axes for 4-fold symmetry.
 *
 * @param canvas - target canvas element (will be sized to width x height)
 * @param width - glass width in px
 * @param height - glass height in px
 * @param params - glass parameters
 * @returns a `data:image/png` URL, or null if a 2D context is unavailable
 */
export function paintDisplacementMap(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  params: GlassParams,
): string | null {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const image = ctx.createImageData(w, h);
  const data = image.data;

  const halfW = w / 2;
  const halfH = h / 2;
  const qw = Math.ceil(halfW);
  const qh = Math.ceil(halfH);

  // The profile is normalized to 0..1, so the full 0..255 dynamic range is used
  // directly. The actual pixel reach is applied later by the filter's scale.
  const maxBend = 1;

  const setPixel = (x: number, y: number, dx: number, dy: number): void => {
    /* istanbul ignore next — defensive guard, loop bounds ensure coords are always valid */
    if (x < 0 || x >= w || y < 0 || y >= h) {
      return;
    }
    const i = (y * w + x) * 4;
    const r = Math.round(128 + (dx / maxBend) * 127);
    const g = Math.round(128 + (dy / maxBend) * 127);
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = 128;
    data[i + 3] = 255;
  };

  // Top-left quadrant only; mirror into the other three.
  for (let y = 0; y < qh; y++) {
    const py = y + 0.5 - halfH;
    for (let x = 0; x < qw; x++) {
      const px = x + 0.5 - halfW;
      const { dx, dy } = computeDisplacement(px, py, halfW, halfH, params);

      const xr = w - 1 - x;
      const yb = h - 1 - y;
      setPixel(x, y, dx, dy); // top-left
      setPixel(xr, y, -dx, dy); // top-right
      setPixel(x, yb, dx, -dy); // bottom-left
      setPixel(xr, yb, -dx, -dy); // bottom-right
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}
