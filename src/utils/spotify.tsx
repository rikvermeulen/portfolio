export class Spotify {
  private accessToken: string = '';
  private refreshToken: string = '';
  private clientId: string;
  private clientSecret: string;
  private tokenExpiry: Date = new Date(Date.now() + 3600 * 1000);
  private redirectUri: string = 'https://www.rikvermeulen.com/callback'; // Consider passing this as an argument

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private getBasicAuth(): string {
    return Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
  }

  private async updateTokens(data: any) {
    if (data.access_token) {
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    }
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }
  }

  public async initializeWithClientCredentials(): Promise<boolean> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.getBasicAuth()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      console.error('Failed to fetch token with client credentials', await response.text());
      return false;
    }

    const data = await response.json();
    await this.updateTokens(data);
    return !!data.access_token;
  }

  public async initializeWithCode(authCode: string): Promise<boolean> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.getBasicAuth()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      console.error('Failed to exchange authorization code for tokens', await response.text());
      return false;
    }

    const data = await response.json();

    console.log(data);
    await this.updateTokens(data);
    return !!data.access_token && !!data.refresh_token;
  }

  public tokenIsExpired(): boolean {
    const bufferTimeInMs = 60000;
    return this.tokenExpiry.getTime() - bufferTimeInMs <= Date.now();
  }

  public async refreshAccessToken(): Promise<boolean> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.getBasicAuth()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      console.error('Failed to refresh access token', await response.text());
      return false;
    }

    const data = await response.json();
    this.updateTokens(data);
    return !!data.access_token;
  }

  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {},
    retryCount: number = 1,
  ): Promise<Response> {
    if (this.tokenIsExpired()) {
      const success = await this.refreshAccessToken();
      if (!success) {
        throw new Error('Failed to refresh access token.');
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (response.status === 401 && retryCount > 0) {
      const success = await this.refreshAccessToken();
      if (!success) {
        throw new Error('Failed to refresh access token.');
      }
      return await this.makeAuthenticatedRequest(url, options, retryCount - 1); // retrying
    }

    return response;
  }

  public async getPlaylistTracks(playlist_id: string) {
    const response = await this.makeAuthenticatedRequest(
      `https://api.spotify.com/v1/playlists/${playlist_id}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist tracks: ${await response.text()}`);
    }

    return await response.json();
  }

  public async getSingleShow(podcast_id: string, market?: string) {
    let url = `https://api.spotify.com/v1/shows/${podcast_id}`;
    if (market) {
      url += `?market=${market}`;
    }

    const response = await this.makeAuthenticatedRequest(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch podcast show: ${await response.text()}`);
    }

    return await response.json();
  }

  public async getSingleEpisode(episode_id: string, market?: string) {
    let url = `https://api.spotify.com/v1/shows/${episode_id}/episodes`;
    if (market) {
      url += `?market=${market}`;
    }

    const response = await this.makeAuthenticatedRequest(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch podcast episode: ${await response.text()}`);
    }

    return await response.json();
  }
}
