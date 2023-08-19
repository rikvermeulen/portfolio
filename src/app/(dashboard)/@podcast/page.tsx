import console from 'console';

import { env } from '@/env.mjs';

import PodcastPlayer from '@/components/Bento/types/Podcast';

import { Spotify } from '@/utils/spotify';

async function getData() {
  const spotify = new Spotify(env!.SPOTIFY_CLIENT_ID, env!.SPOTIFY_CLIENT_SECRET);

  if (!spotify) return;

  const podcast = await spotify.getSingleEpisode('5IQCDDwWlDkZDRahQYwZon', 'NL');

  if (!podcast?.items) return;

  return podcast?.items;
}

export default async function Podcast() {
  // const podcast = await getData();

  // if (!podcast) return <></>;

  return (
    // <PodcastPlayer playlist={podcast} className="bg-gradient-to-b from-[#BC6AEB] to-[#6E2AAD]" />
    <></>
  );
}
