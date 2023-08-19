import React from 'react';

import { env } from '@/env.mjs';

import PodcastPlayer from '@/components/Bento/types/Podcast';

import { Spotify } from '@/utils/spotify';

async function getData() {
  try {
    const spotify = new Spotify(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET);

    const podcast = await spotify.getSingleEpisode('5IQCDDwWlDkZDRahQYwZon', 'NL');

    if (!podcast?.items) return null;

    return podcast.items;
  } catch (error) {
    console.error('Error fetching data from Spotify:', error);
    return null;
  }
}

const Podcast = async () => {
  const podcast = await getData();

  console.log(podcast);

  if (!podcast) return <></>;

  return (
    <PodcastPlayer playlist={podcast} className="bg-gradient-to-b from-[#BC6AEB] to-[#6E2AAD]" />
  );
};

export default Podcast;
