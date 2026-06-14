import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import { SkeletonCard } from "@/components/Cards/index.ts";

export default function MusicLoading() {
  return (
    <Bento sizes={bentoBoxSizes.music} className="size-full">
      <SkeletonCard className="size-full rounded-none" />
    </Bento>
  );
}
