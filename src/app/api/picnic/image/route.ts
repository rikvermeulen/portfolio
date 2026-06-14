import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { env } from "@env";

const ALLOWED_HOST = ".picnicinternational.com";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !url.includes(ALLOWED_HOST)) {
    return new NextResponse(null, { status: 400 });
  }

  const response = await fetch(url, {
    headers: {
      "x-picnic-auth": env.PICNIC_AUTH_KEY ?? "",
      "User-Agent": "okhttp/4.9.0",
      "Content-Type": "application/json; charset=UTF-8",
      "Accept-Language": "nl",
      "x-picnic-agent": "30100;1.228.1-15480;",
      "x-picnic-did": "3C417201548B2E3B",
    },
  });

  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }

  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
