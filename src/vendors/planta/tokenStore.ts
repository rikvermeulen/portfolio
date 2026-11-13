import "server-only";

import type { PlantaTokenSet } from "./types.ts";

import { env } from "@env";

import { createSupabaseAdminClient } from "../supabase/admin.ts";
import {
  fromPlantaTokenRow,
  PLANTA_TOKEN_ROW_ID,
  PLANTA_TOKEN_TABLE,
  plantaTokenRowSchema,
  toPlantaTokenRow,
} from "./tokenRow.ts";

/**
 * Durable store for the Planta token pair: one Supabase row shared by local
 * dev and every serverless instance.
 *
 * Planta rotates the refresh token on every refresh and its auth code is
 * single-use, so a token kept per process (or in a file a read-only serverless
 * filesystem can't write) goes stale as soon as any other runtime refreshes.
 * Reading the row on every client creation means each refresh starts from the
 * latest rotation, wherever it happened. Env tokens only seed the first run.
 */
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

/** The stored token pair, or the env seed when nothing is stored yet. */
export async function loadPlantaTokens(): Promise<PlantaTokenSet | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from(PLANTA_TOKEN_TABLE)
    .select("access_token, refresh_token, token_type")
    .eq("id", PLANTA_TOKEN_ROW_ID)
    .maybeSingle();

  if (error) {
    throw new Error(`Planta token load failed: ${error.message}`);
  }

  const row = plantaTokenRowSchema.nullable().parse(data);
  return row ? fromPlantaTokenRow(row) : seedFromEnv();
}

/**
 * Persists a (rotated) token pair. Planta has already invalidated the previous
 * refresh token by now, so a failed save loses the rotation: the stored row is
 * dead until re-minted. Throws loudly with that recovery step.
 */
export async function savePlantaTokens(tokens: PlantaTokenSet): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from(PLANTA_TOKEN_TABLE)
    .upsert(toPlantaTokenRow(tokens));

  if (error) {
    throw new Error(
      `Rotated Planta token could not be saved (${error.message}); the stored token is now invalid, re-run \`npm run planta:auth <code>\`.`,
    );
  }
}
