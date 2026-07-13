import type { SkeletonCardProps } from "./SkeletonCard.types.ts";

import classnames from "@/utils/classnames/index.ts";

function SkeletonCard({ className, ...props }: SkeletonCardProps) {
  return (
    <div
      className={classnames("animate-pulse bg-black/10", className)}
      {...props}
    />
  );
}

export default SkeletonCard;
