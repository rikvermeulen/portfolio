import type {
  BentoBoxSize,
  BentoProps,
  GridSpan,
  ResponsiveBentoSize,
} from "./Bento.types.ts";

import AppIcon from "@/components/AppIcon/index.ts";
import Glass from "@/components/Glass/index.ts";
import Link from "@/components/Link/index.ts";
import classnames from "@/utils/classnames/index.ts";

import { bentos } from "./Bento.const.ts";

/** Parse a `"4x4"` size token into its spans, defaulting to 1×1. */
const toSpan = (value?: BentoBoxSize): GridSpan => {
  const [col, row] = value?.split("x").map(Number) ?? [];
  return col && row ? { col, row } : { col: 1, row: 1 };
};

/**
 * Responsive grid spans as CSS custom properties. Each breakpoint falls back to
 * the next smaller one, so `md`/`lg` are optional (base → md → lg cascade).
 */
const toGridVars = (sizes?: ResponsiveBentoSize): React.CSSProperties => {
  const base = toSpan(sizes?.base);
  const md = toSpan(sizes?.md ?? sizes?.base);
  const lg = toSpan(sizes?.lg ?? sizes?.md ?? sizes?.base);

  return {
    "--bento-col-base": base.col,
    "--bento-row-base": base.row,
    "--bento-col-md": md.col,
    "--bento-row-md": md.row,
    "--bento-col-lg": lg.col,
    "--bento-row-lg": lg.row,
  } as React.CSSProperties;
};

/**
 * Bento — a flexible tile for the bento grid. Handles responsive grid spans, an
 * optional glass surface, and an optional (linkable) app icon; everything else
 * is passed through as children.
 */
const Bento = ({
  app,
  image,
  imageAlt,
  href,
  iconPosition = "top-right",
  sizes,
  surfaceClassName,
  children,
  className,
  style,
  ...props
}: BentoProps) => {
  const hasLink = Boolean(href);

  // `app` resolves icon + name from the catalog; `image`/`imageAlt` are the raw
  // escape hatch for tiles that aren't catalog apps.
  const resolvedApp = app ? bentos[app] : null;
  const iconSrc = resolvedApp?.icon ?? image;
  const iconAlt = imageAlt ?? resolvedApp?.name;
  const darkIcon =
    resolvedApp && "darkIcon" in resolvedApp ? resolvedApp.darkIcon : undefined;

  const icon = iconSrc ? (
    <AppIcon
      alt={iconAlt}
      darkSrc={darkIcon}
      interactive={hasLink}
      src={iconSrc}
    />
  ) : null;

  return (
    <article
      data-bento={sizes?.base}
      data-bento-base={sizes?.base}
      data-bento-item
      data-bento-lg={sizes?.lg}
      data-bento-md={sizes?.md}
      style={{ ...toGridVars(sizes), ...style }}
      className={classnames(
        "bento-item relative size-full overflow-hidden rounded-3xl",
        className,
      )}
      {...props}
    >
      {surfaceClassName && (
        <Glass
          intensity={1}
          radius={24}
          tint="none"
          className={classnames("-z-10", surfaceClassName)}
        />
      )}
      {icon && (
        <div
          className={classnames(
            "absolute right-5 z-20",
            iconPosition === "bottom-right" ? "bottom-5" : "top-5",
            hasLink &&
              "cursor-pointer transition-transform duration-300 hover:scale-105",
          )}
        >
          {hasLink ? <Link href={href ?? ""}>{icon}</Link> : icon}
        </div>
      )}
      {children}
    </article>
  );
};

export default Bento;
