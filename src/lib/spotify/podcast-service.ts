import type { PodcastEpisode, SpotifyEpisode } from "./types.ts";

import { env } from "@env";

import { fetchShowEpisodes } from "./client.ts";

const SHOW_ID = "02fM1JHpt9HmHGp482K71b";

export interface PodcastData {
  readonly episodes: readonly PodcastEpisode[];
}

export type PodcastResult =
  | { readonly ok: true; readonly data: PodcastData }
  | { readonly ok: false; readonly errorMessage: string };

function toPodcastEpisode(episode: SpotifyEpisode): PodcastEpisode {
  return {
    id: episode.id,
    name: episode.name,
    previewUrl: episode.audio_preview_url,
    imageUrl: episode.images[1]?.url ?? episode.images[0]?.url ?? null,
    explicit: episode.explicit,
  };
}

export async function getSpotifyPodcastResult(): Promise<PodcastResult> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_MARKET } = env;

  try {
    const data = await fetchShowEpisodes(
      SHOW_ID,
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_MARKET ?? "NL",
    );

    const episodes = data.items.map(toPodcastEpisode);

    if (episodes.length === 0) {
      return { ok: false, errorMessage: "No episodes found" };
    }

    return { ok: true, data: { episodes } };
  } catch (error) {
    console.error("[podcast] getSpotifyPodcastResult failed:", error);
    return { ok: false, errorMessage: "Could not load episodes right now" };
  }
}
