import { pickSpotifyImage } from "./image.ts";

describe("pickSpotifyImage", () => {
  it("picks the widest image whatever the order (SDK lists aren't sorted)", () => {
    expect(
      pickSpotifyImage([
        { url: "medium", width: 300 },
        { url: "small", width: 64 },
        { url: "large", width: 640 },
      ]),
    ).toBe("large");
  });

  it("keeps the API's first (largest) image when widths are missing", () => {
    expect(
      pickSpotifyImage([{ url: "large" }, { url: "medium", width: null }]),
    ).toBe("large");
  });

  it("returns null for an empty list", () => {
    expect(pickSpotifyImage([])).toBeNull();
  });
});
