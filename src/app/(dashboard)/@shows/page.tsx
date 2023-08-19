import { getShowDetails } from '@/utils/tmdb';

async function getData() {
  const show = getShowDetails('2316');

  return show;
}

export default async function Shows() {
  // const shows = await getData();
  // console.log(shows);

  return <></>;
}
