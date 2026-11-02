import type { Section } from "./Navigation.types.ts";

/**
 * The jump-to sections — single source of truth for the toggle chips and the
 * anchor ids they scroll to. `id` must match an element `id` rendered in the
 * dashboard: each is the `id` of its bento section grid.
 */
export const sections: readonly Section[] = [
  { id: "about", label: "About me" },
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
];
