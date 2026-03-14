import SkeletonCard from "@/components/Cards/SkeletonCard/SkeletonCard.tsx";

/**
 * Loading state for the @photos parallel route slot.
 * This component is shown while the photos slot is loading.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/loading
 */
export default function PhotosLoading() {
  return <SkeletonCard className="col-span-2 aspect-square rounded-lg" />;
}
