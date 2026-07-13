import type { XboxAccountResponse, XboxTitleHistoryResponse } from "./types.ts";

const OPENXBL_API_URL = "https://xbl.io/api/v2";

// OpenXBL's free tier is request-limited and the profile barely changes, so
// cache aggressively — refresh at most once a day.
const REVALIDATE_SECONDS = 60 * 60 * 24;

export class XboxError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "XboxError";
  }
}

// A concrete Accept-Language is required — Xbox Live rejects the `*` that the
// server runtime otherwise sends (400 "invalid locale value: *").
function xboxHeaders(apiKey: string): HeadersInit {
  return {
    "X-Authorization": apiKey,
    Accept: "application/json",
    "Accept-Language": "en-US",
  };
}

/**
 * The authenticated user's Xbox profile via OpenXBL (xbl.io) — an unofficial
 * Xbox Live gateway. The API key (minted once by signing into xbl.io with a
 * Microsoft account) is passed in the `X-Authorization` header, so no token
 * exchange is needed here.
 */
export async function fetchXboxAccount(
  apiKey: string,
): Promise<XboxAccountResponse> {
  const response = await fetch(`${OPENXBL_API_URL}/account`, {
    headers: xboxHeaders(apiKey),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new XboxError(`Xbox account fetch failed: ${response.status}`);
  }

  return response.json() as Promise<XboxAccountResponse>;
}

/**
 * The authenticated user's recently-played Xbox titles via OpenXBL. Same key +
 * caching as {@link fetchXboxAccount}.
 */
export async function fetchXboxTitleHistory(
  apiKey: string,
): Promise<XboxTitleHistoryResponse> {
  const response = await fetch(`${OPENXBL_API_URL}/player/titleHistory`, {
    headers: xboxHeaders(apiKey),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new XboxError(`Xbox title-history fetch failed: ${response.status}`);
  }

  return response.json() as Promise<XboxTitleHistoryResponse>;
}
