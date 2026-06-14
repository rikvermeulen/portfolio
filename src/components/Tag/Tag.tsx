"use client";

import type { TagProps, TagVariant } from "./Tag.types.ts";

import Glass from "@/components/Glass/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

/** macOS Finder label colors — system tag palette. */
const FINDER_TAG: Record<TagVariant, { glass: string; text: string }> = {
  neutral: {
    glass: "bg-[#8E8E93]/90",
    text: "text-white",
  },
  yellow: {
    glass: "bg-[#FFCC00]/90",
    text: "text-white",
  },
  green: {
    glass: "bg-[#34C759]/90",
    text: "text-white",
  },
  blue: {
    glass: "bg-[#007AFF]/90",
    text: "text-white",
  },
  orange: {
    glass: "bg-[#FF9500]/90",
    text: "text-white",
  },
  pink: {
    glass: "bg-[#AF52DE]/90",
    text: "text-white",
  },
};

const Tag = ({ label, variant = "neutral", className, ...props }: TagProps) => {
  const styles = FINDER_TAG[variant];

  return (
    <div
      className={classnames(
        "relative inline-flex h-6 items-center overflow-hidden rounded-lg px-2.5",
        className,
      )}
      {...props}
    >
      <Glass
        blur={6}
        intensity={1.2}
        radius={8}
        tint="none"
        className={styles.glass}
      />
      <span
        className={classnames("relative z-10 text-xs font-medium", styles.text)}
      >
        {label}
      </span>
    </div>
  );
};

export default Tag;
