import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import { SkeletonCard } from "@/components/Cards/index.ts";

export default function PlantsLoading() {
  return (
    <Bento sizes={bentoBoxSizes.plants} className="size-full">
      <SkeletonCard className="size-full rounded-none" />
    </Bento>
  );
}
