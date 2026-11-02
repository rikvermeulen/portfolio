import { getSpotifyPodcastResult } from "./podcastService.ts";

jest.mock("./client.ts", () => ({
  fetchShow: jest.fn(),
}));

const mockEnv = {
  SPOTIFY_CLIENT_ID: "client-id",
  SPOTIFY_CLIENT_SECRET: "client-secret",
  SPOTIFY_MARKET: undefined as string | undefined,
  SPOTIFY_PODCAST_SHOW_IDS: undefined as string | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

const { fetchShow } = jest.requireMock("./client.ts") as {
  fetchShow: jest.Mock;
};

const makeEpisode = (id: string, releaseDate = "2026-10-01") => ({
  id,
  name: `Episode ${id}`,
  images: [{ url: `https://img.example.com/${id}.jpg`, width: 640 }],
  explicit: false,
  release_date: releaseDate,
});

const makeShow = (
  id: string,
  episodes: readonly ReturnType<typeof makeEpisode>[],
) => ({ id, name: `Show ${id}`, episodes });

describe("getSpotifyPodcastResult", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnv.SPOTIFY_MARKET = undefined;
    mockEnv.SPOTIFY_PODCAST_SHOW_IDS = undefined;
  });

  it("falls back to the default show and keeps its recent episodes", async () => {
    fetchShow.mockResolvedValue(
      makeShow(
        "default",
        Array.from({ length: 25 }, (_, i) => makeEpisode(`ep-${i}`)),
      ),
    );

    const result = await getSpotifyPodcastResult();

    expect(fetchShow).toHaveBeenCalledTimes(1);
    expect(fetchShow).toHaveBeenCalledWith(
      "02fM1JHpt9HmHGp482K71b",
      "client-id",
      "client-secret",
      "NL",
    );
    expect(result.ok && result.data.episodes).toHaveLength(20);
    expect(result.ok && result.data.episodes[0]).toEqual({
      id: "ep-0",
      name: "Episode ep-0",
      showName: "Show default",
      imageUrl: "https://img.example.com/ep-0.jpg",
      explicit: false,
    });
  });

  it("takes the newest episode of each configured show, newest first", async () => {
    mockEnv.SPOTIFY_PODCAST_SHOW_IDS = " show-a, show-b ,,";
    fetchShow.mockImplementation((id: string) =>
      Promise.resolve(
        id === "show-a"
          ? makeShow("show-a", [
              makeEpisode("a-new", "2026-09-01"),
              makeEpisode("a-old", "2026-08-01"),
            ])
          : makeShow("show-b", [makeEpisode("b-new", "2026-10-01")]),
      ),
    );

    const result = await getSpotifyPodcastResult();

    expect(fetchShow).toHaveBeenCalledTimes(2);
    expect(
      result.ok &&
        result.data.episodes.map((episode) => [episode.id, episode.showName]),
    ).toEqual([
      ["b-new", "Show show-b"],
      ["a-new", "Show show-a"],
    ]);
  });

  it("uses SPOTIFY_MARKET when set", async () => {
    mockEnv.SPOTIFY_MARKET = "DE";
    fetchShow.mockResolvedValue(makeShow("default", [makeEpisode("ep-1")]));

    await getSpotifyPodcastResult();

    expect(fetchShow).toHaveBeenCalledWith(
      expect.any(String),
      "client-id",
      "client-secret",
      "DE",
    );
  });

  it("returns ok:false when no show has episodes", async () => {
    fetchShow.mockResolvedValue(makeShow("default", []));

    await expect(getSpotifyPodcastResult()).resolves.toEqual({
      ok: false,
      errorMessage: "No episodes found",
    });
  });

  it("returns ok:false when a show fetch throws", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    fetchShow.mockRejectedValue(new Error("upstream error"));

    await expect(getSpotifyPodcastResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Could not load episodes right now",
    });
  });
});
