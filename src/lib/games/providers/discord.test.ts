import { discordProvider } from "./discord.ts";

const mockEnv = {
  DISCORD_USERNAME: undefined as string | undefined,
  DISCORD_PROFILE_URL: undefined as string | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

beforeEach(() => {
  mockEnv.DISCORD_USERNAME = undefined;
  mockEnv.DISCORD_PROFILE_URL = undefined;
});

describe("discordProvider", () => {
  it("returns null when no profile URL is configured", async () => {
    await expect(discordProvider.getPlatformLink()).resolves.toBeNull();
  });

  it("builds a link with the configured username", async () => {
    mockEnv.DISCORD_PROFILE_URL = "https://discord.com/users/123";
    mockEnv.DISCORD_USERNAME = "parademon";

    await expect(discordProvider.getPlatformLink()).resolves.toEqual({
      id: "discord",
      name: "Discord",
      handle: "parademon",
      href: "https://discord.com/users/123",
    });
  });

  it("falls back to the platform name when no username is set", async () => {
    mockEnv.DISCORD_PROFILE_URL = "https://discord.com/users/123";

    await expect(discordProvider.getPlatformLink()).resolves.toMatchObject({
      handle: "Discord",
    });
  });
});
