import {
  buildSteamHeaderUrl,
  buildSteamLibraryArtUrl,
  buildSteamStoreUrl,
  fetchOwnedGames,
  fetchPlayerSummaries,
  fetchSteamHeaderImage,
  SteamError,
} from "./client.ts";

const createJsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });

beforeEach(() => {
  jest.restoreAllMocks();
});

describe("fetchPlayerSummaries", () => {
  it("calls GetPlayerSummaries with the key and a comma-joined steamids list", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      createJsonResponse({
        response: { players: [{ steamid: "1", personaname: "A" }] },
      }),
    );

    const result = await fetchPlayerSummaries("test-key", ["1", "2"]);

    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("GetPlayerSummaries");
    expect(calledUrl).toContain("key=test-key");
    expect(decodeURIComponent(calledUrl)).toContain("steamids=1,2");
    expect(result.response.players).toHaveLength(1);
  });

  it("throws a SteamError when the endpoint returns non-ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ error: "rate limited" }, 429));

    await expect(fetchPlayerSummaries("k", ["1"])).rejects.toThrow(SteamError);
    await expect(fetchPlayerSummaries("k", ["1"])).rejects.toThrow(
      "Steam player-summaries fetch failed: 429",
    );
  });
});

describe("fetchOwnedGames", () => {
  it("calls the GetOwnedGames endpoint with key, steamid and appinfo", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      createJsonResponse({
        response: { game_count: 1, games: [{ appid: 570, name: "Dota 2" }] },
      }),
    );

    const result = await fetchOwnedGames("test-key", "76561197960287930");

    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("GetOwnedGames");
    expect(calledUrl).toContain("key=test-key");
    expect(calledUrl).toContain("steamid=76561197960287930");
    expect(calledUrl).toContain("include_appinfo=1");
    expect(calledUrl).toContain("include_played_free_games=1");
    expect(result.response.games).toHaveLength(1);
  });

  it("throws a SteamError when the endpoint returns non-ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ error: "forbidden" }, 403));

    await expect(fetchOwnedGames("k", "s")).rejects.toThrow(SteamError);
    await expect(fetchOwnedGames("k", "s")).rejects.toThrow(
      "Steam owned-games fetch failed: 403",
    );
  });
});

describe("fetchSteamHeaderImage", () => {
  const makeDetailsResponse = (appid: number, entry: unknown) =>
    createJsonResponse({ [String(appid)]: entry });

  it("calls the store appdetails endpoint and returns header_image", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      makeDetailsResponse(570, {
        success: true,
        data: { header_image: "https://img.example.com/570/header.jpg" },
      }),
    );

    const result = await fetchSteamHeaderImage(570);

    expect(result).toBe("https://img.example.com/570/header.jpg");
    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("store.steampowered.com/api/appdetails");
    expect(calledUrl).toContain("appids=570");
  });

  it("returns null when the response is non-ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ error: "rate limited" }, 429));
    await expect(fetchSteamHeaderImage(570)).resolves.toBeNull();
  });

  it("returns null when the appid entry is missing", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(createJsonResponse({}));
    await expect(fetchSteamHeaderImage(570)).resolves.toBeNull();
  });

  it("returns null when there is no data object", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(makeDetailsResponse(570, { success: false }));
    await expect(fetchSteamHeaderImage(570)).resolves.toBeNull();
  });

  it("returns null when header_image is absent", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(makeDetailsResponse(570, { success: true, data: {} }));
    await expect(fetchSteamHeaderImage(570)).resolves.toBeNull();
  });

  it("returns null when the fetch throws", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network error"));
    await expect(fetchSteamHeaderImage(570)).resolves.toBeNull();
  });
});

describe("url builders", () => {
  it("builds a landscape header fallback url", () => {
    expect(buildSteamHeaderUrl(570)).toBe(
      "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg",
    );
  });

  it("builds a portrait library-art url", () => {
    expect(buildSteamLibraryArtUrl(570)).toBe(
      "https://cdn.cloudflare.steamstatic.com/steam/apps/570/library_600x900_2x.jpg",
    );
  });

  it("builds a store url", () => {
    expect(buildSteamStoreUrl(570)).toBe(
      "https://store.steampowered.com/app/570",
    );
  });
});
