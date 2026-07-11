import { getSpotifyMusicResult, getSpotifyPlaylistResult } from "./service.ts";

jest.mock("./client.ts", () => ({
  fetchRecentlyPlayed: jest.fn(),
  fetchPlaylistTracks: jest.fn(),
}));

const mockEnv = {
  SPOTIFY_CLIENT_ID: "client-id",
  SPOTIFY_CLIENT_SECRET: "client-secret",
  SPOTIFY_REFRESH_TOKEN: undefined as string | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

const { fetchRecentlyPlayed, fetchPlaylistTracks } = jest.requireMock(
  "./client.ts",
) as {
  fetchRecentlyPlayed: jest.Mock;
  fetchPlaylistTracks: jest.Mock;
};

const makeItem = (
  id: string,
  name = "Track",
  previewUrl: string | null = null,
) => ({
  track: {
    id,
    name,
    explicit: false,
    preview_url: previewUrl,
    artists: [{ name: "Artist" }],
    album: {
      name: "Album",
      images: [
        { url: "https://img.example.com/1.jpg" },
        { url: "https://img.example.com/2.jpg" },
      ],
    },
  },
  played_at: "2026-01-01T00:00:00Z",
});

describe("getSpotifyMusicResult", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnv.SPOTIFY_REFRESH_TOKEN = "refresh-token";
  });

  it("returns ok:false when SPOTIFY_REFRESH_TOKEN is not set", async () => {
    mockEnv.SPOTIFY_REFRESH_TOKEN = undefined;

    await expect(getSpotifyMusicResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Spotify is not configured",
    });
    expect(fetchRecentlyPlayed).not.toHaveBeenCalled();
  });

  it("returns mapped tracks on success", async () => {
    fetchRecentlyPlayed.mockResolvedValue({
      items: [makeItem("track-1", "Night Owl")],
    });

    const result = await getSpotifyMusicResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.tracks[0]?.id).toBe("track-1");
      expect(result.data.tracks[0]?.name).toBe("Night Owl");
      expect(result.data.tracks[0]?.albumArtUrl).toBe(
        "https://img.example.com/2.jpg",
      );
    }
  });

  it("maps preview_url from Spotify when present", async () => {
    fetchRecentlyPlayed.mockResolvedValue({
      items: [makeItem("t1", "Track", "https://preview.spotify.com/t1.mp3")],
    });

    const result = await getSpotifyMusicResult();
    if (result.ok) {
      expect(result.data.tracks[0]?.previewUrl).toBe(
        "https://preview.spotify.com/t1.mp3",
      );
    }
  });

  it("sets previewUrl to null when Spotify returns null", async () => {
    fetchRecentlyPlayed.mockResolvedValue({
      items: [makeItem("t1", "Track", null)],
    });

    const result = await getSpotifyMusicResult();
    if (result.ok) {
      expect(result.data.tracks[0]?.previewUrl).toBeNull();
    }
  });

  it("falls back to first image when second image is absent", async () => {
    fetchRecentlyPlayed.mockResolvedValue({
      items: [
        {
          ...makeItem("t1"),
          track: {
            ...makeItem("t1").track,
            album: {
              name: "Album",
              images: [{ url: "https://img.example.com/only.jpg" }],
            },
          },
        },
      ],
    });

    const result = await getSpotifyMusicResult();
    if (result.ok) {
      expect(result.data.tracks[0]?.albumArtUrl).toBe(
        "https://img.example.com/only.jpg",
      );
    }
  });

  it("deduplicates tracks with the same id", async () => {
    fetchRecentlyPlayed.mockResolvedValue({
      items: [makeItem("dupe-id"), makeItem("dupe-id"), makeItem("other-id")],
    });

    const result = await getSpotifyMusicResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.tracks).toHaveLength(2);
    }
  });

  it("uses Unknown artist when artists array is empty", async () => {
    fetchRecentlyPlayed.mockResolvedValue({
      items: [
        { ...makeItem("t1"), track: { ...makeItem("t1").track, artists: [] } },
      ],
    });

    const result = await getSpotifyMusicResult();
    if (result.ok) {
      expect(result.data.tracks[0]?.artist).toBe("Unknown artist");
    }
  });

  it("returns ok:false when the result has no tracks after dedup", async () => {
    fetchRecentlyPlayed.mockResolvedValue({ items: [] });

    await expect(getSpotifyMusicResult()).resolves.toMatchObject({
      ok: false,
      errorMessage: "No recent tracks found",
    });
  });

  it("sets albumArtUrl to null when images array is empty", async () => {
    fetchRecentlyPlayed.mockResolvedValue({
      items: [
        {
          ...makeItem("t1"),
          track: {
            ...makeItem("t1").track,
            album: { name: "Album", images: [] },
          },
        },
      ],
    });

    const result = await getSpotifyMusicResult();
    if (result.ok) {
      expect(result.data.tracks[0]?.albumArtUrl).toBeNull();
    }
  });

  it("returns ok:false when fetchRecentlyPlayed throws", async () => {
    fetchRecentlyPlayed.mockRejectedValue(new Error("network error"));

    await expect(getSpotifyMusicResult()).resolves.toMatchObject({
      ok: false,
      errorMessage: "Could not load your music right now",
    });
  });
});

