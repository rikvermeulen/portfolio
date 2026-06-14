import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import { SkeletonCard } from "@/components/Cards/index.ts";

export default function PersonalLoading() {
  return (
    <Bento sizes={bentoBoxSizes.personal} className="size-full">
      <SkeletonCard className="size-full rounded-none" />
    </Bento>
  );
}
