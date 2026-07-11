"use client";

import type { TagProps, TagVariant } from "./Tag.types.ts";

import classnames from "@/utils/classnames/classnames.ts";

/** Maps a tag variant to its iOS system accent token (see theme.css). */
const TINT: Record<TagVariant, string> = {
  neutral: "bg-ds-gray",
  yellow: "bg-ds-yellow",
  green: "bg-ds-green",
  blue: "bg-ds-blue",
  orange: "bg-ds-orange",
  pink: "bg-ds-purple",
};

const Tag = ({ label, variant = "neutral", className, ...props }: TagProps) => {
  return (
    <div
      className={classnames(
        "relative inline-flex h-7 items-center rounded-full px-3.5 shadow-glass-lift",
        className,
      )}
      {...props}
    >
      {/* Full-saturation color tint */}
      <div
        className={classnames("absolute inset-0 rounded-full", TINT[variant])}
      />
      {/* Liquid Glass sheen: bright highlight near the top, faint edge rims */}
      <div className="pointer-events-none absolute inset-0 rounded-full shadow-glass-sheen" />
      <span className="relative z-10 text-sm font-semibold text-white">
        {label}
      </span>
    </div>
  );
};

export default Tag;
