/* eslint-disable no-restricted-properties -- validated env module / standalone scripts read process.env directly */

import { stdout as output } from "node:process";

import { config } from "dotenv";

import { writePersistedTokens } from "../src/vendors/planta/tokenPersistence.ts";

config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

const API_V1_ENDPOINT = "https://public.planta-api.com/v1";

interface PlantaTokenResponse {
  readonly data?: {
    readonly accessToken?: string;
    readonly refreshToken?: string;
    readonly tokenType?: string;
  };
  readonly message?: string;
  readonly errorType?: string;
}

const main = async () => {
  // Accept the code from the CLI (`npm run planta:auth <code>`) or env.
  const code = (process.argv[2] ?? process.env.PLANTA_AUTH_CODE ?? "").trim();

  if (!code) {
    throw new Error(
      "No auth code. Run `npm run planta:auth <code>` or set PLANTA_AUTH_CODE in .env.\n" +
        "Get a code from https://getplanta.com/apps/manage",
    );
  }

  const response = await fetch(`${API_V1_ENDPOINT}/auth/authorize`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  const payload = (await response.json()) as PlantaTokenResponse;

  if (!response.ok || !payload.data?.accessToken) {
    const reason =
      payload.message ?? payload.errorType ?? `HTTP ${response.status}`;
    throw new Error(
      `Planta rejected the code: ${reason}\n` +
        "Auth codes are single-use and expire quickly — grab a fresh one from " +
        "https://getplanta.com/apps/manage and try again.",
    );
  }

  const { accessToken, refreshToken, tokenType } = payload.data;

  // Seed the durable token cache so the app uses these immediately and
  // overwrites any stale (rotated-out) token left over from a previous run.
  writePersistedTokens({
    accessToken,
    refreshToken,
    tokenType: tokenType ?? "Bearer",
  });

  output.write(
    "\nSuccess — wrote .planta-tokens.local.json (the durable cache the app reads).\n",
  );
  output.write("As a backup you can also set these in .env:\n\n");
  output.write(`PLANTA_ACCESS_TOKEN="${accessToken}"\n`);
  output.write(`PLANTA_REFRESH_TOKEN="${refreshToken ?? ""}"\n`);
  output.write(`PLANTA_TOKEN_TYPE="${tokenType ?? "Bearer"}"\n\n`);
  output.write(
    "Rotated refresh tokens are now written back to that file, so a dev-server " +
      "restart no longer resurrects a dead token. Restart the dev server to pick this up.\n",
  );
};

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown error during Planta auth.";
  console.error(`\nPlanta auth failed: ${message}`);
  process.exit(1);
});
