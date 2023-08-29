import { Skeleton } from '@/components/Skeleton';

import cc from '@/lib/cc';

export function BentoSkeleton({ className }: { className?: string }) {
  return (
    <div className={cc(className, 'bento relative min-h-[348px] animate-pulse p-5')}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex justify-between">
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-6 w-2/5" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-28 w-36" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
