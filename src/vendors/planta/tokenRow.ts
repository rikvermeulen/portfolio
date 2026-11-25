import { z } from "zod";

import type { PlantaTokenSet } from "./types.ts";

/**
 * The single row that holds the current Planta token pair. Planta rotates the
 * refresh token on every refresh, so every environment (local dev, each
 * serverless instance, the auth script) must read and write this one row.
 */
export const PLANTA_TOKEN_TABLE = "planta_tokens";
export const PLANTA_TOKEN_ROW_ID = 1;

export const plantaTokenRowSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().nullable(),
  token_type: z.string(),
});

export type PlantaTokenRow = z.infer<typeof plantaTokenRowSchema>;

export const fromPlantaTokenRow = (row: PlantaTokenRow): PlantaTokenSet => ({
  accessToken: row.access_token,
  refreshToken: row.refresh_token ?? undefined,
  tokenType: row.token_type,
});

/** Upsert payload for the token row, stamped with the write time. */
export const toPlantaTokenRow = (tokens: PlantaTokenSet, now = new Date()) => ({
  id: PLANTA_TOKEN_ROW_ID,
  access_token: tokens.accessToken,
  refresh_token: tokens.refreshToken ?? null,
  token_type: tokens.tokenType ?? "Bearer",
  updated_at: now.toISOString(),
});
