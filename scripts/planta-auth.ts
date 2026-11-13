/* eslint-disable no-restricted-properties -- validated env module / standalone scripts read process.env directly */

import { stdout as output } from "node:process";

import { config } from "dotenv";

import { createClient } from "@supabase/supabase-js";

import {
  PLANTA_TOKEN_TABLE,
  toPlantaTokenRow,
} from "../src/vendors/planta/tokenRow.ts";

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
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env: the tokens are stored in Supabase.",
    );
  }

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

  // Overwrite the shared token row: local dev and every Vercel instance read
  // it, so a stale (rotated-out) token from a previous run can't come back.
  const { error } = await createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
    },
  )
    .from(PLANTA_TOKEN_TABLE)
    .upsert(
      toPlantaTokenRow({
        accessToken,
        refreshToken,
        tokenType: tokenType ?? "Bearer",
      }),
    );

  if (error) {
    throw new Error(`Could not store the tokens in Supabase: ${error.message}`);
  }

  output.write(
    `\nSuccess: stored the Planta tokens in Supabase (${PLANTA_TOKEN_TABLE}).\n` +
      "Local dev and Vercel both pick them up on their next plants load.\n",
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
