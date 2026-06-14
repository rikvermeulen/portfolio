import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import { SkeletonCard } from "@/components/Cards/index.ts";

/**
 * Loading state for the @photos parallel route slot.
 * This component is shown while the photos slot is loading.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/loading
 */
export default function PhotosLoading() {
  return (
    <Bento sizes={bentoBoxSizes.photos} className="size-full">
      <SkeletonCard className="size-full rounded-none" />
    </Bento>
  );
}
