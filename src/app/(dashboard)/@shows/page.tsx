import BentoShow from '@/components/Bento/types/Shows';

import { getFavoriteMovies, getFavoriteShow, getShowSeason } from '@/utils/tmdb';

async function getData() {
  const latestShow = await getShowSeason('2316', '7');

  const shows = await getFavoriteShow();
  const movies = await getFavoriteMovies();

  return {
    latestShow: latestShow.episodes[15],
    shows: shows.results,
    movies: movies.results,
  };
}

export default async function Shows() {
  const data = await getData();

  return <BentoShow current={data.latestShow} shows={data.shows} movies={data.movies} />;
}
