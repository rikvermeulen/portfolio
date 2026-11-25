import { toContributionBreakdown, toContributionKind } from "./gitlabEvents.ts";

describe("toContributionKind", () => {
  it.each([
    [{ action_name: "pushed to", target_type: null }, "pushes"],
    [{ action_name: "pushed new", target_type: "Project" }, "pushes"],
    [{ action_name: "approved", target_type: "MergeRequest" }, "reviews"],
    [{ action_name: "commented on", target_type: "DiffNote" }, "comments"],
    [{ action_name: "opened", target_type: "MergeRequest" }, "mergeRequests"],
    [{ action_name: "accepted", target_type: "MergeRequest" }, "mergeRequests"],
    [{ action_name: "deleted", target_type: "Project" }, "other"],
    [{ action_name: "opened", target_type: "Issue" }, "other"],
  ])("sorts %o as %s", (event, kind) => {
    expect(toContributionKind(event)).toBe(kind);
  });
});

describe("toContributionBreakdown", () => {
  it("counts every kind across pages, in a fixed order", () => {
    expect(
      toContributionBreakdown([
        [
          { action_name: "pushed to", target_type: "Project", id: 1 },
          { action_name: "pushed to" },
          { action_name: "approved", target_type: "MergeRequest" },
        ],
        [{ action_name: "accepted", target_type: "MergeRequest" }],
      ]),
    ).toEqual({
      total: 4,
      shares: [
        { kind: "pushes", count: 2 },
        { kind: "mergeRequests", count: 1 },
        { kind: "reviews", count: 1 },
        { kind: "comments", count: 0 },
        { kind: "other", count: 0 },
      ],
    });
  });

  it("rejects a page that isn't a list of events", () => {
    expect(() =>
      toContributionBreakdown([{ message: "401 Unauthorized" }]),
    ).toThrow();
  });
});
