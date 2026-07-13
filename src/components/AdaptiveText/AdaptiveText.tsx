"use client";

import { useRef } from "react";

import type { AdaptiveTextProps } from "./AdaptiveText.types.ts";

import classnames from "@/utils/classnames/classnames.ts";

import { useAdaptiveTextColor } from "./useAdaptiveTextColor.ts";

/**
 * AdaptiveText — text that stays legible over any solid backdrop, including the
 * translucent `Glass` inside a fixed overlay like the toast stack.
 *
 * It samples the composited backdrop color behind itself and paints the whole
 * string one accessible color — dark over light backdrops, white over dark —
 * chosen by WCAG contrast. Unlike a compositor invert/blend trick, the color is
 * uniform (never a per-pixel gradient that fails contrast mid-glyph) and works
 * across multiple lines. It re-samples smoothly on scroll/resize; see
 * `useAdaptiveTextColor` and `backdropContrast`.
 */
const AdaptiveText = ({
  children,
  className,
  light,
  dark,
}: AdaptiveTextProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  useAdaptiveTextColor(ref, { light, dark });

  return (
    <span ref={ref} className={classnames("adaptive-text", className)}>
      {children}
    </span>
  );
};

export default AdaptiveText;
