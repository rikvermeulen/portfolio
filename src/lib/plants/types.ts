import type { Result } from "@/types/index.ts";
import type { PlantaActionType } from "@/vendors/planta/types.ts";

/** A plant shaped for the Plants module UI. */
export interface PlantaPlantCardData {
  readonly id: string;
  readonly name: string;
  readonly scientificName?: string;
  readonly health?: string;
  readonly siteName?: string;
  readonly imageUrl?: string;
  readonly nextActionType?: PlantaActionType;
  readonly daysUntilNextAction?: number;
  readonly dueCareActionTypes?: readonly PlantaActionType[];
}

export interface PlantaPlantsData {
  readonly plantCards: readonly PlantaPlantCardData[];
}

export type PlantaPlantsResult = Result<PlantaPlantsData>;
