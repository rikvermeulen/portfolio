import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

type MiddlewareFunction = (headers: Headers, request: NextRequest) => Headers;

export function applyMiddlewares(
  request: NextRequest,
  middlewares: MiddlewareFunction[] = [],
): NextResponse {
  let headers = new Headers(request.headers);

  // Apply each middleware to modify headers
  for (const middleware of middlewares) {
    headers = middleware(headers, request);
  }

  // Return a response with modified headers
  return NextResponse.next({ request: { headers } });
}

export function proxy(request: NextRequest): NextResponse {
  const middlewares: MiddlewareFunction[] = []; // Example empty array, could add actual middlewares
  const response = applyMiddlewares(request, middlewares);
  return response;
}

/**
 * Configuration for matching routes to apply the middleware.
 */
export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
