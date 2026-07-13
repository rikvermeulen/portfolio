import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { PlantaPlantCardData } from "@/lib/planta/types.ts";

export interface PlantsProps extends BentoSizedProps {
  readonly plants: readonly PlantaPlantCardData[];
}
