import "server-only";

import { unstable_cache } from "next/cache";

import type { ContributionBreakdown } from "@/lib/contributions/index.ts";
import type { Result } from "@/types/index.ts";

import { toContributionBreakdown } from "@/lib/contributions/index.ts";
import { env } from "@env";

import { fetchGitLabEventPage } from "./client.ts";

const GITLAB_ACTIVITY_ERROR = "Could not load GitLab activity right now";
const DAY_MS = 86_400_000;

/** About three months of events. */
const WINDOW_DAYS = 91;

// ~25 pages for three months: fetched in parallel, cached once as a breakdown.
const getCachedBreakdown = unstable_cache(
  async (token: string, after: string): Promise<ContributionBreakdown> => {
    const first = await fetchGitLabEventPage(token, after, 1);
    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, index) =>
        fetchGitLabEventPage(token, after, index + 2),
      ),
    );

    return toContributionBreakdown([first, ...rest].map((page) => page.events));
  },
  ["gitlab-breakdown"],
  { revalidate: 3600, tags: ["gitlab"] },
);

/** The last three months of GitLab activity by kind; failures map to a safe error result. */
export async function getGitLabActivityResult(
  today: Date = new Date(),
): Promise<Result<ContributionBreakdown>> {
  const { GITLAB_TOKEN } = env;
  if (!GITLAB_TOKEN) {
    return { ok: false, errorMessage: GITLAB_ACTIVITY_ERROR };
  }

  const after = new Date(today.getTime() - WINDOW_DAYS * DAY_MS)
    .toISOString()
    .slice(0, 10);

  try {
    return { ok: true, data: await getCachedBreakdown(GITLAB_TOKEN, after) };
  } catch (error) {
    console.error("[gitlab] activity load failed:", error);
    return { ok: false, errorMessage: GITLAB_ACTIVITY_ERROR };
  }
}
