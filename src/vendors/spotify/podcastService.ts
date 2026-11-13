import { unstable_rethrow } from "next/navigation";

import type { PodcastData } from "@/lib/music/types.ts";
import type { Result } from "@/types/index.ts";

import { toPodcastEpisode } from "@/lib/music/mappers.ts";
import { env } from "@env";

import { fetchShow } from "./client.ts";

const DEFAULT_SHOW_ID = "02fM1JHpt9HmHGp482K71b";
/** One show fills the tile with its back catalogue; several get their newest episode each. */
const SINGLE_SHOW_EPISODES = 20;

const toShowIds = (value: string | undefined): readonly string[] => {
  const ids = (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return ids.length > 0 ? ids : [DEFAULT_SHOW_ID];
};

export async function getSpotifyPodcastResult(): Promise<Result<PodcastData>> {
  const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_MARKET,
    SPOTIFY_PODCAST_SHOW_IDS,
  } = env;
  const showIds = toShowIds(SPOTIFY_PODCAST_SHOW_IDS);
  const perShow = showIds.length === 1 ? SINGLE_SHOW_EPISODES : 1;

  try {
    const shows = await Promise.all(
      showIds.map((id) =>
        fetchShow(
          id,
          SPOTIFY_CLIENT_ID,
          SPOTIFY_CLIENT_SECRET,
          SPOTIFY_MARKET ?? "NL",
        ),
      ),
    );

    const episodes = shows
      .flatMap((show) =>
        show.episodes
          .slice(0, perShow)
          .map((episode) => ({ episode, showName: show.name })),
      )
      // Newest first across shows; ISO release dates sort as strings.
      .sort((a, b) =>
        b.episode.release_date.localeCompare(a.episode.release_date),
      )
      .map(({ episode, showName }) => toPodcastEpisode(episode, showName));

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
