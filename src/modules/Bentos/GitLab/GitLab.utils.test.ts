import {
  describeShare,
  formatCount,
  readoutFor,
  rollValue,
  segmentGrow,
} from "./GitLab.utils.ts";

describe("formatCount", () => {
  it("groups thousands", () => {
    expect(formatCount(2449)).toBe("2,449");
  });
});

describe("describeShare", () => {
  it.each([
    [{ kind: "pushes", count: 1393 }, "1,393 pushes"],
    [{ kind: "mergeRequests", count: 473 }, "473 merges"],
    [{ kind: "other", count: 1 }, "1 other"],
  ] as const)("reads %o", (share, expected) => {
    expect(describeShare(share)).toBe(expected);
  });
});

describe("readoutFor", () => {
  it("names the whole total or the highlighted kind", () => {
    expect(readoutFor(null)).toBe("contributions in 3 months");
    expect(readoutFor("reviews")).toBe("reviews in 3 months");
  });
});

describe("segmentGrow", () => {
  it("rests at the count and widens by a slice of the whole bar", () => {
    expect(segmentGrow({ kind: "comments", count: 150 }, 2500)).toEqual({
      rest: 150,
      active: 450,
    });
  });
});

describe("rollValue", () => {
  it("eases from one number to the other", () => {
    expect(rollValue(2000, 1000, 0)).toBe(2000);
    expect(rollValue(2000, 1000, 1)).toBe(1000);
    // Ease-out: past the halfway point by mid-roll.
    expect(rollValue(0, 100, 0.5)).toBe(88);
  });
});
