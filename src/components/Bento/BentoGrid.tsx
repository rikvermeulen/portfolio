"use client";

import { useLayoutEffect, useRef } from "react";

import type { BentoGridProps } from "./Bento.types.ts";

import classnames from "@/utils/classnames/classnames.ts";

import { bentoSizeBreakpoints } from "./config.ts";

const BentoGrid = ({
  config,
  className,
  children,
  style,
  ...props
}: BentoGridProps) => {
  const gridRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!gridRef.current) {
      return;
    }

    const target = gridRef.current;
    let frameId: number | null = null;

    const resolveValue = <T,>(values: { base: T; md?: T; lg?: T }): T => {
      const isLg = window.matchMedia(
        `(min-width: ${bentoSizeBreakpoints.lg})`,
      ).matches;
      const isMd = window.matchMedia(
        `(min-width: ${bentoSizeBreakpoints.md})`,
      ).matches;

      if (isLg && values.lg !== undefined) {
        return values.lg;
      }
      if (isMd && values.md !== undefined) {
        return values.md;
      }
      return values.base;
    };

    const updateGeometry = () => {
      const rootSize = Number(
        window
          .getComputedStyle(document.documentElement)
          .fontSize.replace("px", ""),
      );
      const rootSizePx = Number.isFinite(rootSize) ? rootSize : 16;

      const toPx = (value: string): number => {
        const trimmed = value.trim();
        if (trimmed.endsWith("rem")) {
          return Number(trimmed.slice(0, -3)) * rootSizePx;
        }
        if (trimmed.endsWith("px")) {
          return Number(trimmed.slice(0, -2));
        }
        const raw = Number(trimmed);
        return Number.isFinite(raw) ? raw : 0;
      };

      const columns = resolveValue(config.columns);
      const gap = resolveValue(config.gap);
      const gapPx = toPx(gap);
      const rowPx = Math.max(
        1,
        (target.clientWidth - (columns - 1) * gapPx) / columns,
      );

      target.style.setProperty("--bento-columns-current", String(columns));
      target.style.setProperty("--bento-gap-current", gap);
      target.style.setProperty("--bento-row-current", `${rowPx}px`);
    };

    const onResize = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(updateGeometry);
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [config]);

  const cssVars = {
    "--bento-columns-base": config.columns.base,
    "--bento-columns-md": config.columns.md ?? config.columns.base,
    "--bento-columns-lg":
      config.columns.lg ?? config.columns.md ?? config.columns.base,
    "--bento-gap-base": config.gap.base,
    "--bento-gap-md": config.gap.md ?? config.gap.base,
    "--bento-gap-lg": config.gap.lg ?? config.gap.md ?? config.gap.base,
    "--bento-row-height-base": config.rowHeight.base,
    "--bento-row-height-md": config.rowHeight.md ?? config.rowHeight.base,
    "--bento-row-height-lg":
      config.rowHeight.lg ?? config.rowHeight.md ?? config.rowHeight.base,
    ...style,
  } as React.CSSProperties;

  return (
    <div
      ref={gridRef}
      style={cssVars}
      className={classnames("bentogrid", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default BentoGrid;
