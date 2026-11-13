import { loadPlantaTokens, savePlantaTokens } from "./tokenStore.ts";

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

const mockMaybeSingle = jest.fn();
const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockUpsert = jest.fn();
const mockFrom = jest.fn(() => ({ select: mockSelect, upsert: mockUpsert }));

jest.mock("../supabase/admin.ts", () => ({
  createSupabaseAdminClient: () => ({ from: mockFrom }),
}));

describe("Planta token store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockEnv.PLANTA_ACCESS_TOKEN = undefined;
    mockEnv.PLANTA_REFRESH_TOKEN = undefined;
    mockEnv.PLANTA_TOKEN_TYPE = "Bearer";
  });

  it("reads the single token row", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        access_token: "stored-access",
        refresh_token: "stored-refresh",
        token_type: "Bearer",
      },
      error: null,
    });
    mockEnv.PLANTA_REFRESH_TOKEN = "stale-env-refresh";

    await expect(loadPlantaTokens()).resolves.toEqual({
      accessToken: "stored-access",
      refreshToken: "stored-refresh",
      tokenType: "Bearer",
    });
    expect(mockFrom).toHaveBeenCalledWith("planta_tokens");
    expect(mockEq).toHaveBeenCalledWith("id", 1);
  });

  it("maps a stored null refresh token to undefined", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { access_token: "a", refresh_token: null, token_type: "Bearer" },
      error: null,
    });

    await expect(loadPlantaTokens()).resolves.toEqual({
      accessToken: "a",
      refreshToken: undefined,
      tokenType: "Bearer",
    });
  });

  it("seeds from env when no row is stored yet", async () => {
    mockEnv.PLANTA_ACCESS_TOKEN = "env-access";
    mockEnv.PLANTA_REFRESH_TOKEN = "env-refresh";

    await expect(loadPlantaTokens()).resolves.toEqual({
      accessToken: "env-access",
      refreshToken: "env-refresh",
      tokenType: "Bearer",
    });
  });

  it("seeds from a refresh token alone with an empty access token", async () => {
    mockEnv.PLANTA_REFRESH_TOKEN = "refresh-only";
    mockEnv.PLANTA_TOKEN_TYPE = undefined;

    await expect(loadPlantaTokens()).resolves.toEqual({
      accessToken: "",
      refreshToken: "refresh-only",
      tokenType: "Bearer",
    });
  });

  it("returns null with no row and no env tokens", async () => {
    await expect(loadPlantaTokens()).resolves.toBeNull();
  });

  it("throws when the row can't be read", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: "relation does not exist" },
    });

    await expect(loadPlantaTokens()).rejects.toThrow(
      "Planta token load failed: relation does not exist",
    );
  });

  it("rejects a malformed row", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { access_token: 42 },
      error: null,
    });

    await expect(loadPlantaTokens()).rejects.toThrow();
  });

  it("upserts the rotated token pair into the single row", async () => {
    await savePlantaTokens({ accessToken: "new-access", refreshToken: "new" });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        access_token: "new-access",
        refresh_token: "new",
        token_type: "Bearer",
      }),
    );
  });

  it("stores a missing refresh token as null and keeps the token type", async () => {
    await savePlantaTokens({ accessToken: "a", tokenType: "JWT" });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ refresh_token: null, token_type: "JWT" }),
    );
  });

  it("throws when the rotated pair can't be saved", async () => {
    mockUpsert.mockResolvedValue({ error: { message: "permission denied" } });

    await expect(savePlantaTokens({ accessToken: "a" })).rejects.toThrow(
      "Rotated Planta token could not be saved (permission denied)",
    );
  });
});
