import Image from "next/image";

import type { BentoProps } from "./Bento.types.ts";
import type { BentoBoxSize } from "./config.ts";
import type { CSSProperties } from "react";

import Glass from "@/components/Glass/index.ts";
import Link from "@/components/Link/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

const ICON_TILE_RADIUS = 8;

/**
 * Bento component - A flexible container for bento grid layouts
 * with optional icon and link functionality
 *
 * @param props - Component props
 * @returns A styled article element for bento grid layouts
 */
const Bento = ({
  image,
  href,
  size,
  sizes,
  children,
  className,
  style,
  ...props
}: BentoProps) => {
  const hasLink = Boolean(href);
  const baseSize = sizes?.base ?? size;

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
  } as CSSProperties;

  // App icon on a rounded liquid-glass tile, à la Apple's glass app icons.
  const iconTile = image ? (
    <div
      style={{ borderRadius: ICON_TILE_RADIUS }}
      className={classnames(
        "relative size-7 overflow-hidden",
        hasLink && "group",
      )}
    >
      <Image
        alt={image}
        height={240}
        src={image}
        width={240}
        className="absolute inset-0 size-7"
      />
      <Glass
        intensity={0.05}
        interactive={hasLink}
        radius={ICON_TILE_RADIUS}
        tint="none"
      />
    </div>
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
      {image && (
        <div
          className={classnames(
            "absolute top-5 right-5 z-20",
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
