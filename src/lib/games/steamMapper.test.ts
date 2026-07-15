import {
  buildSteamHeaderUrl,
  buildSteamLibraryArtUrl,
  buildSteamStoreUrl,
} from "./steamMapper.ts";

describe("steam url builders", () => {
  it("builds a landscape header fallback url", () => {
    expect(buildSteamHeaderUrl(570)).toBe(
      "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg",
    );
  });

  it("builds a portrait library-art url", () => {
    expect(buildSteamLibraryArtUrl(570)).toBe(
      "https://cdn.cloudflare.steamstatic.com/steam/apps/570/library_600x900_2x.jpg",
    );
  });

  it("builds a store url", () => {
    expect(buildSteamStoreUrl(570)).toBe(
      "https://store.steampowered.com/app/570",
    );
  });
});
