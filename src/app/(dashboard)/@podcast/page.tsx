import React from 'react';

import { env } from '@/env.mjs';

import PodcastPlayer from '@/components/Bento/types/Podcast';

import { Spotify } from '@/utils/spotify';

const spotify = new Spotify(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET);

async function getData() {
  const podcast = await spotify.getSingleEpisode('02fM1JHpt9HmHGp482K71b', 'NL');

  return podcast?.items;
}

const Podcast = async () => {
  const podcast = await getData();

  if (!podcast) return <></>;

  return <PodcastPlayer playlist={podcast} />;
};

export default Podcast;
