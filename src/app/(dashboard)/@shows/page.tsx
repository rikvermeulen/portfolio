import BentoShow from '@/components/Bento/types/Shows';

import { getFavoriteMovies, getFavoriteShow, getShowSeason } from '@/utils/tmdb';

async function getData() {
  const [latestShow, shows, movies] = await Promise.all([
    getShowSeason('114461', '1'),
    getFavoriteShow(),
    getFavoriteMovies(),
  ]);

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
