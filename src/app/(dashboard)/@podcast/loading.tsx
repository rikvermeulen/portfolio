import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import { SkeletonCard } from "@/components/Cards/index.ts";

export default function PodcastLoading() {
  return (
    <Bento sizes={bentoBoxSizes.podcast} className="size-full">
      <SkeletonCard className="size-full rounded-none" />
    </Bento>
  );
}
