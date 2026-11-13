import type { KindStyle } from "./GitLab.types.ts";
import type { ContributionKind } from "@/lib/contributions/index.ts";

export const WINDOW_LABEL = "in 3 months";

/** Extra bar width a hovered kind borrows, as a share of the whole bar. */
export const ACTIVE_BOOST = 0.12;

/** The pointer must rest this long on a kind before it takes over (hover intent). */
export const HOVER_INTENT_MS = 70;

/** How long the big number takes to roll to a new value. */
export const ROLL_MS = 450;

/** Label and iOS accent per kind of work; "other" stays neutral. */
export const KINDS: Record<ContributionKind, KindStyle> = {
  pushes: { label: "Pushes", className: "bg-ds-tag-blue" },
  mergeRequests: { label: "Merges", className: "bg-ds-tag-purple" },
  reviews: { label: "Reviews", className: "bg-ds-tag-green" },
  comments: { label: "Comments", className: "bg-ds-tag-orange" },
  other: { label: "Other", className: "bg-ds-gray/40" },
};
