import {
  deduplicateByTrackId,
  toMusicPlaylist,
  toNowPlayingTrack,
  toPlaylistTrack,
  toPodcastEpisode,
} from "./mappers.ts";

const item = (id: string, artist?: string) => ({
  played_at: "2026-07-01T00:00:00Z",
  track: {
    id,
    name: `Track ${id}`,
    explicit: false,
    album: { name: "Album", images: [{ url: "https://img/large.jpg" }] },
    artists: artist ? [{ name: artist }] : [],
  },
});

describe("toPlaylistTrack", () => {
  it("maps a track and its first artist", () => {
    expect(toPlaylistTrack(item("1", "Daft Punk"))).toEqual({
      id: "1",
      name: "Track 1",
      artist: "Daft Punk",
      albumName: "Album",
      albumArtUrl: "https://img/large.jpg",
      explicit: false,
    });
  });

  it("falls back to 'Unknown artist' when none present", () => {
    expect(toPlaylistTrack(item("2")).artist).toBe("Unknown artist");
  });
});

describe("deduplicateByTrackId", () => {
  it("keeps the first occurrence of each track id", () => {
    const result = deduplicateByTrackId([item("1"), item("2"), item("1")]);
    expect(result.map((i) => i.track.id)).toEqual(["1", "2"]);
  });
});

describe("toPodcastEpisode", () => {
  it("maps an episode with its image", () => {
    expect(
      toPodcastEpisode({
        id: "e1",
        name: "Episode 1",
        images: [{ url: "https://img/ep.jpg" }],
        explicit: true,
      }),
    ).toEqual({
      id: "e1",
      name: "Episode 1",
      imageUrl: "https://img/ep.jpg",
      explicit: true,
    });
  });
});

describe("toMusicPlaylist", () => {
  it("keeps id and name and picks the tile-sized cover", () => {
    expect(
      toMusicPlaylist({
        id: "pl-1",
        name: "R&B",
        images: [{ url: "large.jpg" }, { url: "medium.jpg" }],
      }),
    ).toEqual({ id: "pl-1", name: "R&B", imageUrl: "large.jpg" });
  });
});

describe("toNowPlayingTrack", () => {
  it("returns null when the SDK reports no track", () => {
    expect(toNowPlayingTrack(undefined)).toBeNull();
    expect(toNowPlayingTrack({ name: "No uri" })).toBeNull();
  });

  it("maps name, first artist, album and cover", () => {
    expect(
      toNowPlayingTrack({
        uri: "spotify:track:1",
        name: "Song",
        artists: [{ name: "Artist" }, { name: "Feat" }],
        album: {
          name: "Album",
          images: [{ url: "big.jpg" }, { url: "mid.jpg" }],
        },
      }),
    ).toEqual({
      uri: "spotify:track:1",
      name: "Song",
      artist: "Artist",
      albumName: "Album",
      imageUrl: "big.jpg",
    });
  });

  it("falls back when optional SDK fields are missing", () => {
    expect(toNowPlayingTrack({ uri: "spotify:track:1" })).toEqual({
      uri: "spotify:track:1",
      name: "",
      artist: "Unknown artist",
      albumName: "",
      imageUrl: null,
    });
  });
});
