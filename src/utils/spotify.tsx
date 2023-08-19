export class Spotify {
  private accessToken: string = '';
  private refreshToken: string = '';
  private clientId: string;
  private clientSecret: string;
  private tokenExpiry: Date = new Date(Date.now() + 3600 * 1000);
  private redirectUri: string = 'https://www.rikvermeulen.com/callback';

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private getBasicAuth(): string {
    return Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
  }

  private updateTokens(data: any) {
    if (data.access_token) {
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    }
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }
  }

  private async fetchToken(body: URLSearchParams): Promise<Response> {
    return await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.getBasicAuth()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
  }

  private async handleTokenResponse(
    response: Response,
    checkRefreshToken: boolean = false,
  ): Promise<boolean> {
    if (!response.ok) {
      console.error('Error fetching token:', await response.text());
      return false;
    }

    const data = await response.json();
    this.updateTokens(data);

    if (checkRefreshToken) {
      return !!data.access_token && !!data.refresh_token;
    }

    return !!data.access_token;
  }

  public async initializeWithClientCredentials(): Promise<boolean> {
    const response = await this.fetchToken(
      new URLSearchParams({ grant_type: 'client_credentials' }),
    );
    return this.handleTokenResponse(response);
  }

  public async initializeWithCode(authCode: string): Promise<boolean> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: this.redirectUri,
    });
    const response = await this.fetchToken(body);
    return this.handleTokenResponse(response, true);
  }

  public async refreshAccessToken(): Promise<boolean> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    });
    const response = await this.fetchToken(body);
    return this.handleTokenResponse(response);
  }

  public tokenIsExpired(): boolean {
    const bufferTimeInMs = 60000;
    return this.tokenExpiry.getTime() - bufferTimeInMs <= Date.now();
  }

  public async ensureToken(): Promise<void> {
    if (this.tokenIsExpired() && !this.refreshToken) {
      throw new Error('Access token expired and no refresh token available.');
    } else if (this.tokenIsExpired()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        throw new Error('Failed to refresh the access token.');
      }
    } else if (!this.accessToken) {
      throw new Error('No access token available.');
    }
  }

  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {},
    retryCount: number = 2,
  ): Promise<Response> {
    await this.ensureToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (response.status === 401 && retryCount > 0) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        throw new Error('Failed to refresh the access token.');
      }
      return await this.makeAuthenticatedRequest(url, options, retryCount - 1);
    } else if (response.status === 401) {
      throw new Error('Unauthorized. Token may be invalid or expired.');
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
