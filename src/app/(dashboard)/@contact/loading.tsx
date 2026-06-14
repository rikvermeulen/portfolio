import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import { SkeletonCard } from "@/components/Cards/index.ts";

export default function ContactLoading() {
  return (
    <Bento sizes={bentoBoxSizes.contact} className="size-full">
      <SkeletonCard className="size-full rounded-none" />
    </Bento>
  );
}
