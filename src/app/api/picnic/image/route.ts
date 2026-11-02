import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { env } from "@env";

// Exactly what `buildPicnicImageUrl` produces. The same host also serves the
// Picnic account API, so the path must be pinned too: this route attaches the
// owner's auth key.
const ALLOWED_HOST = /^storefront-prod\.(nl|de)\.picnicinternational\.com$/;
const ALLOWED_PATH_PREFIX = "/static/images/";

const parseAllowedImageUrl = (raw: string): URL | null => {
  try {
    const url = new URL(raw);

    return url.protocol === "https:" &&
      ALLOWED_HOST.test(url.hostname) &&
      url.pathname.startsWith(ALLOWED_PATH_PREFIX)
      ? url
      : null;
  } catch {
    return null;
  }
};

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  const url = raw ? parseAllowedImageUrl(raw) : null;

  if (!url) {
    return new NextResponse(null, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "x-picnic-auth": env.PICNIC_AUTH_KEY ?? "",
        "User-Agent": "okhttp/4.9.0",
        "Content-Type": "application/json; charset=UTF-8",
        "Accept-Language": "nl",
        "x-picnic-agent": "30100;1.228.1-15480;",
        "x-picnic-did": "3C417201548B2E3B",
      },
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }

  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return new NextResponse(null, { status: 502 });
  }

  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
