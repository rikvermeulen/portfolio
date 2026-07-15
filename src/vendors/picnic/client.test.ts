import {
  createPicnicClientFromEnv,
  ensurePicnicAuth,
  PicnicError,
} from "./client.ts";

const mockLogin = jest.fn();

jest.mock("picnic-api", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    auth: { login: mockLogin },
  })),
}));

const mockEnv = {
  PICNIC_COUNTRY_CODE: undefined as "NL" | "DE" | undefined,
  PICNIC_AUTH_KEY: undefined as string | undefined,
  PICNIC_EMAIL: undefined as string | undefined,
  PICNIC_PASSWORD: undefined as string | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

describe("createPicnicClientFromEnv", () => {
  beforeEach(() => {
    mockEnv.PICNIC_COUNTRY_CODE = undefined;
    mockEnv.PICNIC_AUTH_KEY = "existing-key";
  });

  it("creates a client with NL country code by default", () => {
    const PicnicClient = jest.requireMock("picnic-api").default as jest.Mock;
    PicnicClient.mockClear();

    createPicnicClientFromEnv();

    expect(PicnicClient).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: "NL" }),
    );
  });

  it("creates a client with DE country code when configured", () => {
    mockEnv.PICNIC_COUNTRY_CODE = "DE";
    const PicnicClient = jest.requireMock("picnic-api").default as jest.Mock;
    PicnicClient.mockClear();

    createPicnicClientFromEnv();

    expect(PicnicClient).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: "DE" }),
    );
  });
});

describe("ensurePicnicAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnv.PICNIC_AUTH_KEY = undefined;
    mockEnv.PICNIC_EMAIL = undefined;
    mockEnv.PICNIC_PASSWORD = undefined;
  });

  it("returns the existing auth key without logging in when forceLogin is false", async () => {
    mockEnv.PICNIC_AUTH_KEY = "stored-key";
    const client = createPicnicClientFromEnv();

    const key = await ensurePicnicAuth(client);

    expect(key).toBe("stored-key");
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("logs in when forceLogin is true even if PICNIC_AUTH_KEY is set", async () => {
    mockEnv.PICNIC_AUTH_KEY = "stored-key";
    mockEnv.PICNIC_EMAIL = "user@example.com";
    mockEnv.PICNIC_PASSWORD = "password";
    mockLogin.mockResolvedValue({
      authKey: "fresh-key",
      second_factor_authentication_required: false,
    });

    const client = createPicnicClientFromEnv();
    const key = await ensurePicnicAuth(client, { forceLogin: true });

    expect(mockLogin).toHaveBeenCalledWith("user@example.com", "password");
    expect(key).toBe("fresh-key");
  });

  it("throws PicnicError when credentials are missing and no auth key is set", async () => {
    const client = createPicnicClientFromEnv();

    await expect(
      ensurePicnicAuth(client, { forceLogin: true }),
    ).rejects.toBeInstanceOf(PicnicError);
  });

  it("throws PicnicError when 2FA is required", async () => {
    mockEnv.PICNIC_EMAIL = "user@example.com";
    mockEnv.PICNIC_PASSWORD = "password";
    mockLogin.mockResolvedValue({
      authKey: null,
      second_factor_authentication_required: true,
    });

    const client = createPicnicClientFromEnv();

    await expect(
      ensurePicnicAuth(client, { forceLogin: true }),
    ).rejects.toThrow("Picnic 2FA is required");
  });

  it("returns null when login succeeds but returns no authKey", async () => {
    mockEnv.PICNIC_EMAIL = "user@example.com";
    mockEnv.PICNIC_PASSWORD = "password";
    mockLogin.mockResolvedValue({
      authKey: null,
      second_factor_authentication_required: false,
    });

    const client = createPicnicClientFromEnv();
    const key = await ensurePicnicAuth(client, { forceLogin: true });

    expect(key).toBeNull();
  });
});
