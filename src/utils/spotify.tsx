import axios from 'axios';

const BASE_URL = 'https://api.spotify.com/v1';

export class Spotify {
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
    if (Date.now() >= this.nextRefresh) await this.refresh();
    return await this.makeRequest(`playlists/${playlist_id}`);
  }

  public async getSingleEpisode(episode_id: string, market?: string) {
    if (Date.now() >= this.nextRefresh) await this.refresh();
    return await this.makeRequest(`shows/${episode_id}/episodes?market=${market}`);
  }
}
