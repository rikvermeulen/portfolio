import { z } from "zod";

import type { ContributionKind } from "./kinds.ts";
import type { ContributionBreakdown } from "./types.ts";

import { CONTRIBUTION_KINDS } from "./kinds.ts";

/** The slice of a GitLab event the breakdown needs (`GET /users/:id/events`). */
const eventsSchema = z.array(
  z.object({
    action_name: z.string(),
    target_type: z.string().nullish(),
  }),
);

type GitLabEvent = z.infer<typeof eventsSchema>[number];

export const toContributionKind = ({
  action_name: action,
  target_type: target,
}: GitLabEvent): ContributionKind => {
  if (action.startsWith("pushed")) {
    return "pushes";
  }
  if (action === "approved") {
    return "reviews";
  }
  if (action === "commented on") {
    return "comments";
  }
  return target === "MergeRequest" ? "mergeRequests" : "other";
};

/**
 * Validates pages of GitLab events and counts them per kind of work.
 *
 * @example toContributionBreakdown([[{ action_name: "pushed to" }]]).total // 1
 */
export function toContributionBreakdown(
  pages: readonly unknown[],
): ContributionBreakdown {
  const kinds = pages
    .flatMap((page) => eventsSchema.parse(page))
    .map(toContributionKind);

  return {
    total: kinds.length,
    shares: CONTRIBUTION_KINDS.map((kind) => ({
      kind,
      count: kinds.filter((each) => each === kind).length,
    })),
  };
}
