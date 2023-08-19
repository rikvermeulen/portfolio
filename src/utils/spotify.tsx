const BASE_URL = 'https://api.spotify.com/v1';

export class Spotify {
  private accessToken: string = '';
  private clientId: string;
  private clientSecret: string;
  private authorizations: string;
  private nextRefresh: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = '';
    this.authorizations = `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    )}`;
    this.nextRefresh = '';
  }
  async makeRequest(endpoint: string) {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await res.json();
    return data;
  }

  async refresh() {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: this.authorizations,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await res.json();
    this.accessToken = data.access_token;
    this.nextRefresh = Date.now() + data.expires_in;
  }

  public async getTrack(playlist_id: string) {
    if (Date.now() >= Number(this.nextRefresh)) await this.refresh();
    return await this.makeRequest(`playlists/${playlist_id}`);
  }

  public async getSingleEpisode(episode_id: string, market?: string) {
    if (Date.now() >= Number(this.nextRefresh)) await this.refresh();
    return await this.makeRequest(`shows/${episode_id}/episodes?market=${market}`);
  }

  // public async getSingleShow(podcast_id: string, market?: string) {
  //   let url = `https://api.spotify.com/v1/shows/${podcast_id}`;
  //   if (market) {
  //     url += `?market=${market}`;
  //   }

  //   const response = await this.makeAuthenticatedRequest(url);

  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch podcast show: ${await response.text()}`);
  //   }

  //   return await response.json();
  // }
}
