import axios from 'axios';

const BASE_URL = 'https://api.spotify.com/v1';

export class Spotify {
  private static cache: { [key: string]: any } = {};
  private accessToken: string = '';
  private clientId: string;
  private clientSecret: string;
  private authorizations: string;
  private nextRefresh: number;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = '';
    this.authorizations = `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    )}`;
    this.nextRefresh = 0;
  }

  async makeRequest(endpoint: string) {
    try {
      const response = await axios.get(`${BASE_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async refresh() {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: this.authorizations,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.data.access_token;
      this.nextRefresh = Date.now() + response.data.expires_in * 1000;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getTrack(playlist_id: string) {
    try {
      if (Spotify.cache[playlist_id]) {
        return Spotify.cache[playlist_id];
      }

      if (Date.now() >= this.nextRefresh) await this.refresh();
      const data = await this.makeRequest(`playlists/${playlist_id}`);

      Spotify.cache[playlist_id] = data;

      return data;
    } catch (error) {
      throw new Error(`Failed to get track for playlist ID ${playlist_id}: ${error}`);
    }
  }

  public async getSingleEpisode(episode_id: string, market?: string) {
    try {
      const cacheKey = `${episode_id}:${market || 'default'}`;

      if (Spotify.cache[cacheKey]) {
        return Spotify.cache[cacheKey];
      }

      if (Date.now() >= this.nextRefresh) await this.refresh();
      const data = await this.makeRequest(`shows/${episode_id}/episodes?market=${market}`);

      Spotify.cache[cacheKey] = data;

      return data;
    } catch (error) {
      throw new Error(`Failed to get episode for episode ID ${episode_id}: ${error}`);
    }
  }
}
