import {
  getPlantaTokens,
  resetPlantaTokens,
  setPlantaTokens,
} from "./tokenStore.ts";

const mockEnv = {
  PLANTA_ACCESS_TOKEN: undefined as string | undefined,
  PLANTA_REFRESH_TOKEN: undefined as string | undefined,
  PLANTA_TOKEN_TYPE: "Bearer" as string | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

describe("Planta token store", () => {
  beforeEach(() => {
    resetPlantaTokens();
    mockEnv.PLANTA_ACCESS_TOKEN = undefined;
    mockEnv.PLANTA_REFRESH_TOKEN = undefined;
    mockEnv.PLANTA_TOKEN_TYPE = "Bearer";
  });

  it("returns null when no tokens are configured in env", () => {
    expect(getPlantaTokens()).toBeNull();
  });

  it("seeds from env on first read", () => {
    mockEnv.PLANTA_ACCESS_TOKEN = "access-1";
    mockEnv.PLANTA_REFRESH_TOKEN = "refresh-1";

    expect(getPlantaTokens()).toEqual({
      accessToken: "access-1",
      refreshToken: "refresh-1",
      tokenType: "Bearer",
    });
  });

  it("seeds from a refresh token alone with an empty access token", () => {
    mockEnv.PLANTA_REFRESH_TOKEN = "refresh-only";
    mockEnv.PLANTA_TOKEN_TYPE = undefined;

    expect(getPlantaTokens()).toEqual({
      accessToken: "",
      refreshToken: "refresh-only",
      tokenType: "Bearer",
    });
  });

  it("only seeds from env once, ignoring later env changes", () => {
    mockEnv.PLANTA_ACCESS_TOKEN = "access-1";
    getPlantaTokens();

    mockEnv.PLANTA_ACCESS_TOKEN = "access-2";

    expect(getPlantaTokens()?.accessToken).toBe("access-1");
  });

  it("returns tokens written via setPlantaTokens over env", () => {
    mockEnv.PLANTA_ACCESS_TOKEN = "env-access";

    setPlantaTokens({ accessToken: "stored-access", tokenType: "Bearer" });

    expect(getPlantaTokens()).toEqual({
      accessToken: "stored-access",
      tokenType: "Bearer",
    });
  });

  it("re-seeds from env after reset", () => {
    setPlantaTokens({ accessToken: "stored-access" });
    resetPlantaTokens();
    mockEnv.PLANTA_ACCESS_TOKEN = "post-reset-access";

    expect(getPlantaTokens()?.accessToken).toBe("post-reset-access");
  });
});
