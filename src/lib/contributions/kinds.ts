/** Every kind of work, in display order. */
export const CONTRIBUTION_KINDS = [
  "pushes",
  "mergeRequests",
  "reviews",
  "comments",
  "other",
] as const;

export type ContributionKind = (typeof CONTRIBUTION_KINDS)[number];
