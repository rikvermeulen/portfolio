"use client";

import { useState } from "react";
import Image from "next/image";

import type { AvatarProps } from "./Avatar.types.ts";

import classnames from "@/utils/classnames/index.ts";

const SHAPE = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
} as const;

/**
 * Avatar — a square image that degrades to the name's initial when no source is
 * given or the image fails to load. Theme-aware (works on light or dark
 * surfaces). Sized in tile em so it zooms with its bento tile.
 */
export default function Avatar({
  name,
  src,
  size = 40,
  shape = "circle",
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  // `size` is px at a 16px tile em, so the avatar zooms with its bento tile.
  const edge = `calc(var(--tile-em) * ${size / 16})`;

  return (
    <span
      style={{ width: edge, height: edge }}
      className={classnames(
        "[container-type:size] relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-black/6 ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/15",
        SHAPE[shape],
        className,
      )}
    >
      {showImage ? (
        <Image
          alt={name}
          fill
          onError={() => setFailed(true)}
          sizes={`${size}px`}
          src={src as string}
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="text-[40cqmin] leading-none font-semibold text-neutral-600 dark:text-white/80"
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}
