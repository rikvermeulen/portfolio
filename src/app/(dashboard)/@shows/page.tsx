import BentoShow from '@/components/Bento/types/Shows';

import { getFavoriteMovies, getFavoriteShow, getShowSeason } from '@/utils/tmdb';

const showID = '114461';

async function getData() {
  const [latestShow, shows, movies] = await Promise.all([
    getShowSeason(showID, '1'),
    getFavoriteShow(),
    getFavoriteMovies(),
  ]);

  Object.assign(latestShow, { show_id: showID });

  return {
    latestShow: latestShow.episodes[4],
    shows: shows.results,
    movies: movies.results,
  };
}

export default async function Shows() {
  const data = await getData();

  return <BentoShow current={data.latestShow} shows={data.shows} movies={data.movies} />;
}
