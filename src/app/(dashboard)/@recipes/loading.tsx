import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import { SkeletonCard } from "@/components/Cards/index.ts";

export default function RecipesLoading() {
  return (
    <Bento sizes={bentoBoxSizes.recipes} className="size-full">
      <SkeletonCard className="size-full rounded-none" />
    </Bento>
  );
}
