import { env } from '@/env.mjs';

import MusicPlayer from '@/components/Bento/types/Music';

import { Spotify } from '@/utils/spotify';

const spotify = new Spotify(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET);

async function getData() {
  const playlist = await spotify.getTrack('2e2ELvxFRAZZSZTncX7zJg');
  https: return playlist?.tracks?.items;
}

export default async function Music() {
  const playlist = await getData();

  if (!playlist) return <></>;

  return <MusicPlayer playlist={playlist} />;
}
