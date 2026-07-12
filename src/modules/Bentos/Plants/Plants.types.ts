import type { PlantaPlantCardData } from "@/lib/planta/types.ts";
import type { WithErrorMessage } from "@/types/index.ts";

export interface PlantsProps extends WithErrorMessage {
  readonly plants: readonly PlantaPlantCardData[];
}
