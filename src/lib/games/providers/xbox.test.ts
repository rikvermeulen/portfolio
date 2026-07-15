import { xboxProvider } from "./xbox.ts";

jest.mock("@/vendors/xbox/service.ts", () => ({
  getXboxGamesResult: jest.fn(),
  getXboxProfileResult: jest.fn(),
}));

const mockEnv = {
  XBOX_GAMERTAG: undefined as string | undefined,
  XBOX_PROFILE_URL: undefined as string | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

const { getXboxGamesResult, getXboxProfileResult } = jest.requireMock(
  "@/vendors/xbox/service.ts",
) as { getXboxGamesResult: jest.Mock; getXboxProfileResult: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
  mockEnv.XBOX_GAMERTAG = undefined;
  mockEnv.XBOX_PROFILE_URL = undefined;
  getXboxProfileResult.mockResolvedValue({ ok: false, errorMessage: "off" });
  getXboxGamesResult.mockResolvedValue({ ok: false, errorMessage: "off" });
});

describe("xboxProvider.getPlatformLink", () => {
  it("uses live OpenXBL data when available", async () => {
    getXboxProfileResult.mockResolvedValue({
      ok: true,
      data: {
        gamertag: "LiveTag1385",
        displayName: "LiveTag",
        href: "https://account.xbox.com/gt=LiveTag1385",
        avatar: "https://images-eds-ssl.xboxlive.com/gamerpic.png",
      },
    });

    await expect(xboxProvider.getPlatformLink()).resolves.toEqual({
      id: "xbox",
      name: "Xbox",
      handle: "LiveTag",
      href: "https://account.xbox.com/gt=LiveTag1385",
      image: "https://images-eds-ssl.xboxlive.com/gamerpic.png",
    });
  });

  it("prefers the env profile URL when set with a gamertag", async () => {
    mockEnv.XBOX_GAMERTAG = "StaticTag";
    mockEnv.XBOX_PROFILE_URL = "https://account.xbox.com/profile?gt=StaticTag";

    await expect(xboxProvider.getPlatformLink()).resolves.toMatchObject({
      handle: "StaticTag",
      href: "https://account.xbox.com/profile?gt=StaticTag",
    });
  });

  it("derives the URL from the gamertag alone", async () => {
    mockEnv.XBOX_GAMERTAG = "Parademon 117";

    await expect(xboxProvider.getPlatformLink()).resolves.toMatchObject({
      handle: "Parademon 117",
      href: "https://account.xbox.com/profile?gt=Parademon%20117",
    });
  });

  it("uses the profile URL with a generic handle when no gamertag is set", async () => {
    mockEnv.XBOX_PROFILE_URL = "https://account.xbox.com/profile";

    await expect(xboxProvider.getPlatformLink()).resolves.toMatchObject({
      handle: "Xbox",
      href: "https://account.xbox.com/profile",
    });
  });

  it("returns null when nothing is configured", async () => {
    await expect(xboxProvider.getPlatformLink()).resolves.toBeNull();
  });
});

describe("xboxProvider.getGames", () => {
  it("returns [] when the games fetch is not ok", async () => {
    await expect(xboxProvider.getGames?.()).resolves.toEqual([]);
  });

  it("stamps each game with the Xbox profile href", async () => {
    getXboxProfileResult.mockResolvedValue({
      ok: true,
      data: { gamertag: "LiveTag", href: "https://xbox/profile" },
    });
    getXboxGamesResult.mockResolvedValue({
      ok: true,
      data: [{ id: "xbox-1", name: "Halo", coverImage: "", platform: "xbox" }],
    });

    await expect(xboxProvider.getGames?.()).resolves.toEqual([
      {
        id: "xbox-1",
        name: "Halo",
        coverImage: "",
        platform: "xbox",
        href: "https://xbox/profile",
      },
    ]);
  });

  it("leaves href undefined when no Xbox link is available", async () => {
    getXboxGamesResult.mockResolvedValue({
      ok: true,
      data: [{ id: "xbox-1", name: "Halo", coverImage: "", platform: "xbox" }],
    });

    const games = await xboxProvider.getGames?.();
    expect(games?.[0]?.href).toBeUndefined();
  });
});
