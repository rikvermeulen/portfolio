import type { PlantaPlantCardData } from "./types.ts";
import type { PlantaActionType } from "@/vendors/planta/types.ts";

import { actionLabels } from "./selectors.ts";

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

/** Care states surfaced on a plant card status chip. */
export type PlantaCareState = "due" | "scheduled" | "healthy";

export interface PlantaCardStatus {
  /** `due` = needs attention now; `scheduled` = upcoming; `healthy` = doing well. */
  readonly state: PlantaCareState;
  /** Action this status refers to, when there is one. */
  readonly actionType?: PlantaActionType;
  /** Short chip label, e.g. "Water today", "Mist in 3 days", "Healthy". */
  readonly label: string;
}

/** Watering before misting when several care actions are due at once. */
const dueCarePriority: readonly PlantaActionType[] = [
  "watering",
  "misting",
] as const;

/**
 * All statuses worth showing a viewer for one plant: any care due now, the next
 * scheduled action, and its health — so a healthy plant still reports upcoming
 * care rather than collapsing to a single badge.
 */
export const getPlantaCardStatuses = (
  plant: PlantaPlantCardData,
): readonly PlantaCardStatus[] => {
  const statuses: PlantaCardStatus[] = [];

  dueCarePriority.forEach((type) => {
    if (plant.dueCareActionTypes?.includes(type)) {
      statuses.push({
        state: "due",
        actionType: type,
        label: `${actionLabels[type]} today`,
      });
    }
  });

  const { nextActionType, daysUntilNextAction } = plant;
  const nextIsAlreadyDue =
    nextActionType !== undefined &&
    (plant.dueCareActionTypes?.includes(nextActionType) ?? false);

  if (nextActionType && !nextIsAlreadyDue) {
    statuses.push({
      state: "scheduled",
      actionType: nextActionType,
      label: `${actionLabels[nextActionType]} ${formatPlantaDueText(
        daysUntilNextAction,
      )}`,
    });
  }

  if (isPlantaHappyHealth(plant.health)) {
    statuses.push({ state: "healthy", label: "Healthy" });
  }

  if (statuses.length === 0) {
    statuses.push({ state: "healthy", label: "All done" });
  }

  return statuses;
};
