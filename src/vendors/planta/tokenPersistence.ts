import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { PlantaTokenSet } from "./types.ts";

/**
 * Durable, process-independent cache of the Planta token set.
 *
 * Planta rotates the refresh token on every refresh, so the freshest token must
 * outlive the server process — otherwise a dev-server restart re-seeds from the
 * now-stale token in `.env` and gets a 401. Kept as a gitignored JSON file in
 * the project root; best-effort (a read-only FS, e.g. serverless, just falls
 * back to env and in-memory rotation).
 */
export const PLANTA_TOKEN_FILE = join(
  process.cwd(),
  ".planta-tokens.local.json",
);

export const readPersistedTokens = (): PlantaTokenSet | null => {
  try {
    const parsed = JSON.parse(
      readFileSync(PLANTA_TOKEN_FILE, "utf-8"),
    ) as PlantaTokenSet;

    return parsed.accessToken || parsed.refreshToken ? parsed : null;
  } catch {
    return null;
  }
};

export const writePersistedTokens = (tokens: PlantaTokenSet): void => {
  try {
    writeFileSync(
      PLANTA_TOKEN_FILE,
      `${JSON.stringify(tokens, null, 2)}\n`,
      "utf-8",
    );
  } catch {
    // Best-effort: a read-only FS (serverless) keeps in-memory rotation only.
  }
};
