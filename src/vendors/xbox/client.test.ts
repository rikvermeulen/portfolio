import {
  fetchXboxAccount,
  fetchXboxTitleHistory,
  XboxError,
} from "./client.ts";

const createJsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });

beforeEach(() => {
  jest.restoreAllMocks();
});

describe("fetchXboxAccount", () => {
  it("calls the OpenXBL account endpoint with the X-Authorization header", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      createJsonResponse({
        profileUsers: [{ id: "2533274", settings: [] }],
      }),
    );

    const result = await fetchXboxAccount("test-key");

    const [calledUrl, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(calledUrl)).toBe("https://xbl.io/api/v2/account");
    expect((init?.headers as Record<string, string>)["X-Authorization"]).toBe(
      "test-key",
    );
    expect(result.profileUsers).toHaveLength(1);
  });

  it("throws an XboxError when the endpoint returns non-ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ error: "unauthorized" }, 401));

    await expect(fetchXboxAccount("k")).rejects.toThrow(XboxError);
    await expect(fetchXboxAccount("k")).rejects.toThrow(
      "Xbox account fetch failed: 401",
    );
  });
});

describe("fetchXboxTitleHistory", () => {
  it("calls the title-history endpoint with the X-Authorization header", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(createJsonResponse({ titles: [] }));

    await fetchXboxTitleHistory("test-key");

    const [calledUrl, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(calledUrl)).toBe("https://xbl.io/api/v2/player/titleHistory");
    expect((init?.headers as Record<string, string>)["X-Authorization"]).toBe(
      "test-key",
    );
  });

  it("throws an XboxError when the endpoint returns non-ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ error: "rate limited" }, 429));

    await expect(fetchXboxTitleHistory("k")).rejects.toThrow(
      "Xbox title-history fetch failed: 429",
    );
  });
});
