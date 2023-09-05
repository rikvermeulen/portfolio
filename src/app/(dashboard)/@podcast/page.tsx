import React from 'react';

import { env } from '@/env.mjs';

import PodcastPlayer from '@/components/Bento/types/Podcast';

import { Spotify } from '@/utils/spotify';

async function getData() {
  const spotify = new Spotify(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET);

  const podcast = await spotify.getSingleEpisode('02fM1JHpt9HmHGp482K71b', 'NL');

  return podcast?.items;
}

const Podcast = async () => {
  const podcast = await getData();

  if (!podcast) return <></>;

  return (
    <PodcastPlayer playlist={podcast} className="bg-gradient-to-b from-[#BC6AEB] to-[#6E2AAD]" />
  );
};

export default Podcast;
