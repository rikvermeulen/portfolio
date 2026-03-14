import classnames from "@/utils/classnames/classnames.ts";

function SkeletonCard({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={classnames("animate-pulse bg-black/10", className)} />;
}

export default SkeletonCard;
