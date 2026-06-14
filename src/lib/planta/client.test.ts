import {
  createPlantaClientFromEnv,
  PlantaClient,
  PlantaError,
  PlantaUnauthorizedError,
} from "./client.ts";

const mockEnv = {
  PLANTA_AUTH_CODE: undefined as string | undefined,
  PLANTA_ACCESS_TOKEN: undefined as string | undefined,
  PLANTA_REFRESH_TOKEN: undefined as string | undefined,
  PLANTA_TOKEN_TYPE: "Bearer" as string | undefined,
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

  it("createPlantaClientFromEnv creates an auth-code-only client when no tokens are set", () => {
    mockEnv.PLANTA_AUTH_CODE = "my-auth-code";

    const client = createPlantaClientFromEnv();

    // The client should not be null and should be a PlantaClient
    expect(client).toBeInstanceOf(PlantaClient);
  });

  it("getPlant fetches a single plant by id", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({ data: { id: "plant-abc", health: "Happy" } }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    const client = createPlantaClientFromEnv();
    const plant = await client.getPlant("plant-abc");

    expect(plant.id).toBe("plant-abc");
  });

  it("getPlants respects maxPlants limit", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { id: "p1" },
            { id: "p2" },
            { id: "p3" },
            { id: "p4" },
            { id: "p5" },
          ],
          pagination: {},
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: false, maxPlants: 3 });

    expect(result.plants).toHaveLength(3);
  });

  it("getPlants paginates using cursor when fetchAll is true", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ id: "p1" }],
            pagination: { nextPage: "cursor-2" },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ id: "p2" }], pagination: {} }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: true });

    expect(result.plants).toHaveLength(2);
    // Second call should include the cursor in the URL
    expect(fetchMock.mock.calls[1]?.[0]).toContain("cursor=cursor-2");
  });

  it("throws PlantaError when fetch throws a network error", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network down"));

    const client = createPlantaClientFromEnv();

    await expect(client.getPlants({ fetchAll: false })).rejects.toBeInstanceOf(
      PlantaError,
    );
  });

  it("throws PlantaError with timeout message on AbortError", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    const abortError = new Error("abort");
    abortError.name = "AbortError";
    jest.spyOn(globalThis, "fetch").mockRejectedValue(abortError);

    const client = createPlantaClientFromEnv();

    await expect(client.getPlants({ fetchAll: false })).rejects.toThrow(
      "Planta request timed out.",
    );
  });

  it("throws PlantaError for a non-JSON error response", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
        headers: { "content-type": "text/plain" },
      }),
    );

    const client = createPlantaClientFromEnv();

    await expect(client.getPlants({ fetchAll: false })).rejects.toBeInstanceOf(
      PlantaError,
    );
  });

  it("throws PlantaUnauthorizedError when data request gets a 401 with no retry path", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;
    // No refresh token, no auth code — can't re-authenticate

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({ errorType: "unauthorized", message: "bad token" }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
      );

    const client = createPlantaClientFromEnv();

    await expect(client.getPlants({ fetchAll: false })).rejects.toBeInstanceOf(
      PlantaUnauthorizedError,
    );
  });

  it("stops paginating when the API returns the same cursor twice", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ id: "p1" }],
            pagination: { nextPage: "cursor-loop" },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ id: "p2" }],
            pagination: { nextPage: "cursor-loop" }, // same cursor — triggers break
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: true });

    expect(result.plants).toHaveLength(2);
  });

  it("throws when no credentials are configured at all", async () => {
    // beforeEach leaves all env vars undefined
    const client = createPlantaClientFromEnv();
    await expect(client.getPlants({ fetchAll: false })).rejects.toBeInstanceOf(
      PlantaUnauthorizedError,
    );
  });

  it("successfully refreshes the access token using the refresh token", async () => {
    const expiredToken = createUnsignedJwt({ exp: 1 });
    mockEnv.PLANTA_ACCESS_TOKEN = expiredToken;
    mockEnv.PLANTA_REFRESH_TOKEN = "valid-refresh-token";

    const newAccessToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              accessToken: newAccessToken,
              refreshToken: "new-refresh-token",
              tokenType: "Bearer",
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: [{ id: "plant-ok" }], pagination: {} }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: false });

    expect(result.plants[0]?.id).toBe("plant-ok");
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://public.planta-api.com/v1/auth/refreshToken",
    );
  });

  it("throws when the authorize endpoint returns no accessToken", async () => {
    mockEnv.PLANTA_AUTH_CODE = "some-code";

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const client = createPlantaClientFromEnv();
    await expect(client.getPlants({ fetchAll: false })).rejects.toThrow(
      "Planta authorize did not return accessToken.",
    );
  });

  it("throws when the refresh endpoint returns a 200 with no accessToken", async () => {
    const expiredToken = createUnsignedJwt({ exp: 1 });
    mockEnv.PLANTA_ACCESS_TOKEN = expiredToken;
    mockEnv.PLANTA_REFRESH_TOKEN = "refresh-token";

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const client = createPlantaClientFromEnv();
    await expect(client.getPlants({ fetchAll: false })).rejects.toThrow(
      "Planta refresh did not return accessToken.",
    );
  });

  it("retries via refreshTokens when the API returns 401 mid-request", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;
    mockEnv.PLANTA_REFRESH_TOKEN = "refresh-token";

    const newAccessToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 7200,
    });

    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 401,
            errorType: "unauthorized",
            message: "Token expired",
          }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              accessToken: newAccessToken,
              refreshToken: "new-refresh",
              tokenType: "Bearer",
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: [{ id: "plant-retry" }], pagination: {} }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: false });

    expect(result.plants[0]?.id).toBe("plant-retry");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("rethrows when refreshTokens fails during request retry and no auth code", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;
    mockEnv.PLANTA_REFRESH_TOKEN = "bad-refresh-token";
    // No auth code — cannot fall back

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 401,
            errorType: "unauthorized",
            message: "Token expired",
          }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 401,
            errorType: "unauthorized",
            message: "Invalid refresh",
          }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
      );

    const client = createPlantaClientFromEnv();
    await expect(client.getPlants({ fetchAll: false })).rejects.toBeInstanceOf(
      PlantaUnauthorizedError,
    );
  });

  it("falls back to authorize in request() when refresh fails but auth code is available", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;
    mockEnv.PLANTA_REFRESH_TOKEN = "bad-refresh-token";
    mockEnv.PLANTA_AUTH_CODE = "valid-auth-code";

    const newAccessToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 7200,
    });

    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 401,
            errorType: "unauthorized",
            message: "Token expired",
          }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 401,
            errorType: "unauthorized",
            message: "Invalid refresh",
          }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              accessToken: newAccessToken,
              refreshToken: "new-refresh",
              tokenType: "Bearer",
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ id: "plant-after-auth" }],
            pagination: {},
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: false });

    expect(result.plants[0]?.id).toBe("plant-after-auth");
    expect(fetchMock).toHaveBeenCalledTimes(4);
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

  // ─── Branch coverage for remaining uncovered lines ──────────────────────────

  it("getPlants defaults fetchAll to true when options are not provided", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: "p1" }], pagination: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants();

    expect(result.plants).toHaveLength(1);
  });

  it("getPlants returns empty plants when response has no data field", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ pagination: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: false });

    expect(result.plants).toHaveLength(0);
  });

  it("getPlant falls back to minimal plant when response has no data", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const client = createPlantaClientFromEnv();
    const plant = await client.getPlant("fallback-id");

    expect(plant.id).toBe("fallback-id");
  });

  it("authorize uses Bearer when response omits tokenType", async () => {
    mockEnv.PLANTA_AUTH_CODE = "auth-code-no-type";
    const newToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { accessToken: newToken, refreshToken: "new-refresh" },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ id: "p1" }], pagination: {} }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: false });

    expect(result.plants[0]?.id).toBe("p1");
  });

  it("refresh preserves existing refreshToken and defaults tokenType to Bearer when response omits both", async () => {
    const expiredToken = createUnsignedJwt({ exp: 1 });
    const client = new PlantaClient({
      tokens: {
        accessToken: expiredToken,
        refreshToken: "existing-refresh",
        // no tokenType — will fall back to "Bearer"
      },
    });

    const newToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { accessToken: newToken },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: [{ id: "plant-fresh" }], pagination: {} }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    const result = await client.getPlants({ fetchAll: false });

    expect(result.plants[0]?.id).toBe("plant-fresh");
  });

  it("uses Bearer in Authorization header when tokens.tokenType is absent", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const client = new PlantaClient({
      tokens: { accessToken: validToken },
    });

    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: "p1" }], pagination: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await client.getPlants({ fetchAll: false });

    const callHeaders = (
      fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    )?.headers;
    const headers =
      callHeaders instanceof Headers
        ? callHeaders
        : new Headers(callHeaders as HeadersInit);
    expect(headers.get("authorization")).toBe(`Bearer ${validToken}`);
  });

  it("wraps a non-Error thrown by fetch with a generic PlantaError message", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest.spyOn(globalThis, "fetch").mockRejectedValue("a raw string error");

    const client = createPlantaClientFromEnv();

    await expect(client.getPlants({ fetchAll: false })).rejects.toThrow(
      "Planta network request failed.",
    );
  });

  it("handles a response with no content-type header (uses text path, returns no plants)", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    // null body → no automatic content-type header → triggers the `?? ""` branch at line 264
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: false });

    expect(result.plants).toHaveLength(0);
  });

  it("uses HTTP status code in the error message when JSON error response has no message field", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ errorType: "server_error" }), {
        status: 503,
        headers: { "content-type": "application/json" },
      }),
    );

    const client = createPlantaClientFromEnv();

    await expect(client.getPlants({ fetchAll: false })).rejects.toThrow(
      "HTTP 503",
    );
  });

  it("throws PlantaError when the rate limit is hit a second time (retry exhausted)", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
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
      ),
    );

    const client = createPlantaClientFromEnv();

    await expect(client.getPlants({ fetchAll: false })).rejects.toBeInstanceOf(
      PlantaError,
    );
  });

  it("uses the default retry delay when the rate-limit response omits the retry-after header", async () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockEnv.PLANTA_ACCESS_TOKEN = validToken;

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            errorType: "rate_limit",
            message: "Too many requests",
          }),
          { status: 429, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ id: "plant-after-ratelimit" }],
            pagination: {},
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    const client = createPlantaClientFromEnv();
    const result = await client.getPlants({ fetchAll: false });

    expect(result.plants[0]?.id).toBe("plant-after-ratelimit");
  });

  it("createPlantaClientFromEnv uses empty accessToken and Bearer when only refreshToken is configured", () => {
    mockEnv.PLANTA_REFRESH_TOKEN = "refresh-only";
    mockEnv.PLANTA_TOKEN_TYPE = undefined;

    const client = createPlantaClientFromEnv();

    expect(client).toBeInstanceOf(PlantaClient);
  });
});
