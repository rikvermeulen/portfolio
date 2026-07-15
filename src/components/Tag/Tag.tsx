import type { TagProps, TagVariant } from "./Tag.types.ts";

import classnames from "@/utils/classnames/index.ts";

/** Soft pastel chip fill per variant (see the `ds-tag-*` tokens in theme.css). */
const TINT: Record<TagVariant, string> = {
  neutral: "bg-ds-tag-cream",
  yellow: "bg-ds-tag-yellow",
  green: "bg-ds-tag-green",
  blue: "bg-ds-tag-blue",
  orange: "bg-ds-tag-orange",
  pink: "bg-ds-tag-pink",
  lavender: "bg-ds-tag-lavender",
  dark: "bg-ds-tag-dark",
};

const Tag = ({ label, variant = "neutral", className, ...props }: TagProps) => {
  return (
    <div
      className={classnames(
        "inline-flex items-center rounded-2xl px-4 py-1.5 text-base font-medium",
        TINT[variant],
        variant === "dark" ? "text-white" : "text-ds-tag-ink",
        className,
      )}
      {...props}
    >
      {label}
    </div>
  );
};

export default Tag;
