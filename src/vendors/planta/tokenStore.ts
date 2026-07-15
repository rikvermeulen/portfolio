import "server-only";

import type { PlantaTokenSet } from "./types.ts";

import { env } from "@env";

import {
  readPersistedTokens,
  writePersistedTokens,
} from "./tokenPersistence.ts";

/**
 * Process-level cache of the current Planta token set.
 *
 * Planta rotates the refresh token on every refresh and its auth code is
 * single-use, yet tokens previously lived only on the short-lived
 * `PlantaClient` instance. Every cache miss (dev-server restart, the 30-min
 * plants revalidation, a fresh serverless instance) therefore rebuilt a client
 * from env and re-ran the auth waterfall — burning the one-time auth code or
 * replaying an already-rotated refresh token — which quickly gets the account
 * rate-limited/blocked.
 *
 * This module keeps the latest tokens in memory for the lifetime of the server
 * process, seeded from env on first read. The auth code is then exchanged at
 * most once per process and rotated refresh tokens are retained.
 */
let cachedTokens: PlantaTokenSet | null = null;
let seeded = false;

const seedFromEnv = (): PlantaTokenSet | null => {
  const hasAccessToken = Boolean(env.PLANTA_ACCESS_TOKEN);
  const hasRefreshToken = Boolean(env.PLANTA_REFRESH_TOKEN);

  if (!hasAccessToken && !hasRefreshToken) {
    return null;
  }

  return {
    accessToken: env.PLANTA_ACCESS_TOKEN ?? "",
    refreshToken: env.PLANTA_REFRESH_TOKEN,
    tokenType: env.PLANTA_TOKEN_TYPE ?? "Bearer",
  };
};

export const getPlantaTokens = (): PlantaTokenSet | null => {
  if (!seeded) {
    // Durable file (freshest rotated token) wins over the possibly-stale env.
    cachedTokens = readPersistedTokens() ?? seedFromEnv();
    seeded = true;
  }

  return cachedTokens;
};

export const setPlantaTokens = (tokens: PlantaTokenSet): void => {
  cachedTokens = tokens;
  seeded = true;
  writePersistedTokens(tokens);
};

/** Test-only: clears the in-memory cache so env is re-read on next access. */
export const resetPlantaTokens = (): void => {
  cachedTokens = null;
  seeded = false;
};
