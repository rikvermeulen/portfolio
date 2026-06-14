"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { GlassProps, GlassTint } from "./Glass.types.ts";
import type { CSSProperties } from "react";

import {
  GLASS_DEFAULTS,
  paintDisplacementMap,
} from "@/lib/glass/displacementMap.ts";
import classnames from "@/utils/classnames/classnames.ts";

const TINT_CLASSES: Record<GlassTint, string> = {
  none: "",
  light: "bg-white/10",
  dark: "bg-black/10",
  adaptive: "bg-white/50 dark:bg-black/30",
};

interface MapState {
  readonly url: string;
  readonly width: number;
  readonly height: number;
}

/**
 * Glass — an agnostic "liquid glass" background layer.
 *
 * Drop it inside any `position: relative; overflow: hidden` container (pill,
 * button, card, …) and it fills the container, refracting whatever sits behind
 * it. It is `pointer-events-none` so clicks pass through to the underlying
 * element.
 *
 * Implements the pipeline from Aave's "Building glass for the web": a runtime
 * displacement map (regenerated per element size) drives an SVG
 * `feDisplacementMap` on the backdrop, with chromatic fringing, blur, and a
 * specular edge highlight on top.
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
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [map, setMap] = useState<MapState | null>(null);
  // Bump on each repaint so the filter id changes — works around Safari caching
  // the filter output across identical ids (per the docs' Safari note).
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const params = { ...GLASS_DEFAULTS, radius };

    const repaint = (): void => {
      if (!(element instanceof HTMLElement)) {
        return;
      }
      const { width, height } = element.getBoundingClientRect();
      if (width < 1 || height < 1) {
        return;
      }
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const url = paintDisplacementMap(
        canvasRef.current,
        width,
        height,
        params,
      );
      if (url) {
        setMap({ url, width, height });
        setRevision((value) => value + 1);
      }
    };

    repaint();

    const observer = new ResizeObserver(repaint);
    observer.observe(element);
    return () => observer.disconnect();
  }, [radius]);

  const moveLight = useCallback((event: MouseEvent | PointerEvent): void => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const { height, left, top, width } = element.getBoundingClientRect();
    if (width < 1 || height < 1) {
      return;
    }

    const x = event.clientX - left;
    const y = event.clientY - top;

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      element.style.setProperty("--glass-light-x", `${x}px`);
      element.style.setProperty("--glass-light-y", `${y}px`);
      animationFrameRef.current = null;
    });
  }, []);

  useEffect(() => {
    if (!interactive) {
      return;
    }
    const parent = ref.current?.parentElement;
    if (!parent) {
      return;
    }
    parent.addEventListener("pointermove", moveLight);
    return () => parent.removeEventListener("pointermove", moveLight);
  }, [interactive, moveLight]);

  const filterId = `glass-${baseId}-${revision}`;
  // The map encodes the bend shape over the full 0..255 range; this is the
  // actual pixel reach at the very edge, easing to 0 across the bulge. Kept
  // moderate so the refraction reads as a soft convex bubble, not a harsh warp.
  const displacementScale = GLASS_DEFAULTS.depth * 0.9 * intensity;
  const chroma = GLASS_DEFAULTS.chroma * displacementScale;

  const backdropFilter = map
    ? `url(#${filterId})${blur > 0 ? ` blur(${blur}px)` : ""} saturate(180%)`
    : blur > 0
      ? `blur(${blur}px) saturate(180%)`
      : undefined;

  const rootStyle: CSSProperties = {
    borderRadius: radius,
    backdropFilter,
    WebkitBackdropFilter: backdropFilter,
    ...style,
  };

  // Clean rim light: single bright ring (Apple-style) + directional top-left
  // catch + gentle inner glow. Higher opacity than a typical glassmorphism
  // border so the edge reads as light catching glass, not a gray outline.
  const angle = GLASS_DEFAULTS.specularAngle;
  const highlightStyle: CSSProperties = {
    borderRadius: radius,
    boxShadow: [
      `inset 0 0 0 0.5px rgba(255,255,255,${GLASS_DEFAULTS.edgeHighlight})`,
      `inset ${Math.cos((angle * Math.PI) / 180).toFixed(2)}px ${Math.sin(
        (angle * Math.PI) / 180,
      ).toFixed(
        2,
      )}px 2px rgba(255,255,255,${(GLASS_DEFAULTS.edgeHighlight * 0.6).toFixed(2)})`,
      `inset 0 0 8px rgba(255,255,255,${GLASS_DEFAULTS.glow})`,
    ].join(", "),
  };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-glass=""
      style={rootStyle}
      className={classnames("pointer-events-none absolute inset-0", className)}
      {...props}
    >
      {map && (
        <svg aria-hidden="true" className="absolute h-0 w-0">
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            filterUnits="objectBoundingBox"
            height="100%"
            width="100%"
            x="0"
            y="0"
          >
            <feImage
              height={map.height}
              href={map.url}
              preserveAspectRatio="none"
              result="map"
              width={map.width}
              x="0"
              y="0"
            />
            {/* Red channel — shifted slightly more for chromatic fringing. */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              result="red"
              scale={displacementScale + chroma}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feColorMatrix
              in="red"
              result="red"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            />
            {/* Green channel — neutral displacement. */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              result="green"
              scale={displacementScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feColorMatrix
              in="green"
              result="green"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            />
            {/* Blue channel — shifted slightly less, completing the split. */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              result="blue"
              scale={displacementScale - chroma}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feColorMatrix
              in="blue"
              result="blue"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="rgb" />
            <feGaussianBlur in="rgb" stdDeviation={blur} />
          </filter>
        </svg>
      )}
      {tint !== "none" && (
        <span
          style={{ borderRadius: radius }}
          className={classnames("absolute inset-0", TINT_CLASSES[tint])}
        />
      )}
      <span style={highlightStyle} className="absolute inset-0" />
    </div>
  );
};

export default Glass;
