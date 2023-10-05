import { env } from '@/env.mjs';

import MusicPlayer from '@/components/Bento/types/Music';

import { Spotify } from '@/utils/spotify';

const spotify = new Spotify(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET);

const playlistId = '2e2ELvxFRAZZSZTncX7zJg';

async function getData() {
  try {
    const playlist = await spotify.getTrack(playlistId);

    return playlist?.tracks?.items || [];
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return null;
  }
}

export default async function Music() {
  const playlist = await getData();

  if (!playlist) return <></>;

  return <MusicPlayer playlist={playlist} />;
}
