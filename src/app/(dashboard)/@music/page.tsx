import MusicPlayer from "@/components/Bento/types/Music.tsx";
import { env } from "@/env.ts";
import { Spotify } from "@/utils/spotify.tsx";

import type { IPlaylistItem } from "@/types/types";

const spotify = new Spotify(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET);

async function getData() {
  const playlist = (await spotify.getTrack("2e2ELvxFRAZZSZTncX7zJg")) as {
    tracks?: { items?: unknown[] };
  };

  return (playlist?.tracks?.items as IPlaylistItem[]) || [];
}

export default async function Music() {
  const playlist = await getData();

  if (!playlist) {
    return <></>;
  }

  return <MusicPlayer playlist={playlist} />;
}
