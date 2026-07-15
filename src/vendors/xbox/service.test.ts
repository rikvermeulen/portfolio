import { getXboxGamesResult, getXboxProfileResult } from "./service.ts";

jest.mock("./client.ts", () => {
  const actual =
    jest.requireActual<typeof import("./client.ts")>("./client.ts");
  return {
    ...actual,
    fetchXboxAccount: jest.fn(),
    fetchXboxTitleHistory: jest.fn(),
  };
});

const mockEnv = { XBOX_API_KEY: undefined as string | undefined };

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

const { fetchXboxAccount, fetchXboxTitleHistory } = jest.requireMock(
  "./client.ts",
) as {
  fetchXboxAccount: jest.Mock;
  fetchXboxTitleHistory: jest.Mock;
};

const accountResponse = (user: Record<string, unknown>) => ({
  profileUsers: [user],
});

beforeEach(() => {
  jest.clearAllMocks();
  mockEnv.XBOX_API_KEY = "key";
  fetchXboxTitleHistory.mockResolvedValue({ titles: [] });
});

describe("getXboxProfileResult", () => {
  it("returns ok:false when XBOX_API_KEY is missing", async () => {
    mockEnv.XBOX_API_KEY = undefined;

    await expect(getXboxProfileResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Xbox is not configured",
    });
    expect(fetchXboxAccount).not.toHaveBeenCalled();
  });

  it("maps a full profile from the settings array", async () => {
    fetchXboxAccount.mockResolvedValue(
      accountResponse({
        id: "2533274800000000",
        settings: [
          { id: "Gamertag", value: "Parademon117" },
          { id: "ModernGamertag", value: "Parademon" },
          { id: "Gamerscore", value: "18540" },
          {
            id: "GameDisplayPicRaw",
            value: "https://images.xbox.com/parademon.png",
          },
          { id: "AccountTier", value: "Gold" },
        ],
      }),
    );

    const result = await getXboxProfileResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        xuid: "2533274800000000",
        gamertag: "Parademon117",
        displayName: "Parademon",
        gamerscore: 18540,
        avatar: "https://images.xbox.com/parademon.png",
        tier: "Gold",
        href: "https://account.xbox.com/profile?gt=Parademon117",
      });
    }
  });

  it("reads the profile from OpenXBL's `content` envelope", async () => {
    fetchXboxAccount.mockResolvedValue({
      content: {
        profileUsers: [
          {
            id: "2533274963263606",
            settings: [{ id: "Gamertag", value: "PARADEMON1385" }],
          },
        ],
      },
    });

    const result = await getXboxProfileResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toMatchObject({
        xuid: "2533274963263606",
        gamertag: "PARADEMON1385",
        href: "https://account.xbox.com/profile?gt=PARADEMON1385",
      });
    }
  });

  it("defaults gracefully for missing settings (empty array and absent)", async () => {
    fetchXboxAccount
      .mockResolvedValueOnce(accountResponse({ id: "a", settings: [] }))
      .mockResolvedValueOnce(accountResponse({ id: "b" }));

    const emptySettings = await getXboxProfileResult();
    const noSettings = await getXboxProfileResult();

    for (const result of [emptySettings, noSettings]) {
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toMatchObject({
          gamertag: "",
          gamerscore: 0,
          avatar: "",
          tier: undefined,
          href: "https://account.xbox.com/profile?gt=",
        });
      }
    }
  });

  it("returns ok:false (no throw) when no profile is returned", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    fetchXboxAccount.mockResolvedValue({ profileUsers: [] });

    await expect(getXboxProfileResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Xbox profile not found for this key",
    });
  });

  it("returns ok:false when the fetch throws", async () => {
    fetchXboxAccount.mockRejectedValue(new Error("network error"));

    await expect(getXboxProfileResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Could not load your Xbox profile right now",
    });
  });
});

describe("getXboxGamesResult", () => {
  it("returns ok:false when XBOX_API_KEY is missing", async () => {
    mockEnv.XBOX_API_KEY = undefined;

    await expect(getXboxGamesResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Xbox is not configured",
    });
    expect(fetchXboxTitleHistory).not.toHaveBeenCalled();
  });

  it("maps titles (from the content envelope), skipping nameless entries", async () => {
    fetchXboxTitleHistory.mockResolvedValue({
      content: {
        titles: [
          {
            titleId: "1234",
            name: "Halo Infinite",
            // http on purpose — should be upgraded to https for next/image.
            displayImage: "http://store-images.s-microsoft.com/halo.png",
            titleHistory: { lastTimePlayed: "2026-07-01T10:00:00Z" },
          },
          { titleId: "no-name" }, // dropped
          { name: "Forza" }, // no titleId, no timestamp
        ],
      },
    });

    const result = await getXboxGamesResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual([
        {
          id: "xbox-1234",
          name: "Halo Infinite",
          coverImage: "https://store-images.s-microsoft.com/halo.png",
          lastPlayedUnix: Math.floor(Date.parse("2026-07-01T10:00:00Z") / 1000),
          platform: "xbox",
        },
        {
          id: "xbox-Forza",
          name: "Forza",
          coverImage: "",
          lastPlayedUnix: undefined,
          platform: "xbox",
        },
      ]);
    }
  });

  it("reads titles when `content` is the array itself", async () => {
    fetchXboxTitleHistory.mockResolvedValue({
      code: 200,
      content: [
        {
          titleId: "9",
          name: "Sea of Thieves",
          displayImage: "http://store-images.s-microsoft.com/sot.png",
        },
      ],
    });

    const result = await getXboxGamesResult();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual([
        {
          id: "xbox-9",
          name: "Sea of Thieves",
          coverImage: "https://store-images.s-microsoft.com/sot.png",
          lastPlayedUnix: undefined,
          platform: "xbox",
        },
      ]);
    }
  });

  it("reads a numeric-keyed `content` object, keeping only title-shaped values", async () => {
    fetchXboxTitleHistory.mockResolvedValue({
      content: {
        0: { titleId: "1", name: "Halo" },
        1: "not-a-title", // string → skipped
        2: null, // null → skipped
        3: { titleId: "2" }, // no name → skipped
      },
    });

    const result = await getXboxGamesResult();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map((g) => g.name)).toEqual(["Halo"]);
    }
  });

  it("treats a string `content` error body as no games", async () => {
    fetchXboxTitleHistory.mockResolvedValue({
      content: '["Request contains ... invalid locale value: *"]',
      code: 400,
    });

    const result = await getXboxGamesResult();
    expect(result.ok && result.data).toEqual([]);
  });

  it("reads top-level titles and tolerates a missing titles key", async () => {
    fetchXboxTitleHistory
      .mockResolvedValueOnce({ titles: [{ name: "Sea of Thieves" }] })
      .mockResolvedValueOnce({});

    const topLevel = await getXboxGamesResult();
    const missing = await getXboxGamesResult();

    expect(topLevel.ok && topLevel.data.map((g) => g.name)).toEqual([
      "Sea of Thieves",
    ]);
    expect(missing.ok && missing.data).toEqual([]);
  });

  it("returns ok:false when the fetch throws", async () => {
    fetchXboxTitleHistory.mockRejectedValue(new Error("network error"));

    await expect(getXboxGamesResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Could not load your Xbox games right now",
    });
  });
});
