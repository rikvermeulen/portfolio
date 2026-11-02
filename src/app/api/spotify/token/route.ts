import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { getSpotifyPlaybackTokenResult } from "@/vendors/spotify/service.ts";

// The token is a live credential: never let a CDN or browser cache keep it.
const NO_STORE = { "Cache-Control": "no-store, private" };

/**
 * Access token for the in-page Web Playback SDK. The SDK runs in the visitor's
 * browser, so the token is visitor-readable by design; this route only stops
 * other sites from fetching it and keeps Spotify calls to one per token life.
 */
export async function GET(request: NextRequest) {
  // Browsers always send Sec-Fetch-Site on fetch; only our own page may ask.
  if (request.headers.get("sec-fetch-site") !== "same-origin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: NO_STORE },
    );
  }

  const result = await getSpotifyPlaybackTokenResult();
  if (!result.ok) {
    return NextResponse.json(
      { error: result.errorMessage },
      { status: 502, headers: NO_STORE },
    );
  }

  return NextResponse.json(result.data, { headers: NO_STORE });
}
