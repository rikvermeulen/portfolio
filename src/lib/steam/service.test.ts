import { getSteamProfileResult } from "./service.ts";

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
  XBOX_GAMERTAG: undefined as string | undefined,
  XBOX_PROFILE_URL: undefined as string | undefined,
  DISCORD_USERNAME: undefined as string | undefined,
  DISCORD_PROFILE_URL: undefined as string | undefined,
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
  mockEnv.XBOX_GAMERTAG = undefined;
  mockEnv.XBOX_PROFILE_URL = undefined;
  mockEnv.DISCORD_USERNAME = undefined;
  mockEnv.DISCORD_PROFILE_URL = undefined;
  fetchPlayerSummaries.mockResolvedValue(ownerResponse());
  fetchOwnedGames.mockResolvedValue({ response: { games: [makeGame()] } });
  fetchSteamHeaderImage.mockResolvedValue(null);
});

describe("getSteamProfileResult", () => {
  it("returns ok:false when STEAM_API_KEY is missing", async () => {
    mockEnv.STEAM_API_KEY = undefined;
    await expect(getSteamProfileResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Steam is not configured",
    });
    expect(fetchPlayerSummaries).not.toHaveBeenCalled();
  });

  it("returns ok:false when STEAM_ID is missing", async () => {
    mockEnv.STEAM_ID = undefined;
    await expect(getSteamProfileResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Steam is not configured",
    });
    expect(fetchOwnedGames).not.toHaveBeenCalled();
  });

  it("maps the profile and returns Steam as the only platform by default", async () => {
    const result = await getSteamProfileResult();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.profile).toEqual({
        id: "steam-id",
        name: "PARADEMON",
        avatar: "https://avatars.steamstatic.com/owner_full.jpg",
        href: "https://steamcommunity.com/id/parademon",
      });
      expect(result.data.platforms).toEqual([
        {
          id: "steam",
          name: "Steam",
          handle: "PARADEMON",
          href: "https://steamcommunity.com/id/parademon",
        },
      ]);
    }
  });

  it("adds Xbox and Discord platforms when configured", async () => {
    mockEnv.XBOX_GAMERTAG = "Parademon117";
    mockEnv.XBOX_PROFILE_URL =
      "https://account.xbox.com/profile?gt=Parademon117";
    mockEnv.DISCORD_USERNAME = "parademon";
    mockEnv.DISCORD_PROFILE_URL = "https://discord.com/users/123";

    const result = await getSteamProfileResult();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.platforms.map((p) => p.id)).toEqual([
        "steam",
        "xbox",
        "discord",
      ]);
      expect(result.data.platforms[1]).toMatchObject({
        handle: "Parademon117",
      });
      expect(result.data.platforms[2]).toMatchObject({ handle: "parademon" });
    }
  });

  it("falls back to platform names when a handle is not set", async () => {
    mockEnv.XBOX_PROFILE_URL = "https://account.xbox.com/profile";
    mockEnv.DISCORD_PROFILE_URL = "https://discord.com/users/123";

    const result = await getSteamProfileResult();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.platforms[1]?.handle).toBe("Xbox");
      expect(result.data.platforms[2]?.handle).toBe("Discord");
    }
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

    const result = await getSteamProfileResult();
    expect(result.ok).toBe(true);
    if (result.ok) {
      const names = result.data.games.map((g) => g.name);
      expect(names).toHaveLength(4);
      expect(names[0]).toBe("Newest");
      expect(names[1]).toBe("Older");
      expect(names.slice(2).sort()).toEqual(["NoTsA", "NoTsB"]);
      expect(result.data.games[0]).toMatchObject({
        id: "steam-2",
        coverImage: "https://img.example.com/2/header.jpg",
        coverImageFallback:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/2/header.jpg",
        portraitImage:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/2/library_600x900_2x.jpg",
        href: "https://store.steampowered.com/app/2",
        playtimeMinutes: 9000,
      });
    }
  });

  it("caps the games list at 12 and falls back to the guessed header url", async () => {
    fetchOwnedGames.mockResolvedValue({
      response: {
        games: Array.from({ length: 20 }, (_, i) =>
          makeGame({ appid: i + 1, name: `Game ${i}`, rtime_last_played: i }),
        ),
      },
    });
    fetchSteamHeaderImage.mockResolvedValue(null);

    const result = await getSteamProfileResult();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.games).toHaveLength(12);
      // Sorted by last-played desc → appid 20 (highest) leads; no store art → guessed url.
      expect(result.data.games[0]?.coverImage).toBe(
        "https://cdn.cloudflare.steamstatic.com/steam/apps/20/header.jpg",
      );
    }
  });

  it("tolerates an empty library", async () => {
    fetchOwnedGames.mockResolvedValue({ response: {} });
    const result = await getSteamProfileResult();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.games).toEqual([]);
    }
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

    const medium = await getSteamProfileResult();
    const small = await getSteamProfileResult();
    const none = await getSteamProfileResult();

    expect(medium.ok && medium.data.profile.avatar).toBe(
      "https://avatars.steamstatic.com/owner_medium.jpg",
    );
    expect(small.ok && small.data.profile.avatar).toBe(
      "https://avatars.steamstatic.com/owner_small.jpg",
    );
    expect(none.ok && none.data.profile.avatar).toBe("");
  });

  it("returns ok:false when the owner summary is missing", async () => {
    fetchPlayerSummaries.mockResolvedValue({ response: { players: [] } });
    await expect(getSteamProfileResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Could not load your Steam profile right now",
    });
  });

  it("returns ok:false when a fetch throws", async () => {
    fetchPlayerSummaries.mockRejectedValue(new Error("network error"));
    await expect(getSteamProfileResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Could not load your Steam profile right now",
    });
  });
});
