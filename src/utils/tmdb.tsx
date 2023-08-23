import axios from 'axios';

import { env } from '@/env.mjs';

const BASE_URL = 'https://api.themoviedb.org/3';

export const searchShows = async (query: any) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/search/tv?api_key=${env.TMDB_CLIENT_KEY}&query=${query}`,
    );
    return response.data.results;
  } catch (error) {
    console.error('Error fetching shows:', error);
    return [];
  }
};

export const getShowDetails = async (tvId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/tv/${tvId}?api_key=${env.TMDB_CLIENT_KEY}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching show details:', error);
    return null;
  }
};

export const getShowSeason = async (tvId: string, seasonNumber: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${env.TMDB_CLIENT_KEY}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching show season:', error);
    return null;
  }
};

export const getFavoriteShow = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/account/9670374/favorite/tv`, {
      headers: {
        Authorization: `Bearer ${env.TMDB_CLIENT_SECRET}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching show details:', error);
    return null;
  }
};

export const getFavoriteMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/account/9670374/favorite/movies`, {
      headers: {
        Authorization: `Bearer ${env.TMDB_CLIENT_SECRET}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching show details:', error);
    return null;
  }
};
