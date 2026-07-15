import { steamProvider } from "./steam.ts";

jest.mock("@/vendors/steam/service.ts", () => ({
  getSteamProfile: jest.fn(),
  getSteamGames: jest.fn(),
}));

const { getSteamProfile, getSteamGames } = jest.requireMock(
  "@/vendors/steam/service.ts",
) as { getSteamProfile: jest.Mock; getSteamGames: jest.Mock };

const profile = {
  id: "steam-id",
  name: "PARADEMON",
  avatar: "https://avatars.steamstatic.com/abc_full.jpg",
  href: "https://steamcommunity.com/id/parademon",
  online: true,
};

beforeEach(() => jest.clearAllMocks());

describe("steamProvider", () => {
  it("delegates getProfile and getGames to the Steam service", async () => {
    getSteamProfile.mockResolvedValue(profile);
    getSteamGames.mockResolvedValue([{ id: "steam-1", name: "Dota 2" }]);

    await expect(steamProvider.getProfile?.()).resolves.toBe(profile);
    await expect(steamProvider.getGames?.()).resolves.toEqual([
      { id: "steam-1", name: "Dota 2" },
    ]);
  });

  it("builds the platform link from the profile", async () => {
    getSteamProfile.mockResolvedValue(profile);

    await expect(steamProvider.getPlatformLink()).resolves.toEqual({
      id: "steam",
      name: "Steam",
      handle: "PARADEMON",
      href: "https://steamcommunity.com/id/parademon",
      image: "https://avatars.steamstatic.com/abc_full.jpg",
    });
  });

  it("returns no link when there is no profile", async () => {
    getSteamProfile.mockResolvedValue(null);
    await expect(steamProvider.getPlatformLink()).resolves.toBeNull();
  });
});
