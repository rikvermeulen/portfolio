import { pickSpotifyImage } from "./utils.ts";

describe("pickSpotifyImage", () => {
  it("prefers the second image (the ~300px variant)", () => {
    expect(
      pickSpotifyImage([{ url: "large" }, { url: "medium" }, { url: "small" }]),
    ).toBe("medium");
  });

  it("falls back to the first image when only one exists", () => {
    expect(pickSpotifyImage([{ url: "only" }])).toBe("only");
  });

  it("returns null for an empty list", () => {
    expect(pickSpotifyImage([])).toBeNull();
  });
});
