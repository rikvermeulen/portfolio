import type { PlantaPlantCardData } from "@/lib/planta/types.ts";

export interface PlantsProps {
  readonly plants: readonly PlantaPlantCardData[];
  readonly errorMessage?: string;
}
