import cc from '@/lib/cc';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cc('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
