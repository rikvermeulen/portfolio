"use client";

import { memo, useRef } from "react";

import type { GlassProps } from "./Glass.types.ts";

import { GLASS_DEFAULTS } from "@/lib/glass/displacementMap.ts";
import classnames from "@/utils/classnames/index.ts";

import {
  hotspotStyle,
  illuminateStyle,
  rimStyle,
  TINT_CLASSES,
} from "./Glass.const.ts";
import { GlassFilter } from "./GlassFilter.tsx";
import {
  glassBackdropFilter,
  useDisplacementFilter,
} from "./useDisplacementFilter.ts";
import { useGlassLight } from "./useGlassLight.ts";

// Refraction reach is an absolute pixel amount, so on small or low-intensity
// glass it drops below a pixel and becomes invisible. Below this we skip the
// (compositor-expensive) SVG displacement filter and render a static sheen.
const MIN_REFRACTION_PX = 1;

/**
 * Glass — an agnostic "liquid glass" background layer.
 *
 * Drop it inside any `position: relative; overflow: hidden` container and it
 * fills it, refracting whatever sits behind. It is `pointer-events-none` so
 * clicks pass through. Implements Aave's "Building glass for the web": a runtime
 * displacement map drives an SVG `feDisplacementMap` on the backdrop, with
 * chromatic fringing, blur, and a specular rim on top.
 *
 * The moving parts live in focused modules: `GlassFilter` (the SVG graph),
 * `layers` (the overlay styles), `useDisplacementFilter` (map painting +
 * imperative `<feImage>` updates), and `useGlassLight` (interactive light).
 */
const Glass = ({
  radius = GLASS_DEFAULTS.radius,
  intensity = 1,
  blur = GLASS_DEFAULTS.blur,
  tint = "adaptive",
  interactive = false,
  className,
  style,
  ...props
}: GlassProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const displacementScale = GLASS_DEFAULTS.depth * 0.9 * intensity;
  const chroma = GLASS_DEFAULTS.chroma * displacementScale;
  const refracts = displacementScale >= MIN_REFRACTION_PX;

  const { feImageRef, filterId, paintedRef } = useDisplacementFilter(
    rootRef,
    radius,
    blur,
    refracts,
  );
  const { illuminateRef, hotspotRef } = useGlassLight(rootRef, interactive);

  // The paint flag is a ref, not state, so revealing the filter costs no
  // re-render; read during render only to keep it across an incidental
  // (prop-change) re-render. Non-refracting glass never paints.
  // eslint-disable-next-line react-hooks/refs -- intentional ref read; see above.
  const painted = paintedRef.current;
  const backdropFilter = glassBackdropFilter(
    refracts && painted,
    filterId,
    blur,
  );

  const rootStyle: React.CSSProperties = {
    borderRadius: radius,
    backdropFilter,
    WebkitBackdropFilter: backdropFilter,
    // Gentle squish on press, like the native material compressing under touch.
    ...(interactive
      ? { transform: "scale(calc(1 - 0.02 * var(--glass-press, 0)))" }
      : null),
    ...style,
  };

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-glass=""
      style={rootStyle}
      className={classnames("pointer-events-none absolute inset-0", className)}
      {...props}
    >
      {refracts && (
        <GlassFilter
          id={filterId}
          blur={blur}
          chroma={chroma}
          displacementScale={displacementScale}
          feImageRef={feImageRef}
        />
      )}
      {tint !== "none" && (
        <span
          style={{ borderRadius: radius }}
          className={classnames("absolute inset-0", TINT_CLASSES[tint])}
        />
      )}
      {interactive && (
        <>
          <span
            ref={illuminateRef}
            style={illuminateStyle(radius)}
            className="absolute inset-0"
          />
          <span
            ref={hotspotRef}
            style={hotspotStyle(radius)}
            className="absolute inset-0"
          />
        </>
      )}
      <span style={rimStyle(radius)} className="absolute inset-0" />
    </div>
  );
};

// Memoized so a re-rendering parent (e.g. a Slider updating on drag) doesn't
// re-render every Glass inside it when its own props haven't changed.
export default memo(Glass);
