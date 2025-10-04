import PodcastPlayer from "@/components/Bento/types/Podcast.tsx";
import { env } from "@/env.ts";
import { Spotify } from "@/utils/spotify.tsx";
import React from "react";

const spotify = new Spotify(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET);

async function getData() {
  const podcast = (await spotify.getSingleEpisode(
    "02fM1JHpt9HmHGp482K71b",
    "NL",
  )) as { items?: unknown[] };

  return (podcast?.items || []) as unknown[];
}

const Podcast = async () => {
  const podcast = await getData();

  if (!podcast) {
    return <></>;
  }

  return <PodcastPlayer playlist={podcast as any} />;
};

export default Podcast;
