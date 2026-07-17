import type { TagProps, TagVariant } from "./Tag.types.ts";

import classnames from "@/utils/classnames/index.ts";

/** iOS 27 vivid accent fill per variant (see the `ds-tag-*` tokens in theme.css). */
const TINT: Record<TagVariant, string> = {
  neutral: "bg-ds-tag-cream",
  green: "bg-ds-tag-green",
  yellow: "bg-ds-tag-yellow",
  orange: "bg-ds-tag-orange",
  red: "bg-ds-tag-red",
  purple: "bg-ds-tag-purple",
  blue: "bg-ds-tag-blue",
  dark: "bg-ds-tag-dark",
  rested: "bg-ds-tag-rested",
};

/** Text color per variant: dark ink on light fills, white on saturated ones.
 *  `rested` uses a token that itself flips with the color scheme. */
const INK: Record<TagVariant, string> = {
  neutral: "text-ds-tag-ink",
  green: "text-white",
  yellow: "text-ds-tag-ink",
  orange: "text-white",
  red: "text-white",
  purple: "text-white",
  blue: "text-white",
  dark: "text-white",
  rested: "text-ds-tag-rested-ink",
};

const Tag = ({ label, variant = "neutral", className, ...props }: TagProps) => {
  return (
    <div
      className={classnames(
        "inline-flex items-center rounded-xl px-2 py-1 text-base font-medium",
        TINT[variant],
        INK[variant],
        className,
      )}
      {...props}
    >
      {label}
    </div>
  );
};

export default Tag;
