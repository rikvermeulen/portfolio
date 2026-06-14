import {
  createPlantaClientFromEnv,
  PlantaUnauthorizedError,
} from "./client.ts";

const mockEnv = {
  PLANTA_AUTH_CODE: undefined as string | undefined,
  PLANTA_ACCESS_TOKEN: undefined as string | undefined,
  PLANTA_REFRESH_TOKEN: undefined as string | undefined,
  PLANTA_TOKEN_TYPE: "Bearer",
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

const createUnsignedJwt = (payload: Record<string, unknown>): string => {
  const encode = (value: string) =>
    Buffer.from(value, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  const header = encode(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = encode(JSON.stringify(payload));
  return `${header}.${body}.`;
};

describe("Planta client", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockEnv.PLANTA_AUTH_CODE = undefined;
    mockEnv.PLANTA_ACCESS_TOKEN = undefined;
    mockEnv.PLANTA_REFRESH_TOKEN = undefined;
    mockEnv.PLANTA_TOKEN_TYPE = "Bearer";
    jest.spyOn(globalThis, "setTimeout").mockImplementation((callback) => {
      if (typeof callback === "function") {
        callback();
      }
      return 0 as unknown as ReturnType<typeof setTimeout>;
    });
  });

  it("fails fast when refresh token endpoint returns unauthorized", async () => {
    const expiredToken = createUnsignedJwt({ exp: 1 });

    mockEnv.PLANTA_ACCESS_TOKEN = expiredToken;
    mockEnv.PLANTA_REFRESH_TOKEN = "invalid-refresh-token";

    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 401,
          errorType: "unauthorized",
          message: "You are not authorized to make this request",
        }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const client = createPlantaClientFromEnv();

    await expect(client.getPlants({ fetchAll: false })).rejects.toBeInstanceOf(
      PlantaUnauthorizedError,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://public.planta-api.com/v1/auth/refreshToken",
    );
  });

  it("falls back to auth code when refresh token is unauthorized", async () => {
    const expiredToken = createUnsignedJwt({ exp: 1 });

    mockEnv.PLANTA_ACCESS_TOKEN = expiredToken;
    mockEnv.PLANTA_REFRESH_TOKEN = "invalid-refresh-token";
    mockEnv.PLANTA_AUTH_CODE = "valid-auth-code";

    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 401,
            errorType: "unauthorized",
            message: "You are not authorized to make this request",
          }),
          {
            status: 401,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              accessToken: createUnsignedJwt({
                exp: Math.floor(Date.now() / 1000) + 3600,
              }),
              refreshToken: "fresh-refresh-token",
              tokenType: "Bearer",
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ id: "plant-1" }],
            pagination: {},
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: false });

    expect(result.plants[0]?.id).toBe("plant-1");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://public.planta-api.com/v1/auth/refreshToken",
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "https://public.planta-api.com/v1/auth/authorize",
    );
    expect(fetchMock.mock.calls[2]?.[0]).toBe(
      "https://public.planta-api.com/v1/addedPlants",
    );
  });

  it("retries on rate limits and succeeds when the API recovers", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 429,
            errorType: "rate_limit",
            message: "Too many requests",
          }),
          {
            status: 429,
            headers: {
              "content-type": "application/json",
              "retry-after": "0",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ id: "plant-1" }],
            pagination: {},
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: false });

    expect(result.plants).toHaveLength(1);
    expect(result.plants[0]?.id).toBe("plant-1");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
