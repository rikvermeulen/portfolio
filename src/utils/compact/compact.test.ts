import { compact } from "./compact.ts";

describe("compact", () => {
  it("removes null and undefined", () => {
    expect(compact(["a", null, "b", undefined])).toEqual(["a", "b"]);
  });

  it("removes other falsy values", () => {
    expect(compact(["a", "", "b"])).toEqual(["a", "b"]);
  });

  it("returns an empty array unchanged", () => {
    expect(compact([])).toEqual([]);
  });
});
