import { getSteamGamesResult } from "./service.ts";

jest.mock("./client.ts", () => {
  const actual =
    jest.requireActual<typeof import("./client.ts")>("./client.ts");
  return {
    ...actual,
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

const { fetchOwnedGames, fetchSteamHeaderImage } = jest.requireMock(
  "./client.ts",
) as {
  fetchOwnedGames: jest.Mock;
  fetchSteamHeaderImage: jest.Mock;
};

const makeGame = (overrides: Record<string, unknown> = {}) => ({
  appid: 570,
  name: "Dota 2",
  playtime_forever: 9000,
  rtime_last_played: 1_700_000_000,
  img_icon_url: "abc",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockEnv.STEAM_API_KEY = "key";
  mockEnv.STEAM_ID = "steam-id";
  fetchSteamHeaderImage.mockResolvedValue(null);
});

describe("getSteamGamesResult", () => {
  it("returns ok:false when STEAM_API_KEY is missing", async () => {
    mockEnv.STEAM_API_KEY = undefined;

    await expect(getSteamGamesResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Steam is not configured",
    });
    expect(fetchOwnedGames).not.toHaveBeenCalled();
  });

  it("returns ok:false when STEAM_ID is missing", async () => {
    mockEnv.STEAM_ID = undefined;

    await expect(getSteamGamesResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Steam is not configured",
    });
    expect(fetchOwnedGames).not.toHaveBeenCalled();
  });

  it("maps played games, drops malformed/unplayed, and sorts by last played", async () => {
    fetchOwnedGames.mockResolvedValue({
      response: {
        games: [
          makeGame({
            appid: 1,
            name: "Older",
            rtime_last_played: 1_000,
          }),
          makeGame({
            appid: 2,
            name: "Newest",
            rtime_last_played: 9_000,
          }),
          // never played → filtered out
          makeGame({ appid: 3, name: "Never Played", playtime_forever: 0 }),
          // no rtime_last_played → treated as oldest (two, so the comparator
          // evaluates the `?? 0` fallback on both sides)
          makeGame({
            appid: 4,
            name: "No Timestamp A",
            rtime_last_played: undefined,
          }),
          makeGame({
            appid: 5,
            name: "No Timestamp B",
            rtime_last_played: undefined,
          }),
          // malformed entries — exercise every guard branch
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

    const result = await getSteamGamesResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      const names = result.data.games.map((g) => g.name);
      expect(names).toHaveLength(4);
      expect(names[0]).toBe("Newest");
      expect(names[1]).toBe("Older");
      expect(names.slice(2).sort()).toEqual([
        "No Timestamp A",
        "No Timestamp B",
      ]);
      expect(result.data.games[0]).toMatchObject({
        id: "steam-2",
        coverImage: "https://img.example.com/2/header.jpg", // real store art
        coverImageFallback:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/2/header.jpg",
        href: "https://store.steampowered.com/app/2",
        playtimeMinutes: 9000,
      });
    }
  });

  it("caps the list at MAX_GAMES (12)", async () => {
    fetchOwnedGames.mockResolvedValue({
      response: {
        games: Array.from({ length: 20 }, (_, i) =>
          makeGame({ appid: i + 1, name: `Game ${i}`, rtime_last_played: i }),
        ),
      },
    });

    const result = await getSteamGamesResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.games).toHaveLength(12);
    }
  });

  it("falls back to the guessed header url when the store lookup returns null", async () => {
    fetchOwnedGames.mockResolvedValue({
      response: { games: [makeGame({ appid: 7, name: "No Store Art" })] },
    });
    fetchSteamHeaderImage.mockResolvedValue(null);

    const result = await getSteamGamesResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.games[0]?.coverImage).toBe(
        "https://cdn.cloudflare.steamstatic.com/steam/apps/7/header.jpg",
      );
    }
  });

  it("returns ok:false when the response has no games key", async () => {
    fetchOwnedGames.mockResolvedValue({ response: {} });

    await expect(getSteamGamesResult()).resolves.toEqual({
      ok: false,
      errorMessage: "No recently played games found",
    });
  });

  it("returns ok:false when no games have been played", async () => {
    fetchOwnedGames.mockResolvedValue({
      response: { games: [makeGame({ playtime_forever: 0 })] },
    });

    await expect(getSteamGamesResult()).resolves.toEqual({
      ok: false,
      errorMessage: "No recently played games found",
    });
  });

  it("returns ok:false when the fetch throws", async () => {
    fetchOwnedGames.mockRejectedValue(new Error("network error"));

    await expect(getSteamGamesResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Could not load your Steam games right now",
    });
  });
});
