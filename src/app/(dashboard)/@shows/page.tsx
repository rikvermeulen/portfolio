import BentoShow from '@/components/Bento/types/Shows';

import { getShowDetails, getShowSeason } from '@/utils/tmdb';

async function getData() {
  const show = await getShowSeason('2316', '7');

  return show.episodes[15];
}

export default async function Shows() {
  const shows = await getData();

  return <BentoShow current={shows} />;
}
