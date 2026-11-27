import type { ActionTile } from "./Plants.types.ts";
import type { PlantaActionType } from "@/vendors/planta/types.ts";

export const MAX_VISIBLE_PLANTS = 3;

/** Care action → its chip colours (pastel tint + same-hue ink) and icon. */
export const ACTION_TILE: Record<PlantaActionType, ActionTile> = {
  watering: {
    bg: "bg-ds-plant-water-tint",
    ink: "text-ds-plant-water-ink",
    icon: "watering-can",
  },
  misting: {
    bg: "bg-ds-plant-mist-tint",
    ink: "text-ds-plant-mist-ink",
    icon: "spray",
  },
  fertilizing: {
    bg: "bg-ds-plant-fertilize-tint",
    ink: "text-ds-plant-fertilize-ink",
    icon: "flower",
  },
  cleaning: {
    bg: "bg-ds-plant-clean-tint",
    ink: "text-ds-plant-clean-ink",
    icon: "brush",
  },
  repotting: {
    bg: "bg-ds-plant-repot-tint",
    ink: "text-ds-plant-repot-ink",
    icon: "trowel",
  },
  progressUpdate: {
    bg: "bg-ds-plant-water-tint",
    ink: "text-ds-plant-water-ink",
    icon: "timer",
  },
};

/** Fallback tile when a status has no action (a plant that's simply doing well). */
export const HEALTHY_TILE: ActionTile = {
  bg: "bg-ds-plant-healthy-tint",
  ink: "text-ds-plant-healthy-ink",
  icon: "heart",
};

/** Toast the visitor sees the moment they press the button (optimistic). */
export const NUDGE_TOAST = {
  title: "Thanks for the nudge!",
  description: "Rik's been notified to check on his plants.",
} as const;
