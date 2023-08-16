import { NextResponse } from 'next/server';
import axios from 'axios';
import { env } from 'env.mjs';

export async function GET() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = env;

  const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.error();
  }
}
