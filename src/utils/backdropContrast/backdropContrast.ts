export interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Rgba extends Rgb {
  a: number;
}

/** Opaque white — the browser's default canvas, used as the composite base. */
const CANVAS_BASE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

/** Parse a CSS color — `rgb()`/`rgba()` (as computed styles report) or hex
 * (as candidate colors are usually written) — into channels. */
export const parseRgb = (color: string): Rgba | null => {
  const hex = color.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hex?.[1]) {
    const h = hex[1];
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    };
  }

  const match = color.match(
    /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)/i,
  );
  if (!match) {
    return null;
  }
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
};

/**
 * Resolve ANY CSS color the browser understands — `rgb()`, `hsl()`, and
 * crucially the `lab()` / `oklch()` / `color()` forms that `getComputedStyle`
 * now returns for modern (Tailwind v4) tokens — down to straight-alpha sRGB, by
 * painting one pixel and reading it back. `parseRgb`'s regex only covers
 * rgb/hex, so backdrop sampling must go through this instead.
 *
 * `getImageData` is a slow GPU→CPU readback, so results are memoized by color
 * string — the same handful of tokens recur across every element and every
 * frame, making this the single biggest sampling cost to cut.
 */
let resolveCtx: CanvasRenderingContext2D | null | undefined;
const colorCache = new Map<string, Rgba | null>();
const resolveColor = (color: string): Rgba | null => {
  const cached = colorCache.get(color);
  if (cached !== undefined) {
    return cached;
  }

  if (resolveCtx === undefined) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    resolveCtx = canvas.getContext("2d", { willReadFrequently: true });
  }

  let result: Rgba | null;
  if (!resolveCtx) {
    result = parseRgb(color); // canvas unavailable — best effort
  } else {
    resolveCtx.clearRect(0, 0, 1, 1);
    resolveCtx.fillStyle = "#000";
    resolveCtx.fillStyle = color; // invalid values are ignored, leaving #000
    resolveCtx.fillRect(0, 0, 1, 1);
    const data = resolveCtx.getImageData(0, 0, 1, 1).data;
    result = {
      r: data[0] ?? 0,
      g: data[1] ?? 0,
      b: data[2] ?? 0,
      a: (data[3] ?? 0) / 255,
    };
  }
  colorCache.set(color, result);
  return result;
};

// Any CSS color token that can appear as a gradient stop.
const COLOR_TOKEN =
  /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^)]*\)|#[\da-f]{3,8}/gi;

/**
 * Approximate a gradient's color by averaging its stops. Tailwind v4 tile
 * backgrounds (`bg-linear-to-br from-… to-…`) are gradients with no
 * `background-color`, so without this they'd read as transparent and the text
 * would contrast against the layer beneath instead of the visible tile.
 */
const gradientCache = new Map<string, Rgba | null>();
const averageGradient = (backgroundImage: string): Rgba | null => {
  const cached = gradientCache.get(backgroundImage);
  if (cached !== undefined) {
    return cached;
  }

  let result: Rgba | null = null;
  if (backgroundImage.includes("gradient")) {
    const tokens = backgroundImage.match(COLOR_TOKEN);
    if (tokens) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;
      for (const token of tokens) {
        const stop = resolveColor(token);
        if (!stop) {
          continue;
        }
        r += stop.r;
        g += stop.g;
        b += stop.b;
        a += stop.a;
        count += 1;
      }
      if (count) {
        result = { r: r / count, g: g / count, b: b / count, a: a / count };
      }
    }
  }
  gradientCache.set(backgroundImage, result);
  return result;
};

/** WCAG 2.1 relative luminance (0 = black, 1 = white). */
export const relativeLuminance = ({ r, g, b }: Rgb): number => {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** WCAG contrast ratio (1–21) between two relative luminances. */
export const contrastRatio = (l1: number, l2: number): number => {
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Composite the element stack at a viewport point into one visible color.
 *
 * `elementsFromPoint` returns front-to-back, so we accumulate source-over from
 * the front and stop at the first (near-)opaque layer — everything below it is
 * hidden. That early-exit is the key perf win: instead of reading every layer
 * down to `<html>`, most tiles are opaque and resolve in one or two steps.
 */
const colorAtPoint = (x: number, y: number, ignore: Element | null): Rgb => {
  const stack = document.elementsFromPoint(x, y);

  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  for (const el of stack) {
    if (ignore?.contains(el)) {
      continue;
    }
    const style = getComputedStyle(el);
    // A gradient paints over the element's background-color, so prefer it.
    const layer =
      averageGradient(style.backgroundImage) ??
      resolveColor(style.backgroundColor);
    if (!layer || layer.a === 0) {
      continue;
    }

    const weight = layer.a * (1 - a); // this layer's contribution behind the front
    r += layer.r * weight;
    g += layer.g * weight;
    b += layer.b * weight;
    a += weight;
    if (a >= 0.999) {
      break;
    } // opaque — nothing below is visible
  }

  // Composite the accumulated (possibly translucent) result over white canvas.
  const rest = 1 - a;
  return {
    r: r + CANVAS_BASE.r * rest,
    g: g + CANVAS_BASE.g * rest,
    b: b + CANVAS_BASE.b * rest,
  };
};

/** Nearest positioned-fixed ancestor — the overlay whose own layers to skip. */
const nearestFixedAncestor = (el: Element): Element | null => {
  let node: Element | null = el.parentElement;
  while (node) {
    if (getComputedStyle(node).position === "fixed") {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

/**
 * Sample the backdrop luminance behind `el`, averaged across three points on
 * its horizontal midline so a single edge doesn't skew the result. Pass the
 * `ignore` overlay (from `nearestFixedAncestor`) so callers can compute it once
 * rather than walking the tree on every sample.
 */
export const backdropLuminance = (
  el: Element,
  ignore: Element | null = nearestFixedAncestor(el),
): number => {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return 1;
  }

  const y = rect.top + rect.height / 2;
  const luminances = [0.15, 0.5, 0.85].map((fraction) =>
    relativeLuminance(
      colorAtPoint(rect.left + rect.width * fraction, y, ignore),
    ),
  );
  return luminances.reduce((sum, l) => sum + l, 0) / luminances.length;
};

/**
 * Choose whichever candidate contrasts best with a backdrop of the given
 * luminance. Defaults to pure white / pure black for maximum legibility.
 */
export const pickContrastColor = (
  backdrop: number,
  {
    light = "#ffffff",
    dark = "#000000",
  }: { light?: string; dark?: string } = {},
): string => {
  const lightLum = relativeLuminance(parseRgb(light) ?? CANVAS_BASE);
  const darkLum = relativeLuminance(parseRgb(dark) ?? { r: 0, g: 0, b: 0 });
  return contrastRatio(backdrop, lightLum) >= contrastRatio(backdrop, darkLum)
    ? light
    : dark;
};
