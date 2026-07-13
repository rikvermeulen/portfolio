import { getSteamGames, getSteamProfile } from "./service.ts";

jest.mock("./client.ts", () => {
  const actual =
    jest.requireActual<typeof import("./client.ts")>("./client.ts");
  return {
    ...actual,
    fetchPlayerSummaries: jest.fn(),
    fetchOwnedGames: jest.fn(),
    fetchSteamHeaderImage: jest.fn(),
  };
});

const mockEnv = {
  STEAM_API_KEY: undefined as string | undefined,
  STEAM_ID: undefined as string | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

const { fetchPlayerSummaries, fetchOwnedGames, fetchSteamHeaderImage } =
  jest.requireMock("./client.ts") as {
    fetchPlayerSummaries: jest.Mock;
    fetchOwnedGames: jest.Mock;
    fetchSteamHeaderImage: jest.Mock;
  };

const makeSummary = (overrides: Record<string, unknown> = {}) => ({
  steamid: "steam-id",
  personaname: "PARADEMON",
  profileurl: "https://steamcommunity.com/id/parademon",
  avatarfull: "https://avatars.steamstatic.com/owner_full.jpg",
  avatarmedium: "https://avatars.steamstatic.com/owner_medium.jpg",
  ...overrides,
});

const ownerResponse = (overrides: Record<string, unknown> = {}) => ({
  response: { players: [makeSummary(overrides)] },
});

const makeGame = (overrides: Record<string, unknown> = {}) => ({
  appid: 570,
  name: "Dota 2",
  playtime_forever: 9000,
  rtime_last_played: 1_700_000_000,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockEnv.STEAM_API_KEY = "key";
  mockEnv.STEAM_ID = "steam-id";
  fetchPlayerSummaries.mockResolvedValue(ownerResponse());
  fetchOwnedGames.mockResolvedValue({ response: { games: [makeGame()] } });
  fetchSteamHeaderImage.mockResolvedValue(null);
});

describe("getSteamProfile", () => {
  it("returns null when STEAM_API_KEY is missing", async () => {
    mockEnv.STEAM_API_KEY = undefined;
    await expect(getSteamProfile()).resolves.toBeNull();
    expect(fetchPlayerSummaries).not.toHaveBeenCalled();
  });

  it("returns null when STEAM_ID is missing", async () => {
    mockEnv.STEAM_ID = undefined;
    await expect(getSteamProfile()).resolves.toBeNull();
    expect(fetchPlayerSummaries).not.toHaveBeenCalled();
  });

  it("maps the owner summary to a profile", async () => {
    await expect(getSteamProfile()).resolves.toEqual({
      id: "steam-id",
      name: "PARADEMON",
      avatar: "https://avatars.steamstatic.com/owner_full.jpg",
      href: "https://steamcommunity.com/id/parademon",
      online: false,
      playing: undefined,
    });
  });

  it("reflects online presence and the current game", async () => {
    fetchPlayerSummaries
      .mockResolvedValueOnce(
        ownerResponse({ personastate: 1, gameextrainfo: "Baldur's Gate 3" }),
      )
      .mockResolvedValueOnce(ownerResponse({ personastate: 0 }));

    await expect(getSteamProfile()).resolves.toMatchObject({
      online: true,
      playing: "Baldur's Gate 3",
    });
    await expect(getSteamProfile()).resolves.toMatchObject({ online: false });
  });

  it("walks the avatar-size fallback chain down to an empty string", async () => {
    fetchPlayerSummaries
      .mockResolvedValueOnce(ownerResponse({ avatarfull: undefined }))
      .mockResolvedValueOnce(
        ownerResponse({
          avatarfull: undefined,
          avatarmedium: undefined,
          avatar: "https://avatars.steamstatic.com/owner_small.jpg",
        }),
      )
      .mockResolvedValueOnce(
        ownerResponse({ avatarfull: undefined, avatarmedium: undefined }),
      );

    await expect(getSteamProfile()).resolves.toMatchObject({
      avatar: "https://avatars.steamstatic.com/owner_medium.jpg",
    });
    await expect(getSteamProfile()).resolves.toMatchObject({
      avatar: "https://avatars.steamstatic.com/owner_small.jpg",
    });
    await expect(getSteamProfile()).resolves.toMatchObject({ avatar: "" });
  });

  it("throws when the owner summary is missing", async () => {
    fetchPlayerSummaries.mockResolvedValue({ response: { players: [] } });
    await expect(getSteamProfile()).rejects.toThrow(
      "Steam profile summary missing",
    );
  });
});

describe("getSteamGames", () => {
  it("returns [] when Steam is not configured", async () => {
    mockEnv.STEAM_ID = undefined;
    await expect(getSteamGames()).resolves.toEqual([]);
    expect(fetchOwnedGames).not.toHaveBeenCalled();
  });

  it("maps played games, drops malformed/unplayed, sorts by last played, resolves art", async () => {
    fetchOwnedGames.mockResolvedValue({
      response: {
        games: [
          makeGame({ appid: 1, name: "Older", rtime_last_played: 1_000 }),
          makeGame({ appid: 2, name: "Newest", rtime_last_played: 9_000 }),
          makeGame({ appid: 3, name: "Never", playtime_forever: 0 }),
          makeGame({ appid: 4, name: "NoTsA", rtime_last_played: undefined }),
          makeGame({ appid: 5, name: "NoTsB", rtime_last_played: undefined }),
          42,
          null,
          {},
          { appid: 9 },
          { appid: 9, name: "x" },
        ],
      },
    });
    fetchSteamHeaderImage.mockImplementation((appid: number) =>
      Promise.resolve(`https://img.example.com/${appid}/header.jpg`),
    );

    const games = await getSteamGames();
    const names = games.map((game) => game.name);
    expect(names).toHaveLength(4);
    expect(names[0]).toBe("Newest");
    expect(names[1]).toBe("Older");
    expect(names.slice(2).sort()).toEqual(["NoTsA", "NoTsB"]);
    expect(games[0]).toMatchObject({
      id: "steam-2",
      coverImage: "https://img.example.com/2/header.jpg",
      coverImageFallback:
        "https://cdn.cloudflare.steamstatic.com/steam/apps/2/header.jpg",
      portraitImage:
        "https://cdn.cloudflare.steamstatic.com/steam/apps/2/library_600x900_2x.jpg",
      href: "https://store.steampowered.com/app/2",
      playtimeMinutes: 9000,
      platform: "steam",
    });
  });

  it("returns the whole played library, resolving store art only for the recent slice", async () => {
    fetchOwnedGames.mockResolvedValue({
      response: {
        games: Array.from({ length: 30 }, (_, i) =>
          makeGame({ appid: i + 1, name: `Game ${i}`, rtime_last_played: i }),
        ),
      },
    });
    fetchSteamHeaderImage.mockImplementation((appid: number) =>
      Promise.resolve(`https://img.example.com/${appid}/header.jpg`),
    );

    const games = await getSteamGames();
    expect(games).toHaveLength(30);
    expect(games[0]?.coverImage).toBe("https://img.example.com/30/header.jpg");
    expect(games[25]?.coverImage).toContain("cdn.cloudflare.steamstatic.com");
    expect(fetchSteamHeaderImage).toHaveBeenCalledTimes(24);
  });

  it("tolerates an empty library", async () => {
    fetchOwnedGames.mockResolvedValue({ response: {} });
    await expect(getSteamGames()).resolves.toEqual([]);
  });
});