const makePlaylistItem = (id: string, name = "Track", nullTrack = false) =>
  nullTrack
    ? { track: null }
    : {
        track: {
          id,
          name,
          explicit: false,
          preview_url: null,
          artists: [{ name: "Artist" }],
          album: {
            name: "Album",
            images: [{ url: "https://img.example.com/1.jpg" }],
          },
        },
      };

describe("getSpotifyPlaylistResult", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnv.SPOTIFY_REFRESH_TOKEN = "refresh-token";
  });

  it("returns mapped tracks from a public playlist", async () => {
    fetchPlaylistTracks.mockResolvedValue({
      items: [makePlaylistItem("p1", "Hit Song")],
    });

    const result = await getSpotifyPlaylistResult("playlist-id");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.tracks[0]?.id).toBe("p1");
      expect(result.data.tracks[0]?.name).toBe("Hit Song");
    }
  });

  it("filters out null tracks (local Spotify files)", async () => {
    fetchPlaylistTracks.mockResolvedValue({
      items: [makePlaylistItem("p1"), makePlaylistItem("", "", true)],
    });

    const result = await getSpotifyPlaylistResult("playlist-id");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.tracks).toHaveLength(1);
    }
  });

  it("returns ok:false when all tracks are null", async () => {
    fetchPlaylistTracks.mockResolvedValue({
      items: [makePlaylistItem("", "", true)],
    });

    await expect(
      getSpotifyPlaylistResult("playlist-id"),
    ).resolves.toMatchObject({
      ok: false,
      errorMessage: "No tracks found in playlist",
    });
  });

  it("returns ok:false when the playlist is empty", async () => {
    fetchPlaylistTracks.mockResolvedValue({ items: [] });

    await expect(
      getSpotifyPlaylistResult("playlist-id"),
    ).resolves.toMatchObject({
      ok: false,
      errorMessage: "No tracks found in playlist",
    });
  });

  it("returns ok:false when fetchPlaylistTracks throws", async () => {
    fetchPlaylistTracks.mockRejectedValue(new Error("network error"));

    await expect(
      getSpotifyPlaylistResult("playlist-id"),
    ).resolves.toMatchObject({
      ok: false,
      errorMessage: "Could not load playlist right now",
    });
  });

  it("uses the default playlist id when none is provided", async () => {
    fetchPlaylistTracks.mockResolvedValue({
      items: [makePlaylistItem("p1")],
    });

    await getSpotifyPlaylistResult();

    expect(fetchPlaylistTracks).toHaveBeenCalledWith(
      "37i9dQZF1DXcBWIGoYBM5M",
      expect.any(String),
      expect.any(String),
    );
  });

  it("uses Unknown artist when artists array is empty", async () => {
    fetchPlaylistTracks.mockResolvedValue({
      items: [
        {
          track: {
            ...makePlaylistItem("p1").track,
            artists: [],
          },
        },
      ],
    });

    const result = await getSpotifyPlaylistResult("playlist-id");
    if (result.ok) {
      expect(result.data.tracks[0]?.artist).toBe("Unknown artist");
    }
  });

  it("falls back to first image when second is absent", async () => {
    fetchPlaylistTracks.mockResolvedValue({
      items: [
        {
          track: {
            ...makePlaylistItem("p1").track,
            album: {
              name: "Album",
              images: [{ url: "https://img.example.com/only.jpg" }],
            },
          },
        },
      ],
    });

    const result = await getSpotifyPlaylistResult("playlist-id");
    if (result.ok) {
      expect(result.data.tracks[0]?.albumArtUrl).toBe(
        "https://img.example.com/only.jpg",
      );
    }
  });

  it("sets albumArtUrl to null when images array is empty", async () => {
    fetchPlaylistTracks.mockResolvedValue({
      items: [
        {
          track: {
            ...makePlaylistItem("p1").track,
            album: { name: "Album", images: [] },
          },
        },
      ],
    });

    const result = await getSpotifyPlaylistResult("playlist-id");
    if (result.ok) {
      expect(result.data.tracks[0]?.albumArtUrl).toBeNull();
    }
  });
});
