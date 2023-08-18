import { env } from 'env.mjs';

import Music from '@/components/Bento/types/Music';
import { Spotify } from '@/utils/spotify';

async function getData() {
  const spotify = new Spotify(env!.SPOTIFY_CLIENT_ID, env!.SPOTIFY_CLIENT_SECRET);

  let isInitialized = await spotify.initializeWithClientCredentials();

  if (!isInitialized) {
    isInitialized = await spotify.initializeWithCode(env!.SPOTIFY_CLIENT_RESET);
  }

  if (!isInitialized) {
    console.error('Failed to initialize Spotify client');
    return [];
  }

  const playlist = await spotify.getPlaylistTracks('0fYuugKPmiqUI38RCgKBEB');

  return playlist.tracks.items;
}

export default async function Tusic() {
  const playlist = await getData();

  return <Music playlist={playlist} />;
}
