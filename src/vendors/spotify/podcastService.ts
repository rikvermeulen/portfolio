import { unstable_rethrow } from "next/navigation";

import type { PodcastData } from "@/lib/music/types.ts";
import type { Result } from "@/types/index.ts";

import { toPodcastEpisode } from "@/lib/music/mappers.ts";
import { env } from "@env";

import { fetchShowEpisodes } from "./client.ts";

const SHOW_ID = "02fM1JHpt9HmHGp482K71b";

export async function getSpotifyPodcastResult(): Promise<Result<PodcastData>> {
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
    // Let Next's dynamic-render signal through instead of logging it as a failure.
    unstable_rethrow(error);
    console.error("[podcast] getSpotifyPodcastResult failed:", error);
    return { ok: false, errorMessage: "Could not load episodes right now" };
  }
}
