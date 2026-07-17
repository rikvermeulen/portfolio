import type { ActionTile } from "./Plants.types.ts";
import type { PlantaActionType } from "@/vendors/planta/types.ts";

export const MAX_VISIBLE_PLANTS = 3;

/** Care action → its tile colour + icon (one tint per action type). */
export const ACTION_TILE: Record<PlantaActionType, ActionTile> = {
  watering: { bg: "bg-ds-plant-water", icon: "watering-can" },
  misting: { bg: "bg-ds-plant-mist", icon: "spray" },
  fertilizing: { bg: "bg-ds-plant-fertilize", icon: "flower" },
  cleaning: { bg: "bg-ds-plant-clean", icon: "brush" },
  repotting: { bg: "bg-ds-plant-repot", icon: "trowel" },
  progressUpdate: { bg: "bg-ds-plant-water", icon: "timer" },
};

/** Fallback tile when a status has no action (a plant that's simply doing well). */
export const HEALTHY_TILE: ActionTile = {
  bg: "bg-ds-plant-clean",
  icon: "heart",
};

/** Nudge endpoint — pushes a summary of the plants a visitor flagged to Rik. */
export const NUDGE_ENDPOINT = "/api/planta/remind";

/** Toast the visitor sees the moment they press the button (optimistic). */
export const NUDGE_TOAST = {
  title: "Thanks for the nudge!",
  description: "Rik's been notified to check on his plants.",
} as const;
