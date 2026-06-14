import type { PlantaActionType } from "@/lib/planta/types.ts";

import { actionLabels } from "@/lib/planta/selectors.ts";

const HAPPY_HEALTH_KEYWORDS = [
  "happy",
  "good",
  "great",
  "healthy",
  "thriving",
] as const;

/**
 * Human-readable relative time until the next scheduled action.
 */
export const formatPlantaDueText = (daysUntil?: number): string => {
  if (daysUntil === undefined) {
    return "soon";
  }

  if (daysUntil <= 0) {
    return "today";
  }

  if (daysUntil === 1) {
    return "in 1 day";
  }

  return `in ${daysUntil} days`;
};

/**
 * Whether Planta health text indicates the plant is doing well.
 */
export const isPlantaHappyHealth = (health?: string): boolean => {
  if (!health) {
    return false;
  }

  const normalized = health.toLowerCase();

  return HAPPY_HEALTH_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const isDueOrOverdue = (daysUntilNextAction?: number): boolean => {
  return daysUntilNextAction !== undefined && daysUntilNextAction <= 0;
};

/**
 * Short status labels for the plant care card (water, attention, etc.).
 */
export const getPlantaPlantStatusTags = (
  nextActionType: PlantaActionType | undefined,
  daysUntilNextAction: number | undefined,
): readonly string[] => {
  if (!nextActionType) {
    return ["Got water"];
  }

  const due = isDueOrOverdue(daysUntilNextAction);

  if (nextActionType === "watering") {
    return due ? ["Need water"] : ["Got water"];
  }

  if (nextActionType === "misting") {
    return due ? ["Need attention", "Misting"] : ["Misting soon"];
  }

  const label = actionLabels[nextActionType];

  return due ? ["Need attention", label] : [label];
};
