import type { Section } from "./Navigation.types.ts";

/**
 * The jump-to sections — single source of truth for the toggle chips and the
 * anchor ids they scroll to. `id` must match an element `id` rendered in the
 * dashboard (`about` → grid top, `work` → the section-break divider).
 */
export const sections: readonly Section[] = [
  { id: "about", label: "About me", variant: "yellow" },
  { id: "work", label: "Work", variant: "green" },
];
