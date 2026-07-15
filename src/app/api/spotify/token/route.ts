import { NextResponse } from "next/server";

import { env } from "@env";

export async function GET() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    env;

  if (!SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

  let resp: Response;
  try {
    resp = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json(
      { error: "Token endpoint unreachable" },
      { status: 504 },
    );
  }

  if (!resp.ok) {
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 502 },
    );
  }

  const data = (await resp.json()) as {
    access_token: string;
    expires_in: number;
  };

  return NextResponse.json({
    token: data.access_token,
    expiresIn: data.expires_in,
  });
}
