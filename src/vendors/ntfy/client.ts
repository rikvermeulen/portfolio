import "server-only";

import type { NtfySendResult } from "./types.ts";

import { env } from "@env";

const DEFAULT_SERVER = "https://ntfy.sh";
const REQUEST_TIMEOUT_MS = 15_000 as const;

/**
 * True when ntfy is configured. When false, callers treat sends as a no-op
 * (`skipped`) rather than an error, so the app works before it's set up.
 */
export const isNtfyConfigured = (): boolean => Boolean(env.NTFY_TOPIC);

/**
 * Publishes a push notification to the configured ntfy topic (Rik's phone).
 * The topic name is the only secret — anyone who knows it can read/publish, so
 * keep it unguessable. Emoji belong in `body` (UTF-8); `title` stays ASCII
 * because it rides in an HTTP header.
 */
export const sendNotification = async (
  body: string,
  title?: string,
): Promise<NtfySendResult> => {
  const topic = env.NTFY_TOPIC;

  if (!topic) {
    return { ok: false, skipped: true };
  }

  const server = (env.NTFY_SERVER ?? DEFAULT_SERVER).replace(/\/+$/, "");

  let response: Response;

  try {
    response = await fetch(`${server}/${topic}`, {
      method: "POST",
      body,
      headers: title ? { Title: title } : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const detail =
      error instanceof Error && error.name === "TimeoutError"
        ? "ntfy request timed out."
        : error instanceof Error
          ? error.message
          : "ntfy network request failed.";

    return { ok: false, skipped: false, error: detail };
  }

  if (!response.ok) {
    const text = (await response.text().catch(() => "")).trim();
    return {
      ok: false,
      skipped: false,
      error: text || `HTTP ${response.status}`,
    };
  }

  return { ok: true };
};
