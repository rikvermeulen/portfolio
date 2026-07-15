import { getSpotifyPodcastResult } from "./podcastService.ts";

jest.mock("./client.ts", () => ({
  fetchShowEpisodes: jest.fn(),
}));

const mockEnv = {
  SPOTIFY_CLIENT_ID: "client-id",
  SPOTIFY_CLIENT_SECRET: "client-secret",
  SPOTIFY_MARKET: undefined as string | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

const { fetchShowEpisodes } = jest.requireMock("./client.ts") as {
  fetchShowEpisodes: jest.Mock;
};

const makeEpisode = (id: string, name = "Episode") => ({
  id,
  name,
  images: [
    { url: "https://img.example.com/large.jpg" },
    { url: "https://img.example.com/medium.jpg" },
  ],
  explicit: false,
});

describe("getSpotifyPodcastResult", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnv.SPOTIFY_MARKET = undefined;
  });

  it("returns mapped episodes on success", async () => {
    fetchShowEpisodes.mockResolvedValue({
      items: [makeEpisode("ep-1", "Intro")],
    });

    const result = await getSpotifyPodcastResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.episodes[0]?.id).toBe("ep-1");
      expect(result.data.episodes[0]?.name).toBe("Intro");
      expect(result.data.episodes[0]?.imageUrl).toBe(
        "https://img.example.com/medium.jpg",
      );
    }
  });

  it("falls back to first image when second image is absent", async () => {
    fetchShowEpisodes.mockResolvedValue({
      items: [
        {
          ...makeEpisode("ep-1"),
          images: [{ url: "https://img.example.com/only.jpg" }],
        },
      ],
    });

    const result = await getSpotifyPodcastResult();
    if (result.ok) {
      expect(result.data.episodes[0]?.imageUrl).toBe(
        "https://img.example.com/only.jpg",
      );
    }
  });

  it("returns null imageUrl when images array is empty", async () => {
    fetchShowEpisodes.mockResolvedValue({
      items: [{ ...makeEpisode("ep-1"), images: [] }],
    });

    const result = await getSpotifyPodcastResult();
    if (result.ok) {
      expect(result.data.episodes[0]?.imageUrl).toBeNull();
    }
  });

  it("uses SPOTIFY_MARKET env var when set", async () => {
    mockEnv.SPOTIFY_MARKET = "DE";
    fetchShowEpisodes.mockResolvedValue({ items: [makeEpisode("ep-1")] });

    await getSpotifyPodcastResult();

    expect(fetchShowEpisodes).toHaveBeenCalledWith(
      expect.any(String),
      "client-id",
      "client-secret",
      "DE",
    );
  });

  it("defaults to NL market when SPOTIFY_MARKET is not set", async () => {
    fetchShowEpisodes.mockResolvedValue({ items: [makeEpisode("ep-1")] });

    await getSpotifyPodcastResult();

    expect(fetchShowEpisodes).toHaveBeenCalledWith(
      expect.any(String),
      "client-id",
      "client-secret",
      "NL",
    );
  });

  it("returns ok:false when episodes array is empty", async () => {
    fetchShowEpisodes.mockResolvedValue({ items: [] });

    await expect(getSpotifyPodcastResult()).resolves.toMatchObject({
      ok: false,
      errorMessage: "No episodes found",
    });
  });

  it("returns ok:false when fetchShowEpisodes throws", async () => {
    fetchShowEpisodes.mockRejectedValue(new Error("upstream error"));

    await expect(getSpotifyPodcastResult()).resolves.toMatchObject({
      ok: false,
      errorMessage: "Could not load episodes right now",
    });
  });
});
