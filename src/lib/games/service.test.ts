import type { GameProvider } from "./provider.ts";
import type { Game, PlayerProfile } from "./types.ts";

import { getGamesResult } from "./service.ts";

// Empty env → the real registry providers (used by the no-arg default) find
// nothing configured and contribute null/[].
jest.mock("@env", () => ({
  get env() {
    return {};
  },
}));

const profile = (name: string): PlayerProfile => ({
  id: name,
  name,
  avatar: "",
  href: `https://${name}`,
  online: true,
});

const game = (name: string, overrides: Partial<Game> = {}): Game => ({
  id: `id-${name}`,
  name,
  coverImage: "",
  platform: "steam",
  ...overrides,
});

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("getGamesResult", () => {
  it("returns ok:false when no provider supplies a profile", async () => {
    const barren: GameProvider = {
      id: "steam",
      getPlatformLink: () => Promise.resolve(null),
    };

    await expect(getGamesResult([barren])).resolves.toEqual({
      ok: false,
      errorMessage: "Could not load your gaming profile right now",
    });
  });

  it("aggregates profile, links (nulls dropped) and merged games", async () => {
    const primary: GameProvider = {
      id: "steam",
      getProfile: () => Promise.resolve(profile("PARADEMON")),
      getGames: () => Promise.resolve([game("Halo", { lastPlayedUnix: 10 })]),
      getPlatformLink: () =>
        Promise.resolve({
          id: "steam",
          name: "Steam",
          handle: "PARADEMON",
          href: "https://steam",
        }),
    };
    const secondary: GameProvider = {
      id: "xbox",
      getGames: () =>
        Promise.resolve([
          game("Forza", { platform: "xbox", lastPlayedUnix: 20 }),
        ]),
      getPlatformLink: () =>
        Promise.resolve({
          id: "xbox",
          name: "Xbox",
          handle: "PARADEMON1385",
          href: "https://xbox",
        }),
    };
    const linkless: GameProvider = {
      id: "xbox",
      getPlatformLink: () => Promise.resolve(null),
    };

    const result = await getGamesResult([primary, secondary, linkless]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.profile.name).toBe("PARADEMON");
      expect(result.data.platforms.map((p) => p.id)).toEqual(["steam", "xbox"]);
      // Merged, newest-first.
      expect(result.data.games.map((g) => g.name)).toEqual(["Forza", "Halo"]);
    }
  });

  it("is best-effort: a throwing provider is skipped, others survive", async () => {
    const healthy: GameProvider = {
      id: "steam",
      getProfile: () => Promise.resolve(profile("PARADEMON")),
      getGames: () => Promise.resolve([game("Halo")]),
      getPlatformLink: () =>
        Promise.resolve({
          id: "steam",
          name: "Steam",
          handle: "PARADEMON",
          href: "https://steam",
        }),
    };
    const broken: GameProvider = {
      id: "xbox",
      getProfile: () => Promise.reject(new Error("profile down")),
      getGames: () => Promise.reject(new Error("games down")),
      getPlatformLink: () => Promise.reject(new Error("link down")),
    };

    const result = await getGamesResult([healthy, broken]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.profile.name).toBe("PARADEMON");
      expect(result.data.games.map((g) => g.name)).toEqual(["Halo"]);
      expect(result.data.platforms).toHaveLength(1);
    }
    expect(console.error).toHaveBeenCalled();
  });

  it("defaults to the real provider registry", async () => {
    // With no env configured, every real provider contributes nothing.
    await expect(getGamesResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Could not load your gaming profile right now",
    });
  });
});
