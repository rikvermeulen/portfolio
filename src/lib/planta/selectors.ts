import type {
  PlantaActionType,
  PlantaPlant,
  PlantaPlantCardData,
} from "./types.ts";

import { getDaysUntilIsoDate } from "./plantaUtils.ts";

/** Next action ignores cleaning and repotting for dashboard surfacing. */
const actionPriority: readonly PlantaActionType[] = [
  "watering",
  "fertilizing",
  "misting",
  "progressUpdate",
] as const;

interface NextActionInfo {
  readonly type: PlantaActionType;
  readonly dateIso: string;
  readonly daysUntil: number;
}

const cardCareActionTypes: readonly PlantaActionType[] = [
  "watering",
  "misting",
] as const;

export const actionLabels: Record<PlantaActionType, string> = {
  watering: "Water",
  fertilizing: "Fertilize",
  misting: "Mist",
  cleaning: "Clean",
  repotting: "Repot",
  progressUpdate: "Update progress",
};

const getNextAction = (plant: PlantaPlant): NextActionInfo | null => {
  const actions = plant.actions;
  if (!actions) {
    return null;
  }

  let earliest: NextActionInfo | null = null;

  actionPriority.forEach((type) => {
    const dateIso = actions[type]?.next?.date;
    if (!dateIso) {
      return;
    }

    const daysUntil = getDaysUntilIsoDate(dateIso);
    if (daysUntil === null) {
      return;
    }
    const candidate: NextActionInfo = { type, dateIso, daysUntil };

    if (!earliest || daysUntil < earliest.daysUntil) {
      earliest = candidate;
    }
  });

  return earliest;
};

const getDueCareActionTypes = (
  plant: PlantaPlant,
): readonly PlantaActionType[] => {
  const actions = plant.actions;
  if (!actions) {
    return [];
  }

  return cardCareActionTypes.filter((type) => {
    const dateIso = actions[type]?.next?.date;
    if (!dateIso) {
      return false;
    }

    const daysUntil = getDaysUntilIsoDate(dateIso);

    return daysUntil !== null && daysUntil <= 0;
  });
};

export const toPlantaPlantCards = (
  plants: readonly PlantaPlant[],
): readonly PlantaPlantCardData[] => {
  return [...plants]
    .map((plant): PlantaPlantCardData => {
      const nextAction = getNextAction(plant);

      return {
        id: plant.id,
        name:
          plant.names?.custom?.trim() ||
          plant.names?.localizedName?.trim() ||
          "Unnamed plant",
        scientificName: plant.names?.scientific,
        health: plant.health,
        siteName: plant.site?.name,
        imageUrl: plant.image?.url,
        nextActionType: nextAction?.type,
        nextActionDateIso: nextAction?.dateIso,
        daysUntilNextAction: nextAction?.daysUntil,
        dueCareActionTypes: getDueCareActionTypes(plant),
      };
    })
    .sort((left, right) => {
      const leftDays = left.daysUntilNextAction;
      const rightDays = right.daysUntilNextAction;

      if (leftDays === undefined && rightDays === undefined) {
        return left.name.localeCompare(right.name);
      }

      if (leftDays === undefined) {
        return 1;
      }

      if (rightDays === undefined) {
        return -1;
      }

      if (leftDays === rightDays) {
        return left.name.localeCompare(right.name);
      }

      return leftDays - rightDays;
    });
};
