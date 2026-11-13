import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { IconName } from "@/components/Icon/index.ts";
import type { PlantaPlantCardData } from "@/lib/plants/types.ts";

export interface PlantsProps extends BentoSizedProps {
  readonly plants: readonly PlantaPlantCardData[];
  /** Server action that pushes the due-plants summary to Rik (`Plants.actions.ts`). */
  readonly onRemind: () => Promise<{ ok: boolean }>;
}

export type NudgeButtonProps = Pick<PlantsProps, "onRemind">;

export interface PlantDetailProps {
  readonly plant: PlantaPlantCardData;
}

/** A care action's tile colour + icon (one tint per action type). */
export interface ActionTile {
  readonly bg: string;
  readonly icon: IconName;
}
