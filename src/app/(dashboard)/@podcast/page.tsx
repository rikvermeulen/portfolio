import { env } from '@/env.mjs';

import PodcastPlayer from '@/components/Bento/types/Podcast';

import { Spotify } from '@/utils/spotify';

async function getData() {
  const spotify = new Spotify(env!.SPOTIFY_CLIENT_ID, env!.SPOTIFY_CLIENT_SECRET);

  // let isInitialized = await spotify.initializeWithClientCredentials();

  // if (!isInitialized) {
  //   isInitialized = await spotify.initializeWithCode(env!.SPOTIFY_CLIENT_ACCESS_TOKEN);
  // }

  // if (!isInitialized) {
  //   console.error('Failed to initialize Spotify client');
  //   return [];
  // }

  const podcast = await spotify.getSingleEpisode('38bS44xjbVVZ3No3ByF1dJ', 'NL');

  return podcast?.items;
}

export default async function Podcast() {
  const podcast = await getData();

  return (
    <PodcastPlayer playlist={podcast} className="bg-gradient-to-b from-[#BC6AEB] to-[#6E2AAD]" />
  );
}
