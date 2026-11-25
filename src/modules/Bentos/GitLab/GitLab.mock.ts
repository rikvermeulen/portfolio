import type { GitLabProps } from "./GitLab.types.ts";

export const mockGitLabProps = {
  sizeKey: "gitlab",
  breakdown: {
    total: 2449,
    shares: [
      { kind: "pushes", count: 1393 },
      { kind: "mergeRequests", count: 473 },
      { kind: "reviews", count: 220 },
      { kind: "comments", count: 157 },
      { kind: "other", count: 206 },
    ],
  },
  href: "https://gitlab.com/rikvermeulen97",
} satisfies GitLabProps;

export const mockGitLabEmptyProps = {
  ...mockGitLabProps,
  breakdown: {
    total: 0,
    shares: mockGitLabProps.breakdown.shares.map((share) => ({
      ...share,
      count: 0,
    })),
  },
} satisfies GitLabProps;
