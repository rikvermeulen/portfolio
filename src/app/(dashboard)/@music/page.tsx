import { env } from '@/env.mjs';

import MusicPlayer from '@/components/Bento/types/Music';

import { Spotify } from '@/utils/spotify';

async function getData() {
  try {
    const spotify = new Spotify(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET);

    const playlist = await spotify.getTrack('0fYuugKPmiqUI38RCgKBEB');

    if (playlist?.tracks && playlist?.tracks?.items) {
      return playlist.tracks.items;
    }

    return null;
  } catch (error) {
    console.error('Error fetching data from Spotify:', error);
    return null;
  }
}

export default async function Music() {
  const playlist = await getData();

  if (!playlist) return <></>;

  return (
    <MusicPlayer playlist={playlist} className="bg-gradient-to-b from-[#E96575] to-[#E63F45]" />
  );
}
