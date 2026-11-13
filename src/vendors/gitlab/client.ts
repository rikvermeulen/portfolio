const GITLAB_USER_ID = 19245500;
export const GITLAB_PROFILE_URL = "https://gitlab.com/rikvermeulen97";

const EVENTS_URL = `https://gitlab.com/api/v4/users/${GITLAB_USER_ID}/events`;
const GITLAB_TIMEOUT_MS = 10_000;

export interface GitLabEventPage {
  /** Raw events, untrusted until validated. */
  readonly events: unknown;
  readonly totalPages: number;
}

/**
 * One page (up to 100) of the user's contribution events after `after`
 * (`YYYY-MM-DD`, exclusive). The token needs User → Event → Read; private
 * projects show up as far as the token owner can see them. Throws on a
 * non-ok response.
 */
export async function fetchGitLabEventPage(
  token: string,
  after: string,
  page: number,
): Promise<GitLabEventPage> {
  const url = new URL(EVENTS_URL);
  url.searchParams.set("after", after);
  url.searchParams.set("per_page", "100");
  url.searchParams.set("page", String(page));

  const response = await fetch(url, {
    headers: { "PRIVATE-TOKEN": token },
    cache: "no-store", // the service caches the counted breakdown instead
    signal: AbortSignal.timeout(GITLAB_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`GitLab events request failed with ${response.status}`);
  }

  // GitLab drops this header past 10,000 results; paging on a guess would undercount.
  const pagesHeader = response.headers.get("x-total-pages");
  const totalPages = Number(pagesHeader);
  if (pagesHeader === null || !Number.isInteger(totalPages)) {
    throw new Error("GitLab events response has no page count");
  }

  return { events: await response.json(), totalPages };
}
