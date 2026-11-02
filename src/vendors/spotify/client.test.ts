// Module-level token variables must be reset between tests.
let fetchRecentlyPlayed: typeof import("./client.ts").fetchRecentlyPlayed;
let fetchShow: typeof import("./client.ts").fetchShow;
let getPlaybackToken: typeof import("./client.ts").getPlaybackToken;
let fetchPlaylist: typeof import("./client.ts").fetchPlaylist;

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

// An unavailable episode comes back as `null` and is dropped.
const makeShowResponse = () =>
  createJsonResponse({
    id: "show-id",
    name: "Developer Tea",
    episodes: {
      items: [
        {
          id: "ep-1",
          name: "Episode 1",
          images: [],
          explicit: false,
          release_date: "2026-10-24",
        },
        null,
      ],
    },
  });

beforeEach(async () => {
  jest.resetModules();
  jest.restoreAllMocks();

  const client = await import("./client.ts");
  fetchRecentlyPlayed = client.fetchRecentlyPlayed;
  fetchShow = client.fetchShow;
  getPlaybackToken = client.getPlaybackToken;
  fetchPlaylist = client.fetchPlaylist;
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

describe("fetchShow", () => {
  it("fetches name and newest episodes with a client-credentials token", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(makeShowResponse());

    const show = await fetchShow("show-id", "cid", "csecret");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("accounts.spotify.com");
    expect(fetchMock.mock.calls[1]?.[0]).toContain("/shows/show-id?market=NL");
    expect(show).toEqual({
      id: "show-id",
      name: "Developer Tea",
      episodes: [
        {
          id: "ep-1",
          name: "Episode 1",
          images: [],
          explicit: false,
          release_date: "2026-10-24",
        },
      ],
    });
  });

  it("passes the market", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(makeShowResponse());

    await fetchShow("show-id", "cid", "csecret", "DE");

    expect(fetchMock.mock.calls[1]?.[0]).toContain("market=DE");
  });

  it("throws when the client-credentials token request fails", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ error: "invalid_client" }, 400));

    await expect(fetchShow("show-id", "cid", "csecret")).rejects.toThrow(
      "Spotify client credentials failed: 400",
    );
  });

  it("throws when the show endpoint returns non-ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(createJsonResponse({ error: "not found" }, 404));

    await expect(fetchShow("show-id", "cid", "csecret")).rejects.toThrow(
      "Spotify show fetch failed: 404",
    );
  });

  it("rejects a payload that is not a show", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(createJsonResponse({ unexpected: true }));

    await expect(fetchShow("show-id", "cid", "csecret")).rejects.toThrow();
  });

  it("reuses the cached CC token on a second call", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(makeShowResponse())
      .mockResolvedValueOnce(makeShowResponse());

    await fetchShow("show-id", "cid", "csecret");
    await fetchShow("show-id", "cid", "csecret");

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

describe("fetchPlaylist", () => {
  it("fetches name and cover with a client-credentials token", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(
        createJsonResponse({
          id: "pl-1",
          name: "R&B",
          images: [{ url: "https://img.example.com/cover.jpg" }],
        }),
      );

    const playlist = await fetchPlaylist("pl-1", "cid", "csecret");

    expect(fetchMock.mock.calls[1]?.[0]).toContain(
      "/playlists/pl-1?fields=id%2Cname%2Cimages",
    );
    expect(playlist).toEqual({
      id: "pl-1",
      name: "R&B",
      images: [{ url: "https://img.example.com/cover.jpg" }],
    });
  });

  it("treats a null images field as no cover", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(
        createJsonResponse({ id: "pl-1", name: "R&B", images: null }),
      );

    await expect(fetchPlaylist("pl-1", "cid", "csecret")).resolves.toEqual({
      id: "pl-1",
      name: "R&B",
      images: [],
    });
  });

  it("throws when the playlist endpoint returns non-ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(createJsonResponse({ error: "not found" }, 404));

    await expect(fetchPlaylist("pl-1", "cid", "csecret")).rejects.toThrow(
      "Spotify playlist fetch failed: 404",
    );
  });

  it("rejects a payload that is not a playlist", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeTokenResponse())
      .mockResolvedValueOnce(createJsonResponse({ unexpected: true }));

    await expect(fetchPlaylist("pl-1", "cid", "csecret")).rejects.toThrow();
  });
});
