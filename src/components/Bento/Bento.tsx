import type { BentoBoxSize, BentoProps } from "./Bento.types.ts";

import AppIcon from "@/components/AppIcon/index.ts";
import Link from "@/components/Link/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

import { bentos } from "./config.ts";

/**
 * Bento component - A flexible container for bento grid layouts
 * with optional icon and link functionality
 *
 * @param props - Component props
 * @returns A styled article element for bento grid layouts
 */
const Bento = ({
  app,
  image,
  imageAlt,
  href,
  iconPosition = "top-right",
  sizes,
  children,
  className,
  style,
  ...props
}: BentoProps) => {
  const hasLink = Boolean(href);
  const baseSize = sizes?.base;

  const toParts = (value?: BentoBoxSize): { col: number; row: number } => {
    if (!value) {
      return { col: 1, row: 1 };
    }

    const [col, row] = value.split("x").map(Number);
    if (!col || !row) {
      return { col: 1, row: 1 };
    }

    return { col, row };
  };

  const base = toParts(baseSize);
  const medium = toParts(sizes?.md ?? baseSize);
  const large = toParts(sizes?.lg ?? sizes?.md ?? baseSize);

  const bentoItemVars = {
    "--bento-col-base": base.col,
    "--bento-row-base": base.row,
    "--bento-col-md": medium.col,
    "--bento-row-md": medium.row,
    "--bento-col-lg": large.col,
    "--bento-row-lg": large.row,
    ...style,
  } as React.CSSProperties;

  // `app` resolves icon + alt from the registry; `image` is the raw escape hatch.
  const resolvedApp = app ? bentos[app] : null;
  const iconSrc = resolvedApp?.icon ?? image;
  const iconAlt = imageAlt ?? resolvedApp?.name;

  const iconTile = iconSrc ? (
    <AppIcon
      alt={iconAlt}
      darkSrc={
        resolvedApp && "darkIcon" in resolvedApp
          ? resolvedApp.darkIcon
          : undefined
      }
      interactive={hasLink}
      src={iconSrc}
    />
  ) : null;

  return (
    <article
      data-bento={baseSize}
      data-bento-base={baseSize}
      data-bento-item
      data-bento-lg={sizes?.lg}
      data-bento-md={sizes?.md}
      style={bentoItemVars}
      className={classnames(
        "bento-item relative size-full overflow-hidden rounded-2xl",
        className,
      )}
      {...props}
    >
      {iconTile && (
        <div
          className={classnames(
            "absolute right-4 z-20",
            iconPosition === "bottom-right" ? "bottom-4" : "top-4",
            hasLink &&
              "cursor-pointer transition-transform duration-300 hover:scale-105",
          )}
        >
          {hasLink ? <Link href={href ?? ""}>{iconTile}</Link> : iconTile}
        </div>
      )}
      {children}
    </article>
  );
};

export default Bento;
