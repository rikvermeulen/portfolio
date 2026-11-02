// Module-level token variables must be reset between tests.
let fetchRecentlyPlayed: typeof import("./client.ts").fetchRecentlyPlayed;
let fetchShowEpisodes: typeof import("./client.ts").fetchShowEpisodes;
let getPlaybackToken: typeof import("./client.ts").getPlaybackToken;

const createJsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });

const makeTokenResponse = () =>
  createJsonResponse({ access_token: "test-access-token", expires_in: 3600 });

const makeRecentlyPlayedResponse = () =>
  createJsonResponse({
    items: [
      {
        track: {
          id: "t1",
          name: "Song",
          explicit: false,
          artists: [{ name: "Artist" }],
          album: { name: "Album", images: [] },
        },
        played_at: "2026-01-01T00:00:00Z",
      },
    ],
  });

const makeEpisodesResponse = () =>
  createJsonResponse({
    items: [
      {
        id: "ep-1",
        name: "Episode 1",
        images: [],
        explicit: false,
      },
    ],
  });

beforeEach(async () => {
  jest.resetModules();
  jest.restoreAllMocks();

  const client = await import("./client.ts");
  fetchRecentlyPlayed = client.fetchRecentlyPlayed;
  fetchShowEpisodes = client.fetchShowEpisodes;
  getPlaybackToken = client.getPlaybackToken;
});

describe("fetchRecentlyPlayed", () => {
  it("exchanges the refresh token then fetches recently played", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(makeRecentlyPlayedResponse());

    const result = await fetchRecentlyPlayed("cid", "csecret", "rtoken");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("accounts.spotify.com");
    expect(fetchMock.mock.calls[1]?.[0]).toContain("recently-played");
    expect(result.items).toHaveLength(1);
  });

  it("passes the limit query param", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(makeRecentlyPlayedResponse());

    await fetchRecentlyPlayed("cid", "csecret", "rtoken", 10);

    expect(fetchMock.mock.calls[1]?.[0]).toContain("limit=10");
  });

  it("throws when the token refresh returns non-ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ error: "bad" }, 401));

    await expect(
      fetchRecentlyPlayed("cid", "csecret", "rtoken"),
    ).rejects.toThrow("Spotify token refresh failed: 401");
  });

  it("throws when the recently-played endpoint returns non-ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(createJsonResponse({ error: "forbidden" }, 403));

    await expect(
      fetchRecentlyPlayed("cid", "csecret", "rtoken"),
    ).rejects.toThrow("Spotify recently-played fetch failed: 403");
  });

  it("reuses the cached access token on a second call", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(makeRecentlyPlayedResponse())
      .mockResolvedValueOnce(makeRecentlyPlayedResponse());

    await fetchRecentlyPlayed("cid", "csecret", "rtoken");
    await fetchRecentlyPlayed("cid", "csecret", "rtoken");

    // Token endpoint called only once; recently-played called twice.
    const tokenCalls = fetchMock.mock.calls.filter((c) =>
      String(c[0]).includes("accounts.spotify.com"),
    );
    expect(tokenCalls).toHaveLength(1);
  });
});

describe("fetchShowEpisodes", () => {
  it("fetches a client-credentials token then fetches episodes", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(makeEpisodesResponse());

    const result = await fetchShowEpisodes("show-id", "cid", "csecret");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("accounts.spotify.com");
    expect(fetchMock.mock.calls[1]?.[0]).toContain("/shows/show-id/episodes");
    expect(result.items).toHaveLength(1);
  });

  it("includes market and limit params", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(makeEpisodesResponse());

    await fetchShowEpisodes("show-id", "cid", "csecret", "DE", 5);

    expect(fetchMock.mock.calls[1]?.[0]).toContain("market=DE");
    expect(fetchMock.mock.calls[1]?.[0]).toContain("limit=5");
  });

  it("throws when the client-credentials token request fails", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ error: "invalid_client" }, 400));

    await expect(
      fetchShowEpisodes("show-id", "cid", "csecret"),
    ).rejects.toThrow("Spotify client credentials failed: 400");
  });

  it("throws when the episodes endpoint returns non-ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(createJsonResponse({ error: "not found" }, 404));

    await expect(
      fetchShowEpisodes("show-id", "cid", "csecret"),
    ).rejects.toThrow("Spotify show episodes fetch failed: 404");
  });

  it("reuses the cached CC token on a second call", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(makeEpisodesResponse())
      .mockResolvedValueOnce(makeEpisodesResponse());

    await fetchShowEpisodes("show-id", "cid", "csecret");
    await fetchShowEpisodes("show-id", "cid", "csecret");

    const tokenCalls = fetchMock.mock.calls.filter((c) =>
      String(c[0]).includes("accounts.spotify.com"),
    );
    expect(tokenCalls).toHaveLength(1);
  });
});

describe("getPlaybackToken", () => {
  it("returns the token with its real remaining lifetime", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(makeTokenResponse());

    const result = await getPlaybackToken("cid", "csecret", "rtoken");

    expect(result.token).toBe("test-access-token");
    expect(result.expiresIn).toBeGreaterThan(3590);
    expect(result.expiresIn).toBeLessThanOrEqual(3600);
  });

  it("serves repeat requests from the cache", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse());

    await getPlaybackToken("cid", "csecret", "rtoken");
    await getPlaybackToken("cid", "csecret", "rtoken");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a malformed token response", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(createJsonResponse({ access_token: "" }));

    await expect(
      getPlaybackToken("cid", "csecret", "rtoken"),
    ).rejects.toThrow();
  });
});
