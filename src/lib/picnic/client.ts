import "server-only";

import PicnicClient from "picnic-api";

import { env } from "@env";

export class PicnicError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "PicnicError";
  }
}

type PicnicApiClient = InstanceType<typeof PicnicClient>;

interface LoginResponse {
  readonly authKey: string;
  readonly second_factor_authentication_required: boolean;
}

const getCountryCode = (): "NL" | "DE" => env.PICNIC_COUNTRY_CODE ?? "NL";

/** Creates a Picnic API client configured from environment variables. */
export const createPicnicClientFromEnv = (): PicnicApiClient =>
  new PicnicClient({
    countryCode: getCountryCode(),
    authKey: env.PICNIC_AUTH_KEY,
  });

/**
 * Ensures the Picnic API client has a valid auth key.
 *
 * - When `PICNIC_AUTH_KEY` is set and `forceLogin` is `false`, returns it
 *   immediately without making a network call.
 * - When `forceLogin` is `true` (or when no key is set), logs in with
 *   `PICNIC_EMAIL` + `PICNIC_PASSWORD` and returns the resulting key.
 *
 * @throws {PicnicError} When credentials are missing or 2FA is required.
 */
export const ensurePicnicAuth = async (
  client: PicnicApiClient,
  options?: { readonly forceLogin?: boolean },
): Promise<string | null> => {
  if (!options?.forceLogin && env.PICNIC_AUTH_KEY) {
    return env.PICNIC_AUTH_KEY;
  }

  if (!env.PICNIC_EMAIL || !env.PICNIC_PASSWORD) {
    throw new PicnicError(
      "Missing Picnic credentials. Set PICNIC_AUTH_KEY or PICNIC_EMAIL + PICNIC_PASSWORD.",
    );
  }

  const loginResult = (await client.auth.login(
    env.PICNIC_EMAIL,
    env.PICNIC_PASSWORD,
  )) as LoginResponse;

  if (loginResult.second_factor_authentication_required) {
    throw new PicnicError(
      "Picnic 2FA is required. Create/use PICNIC_AUTH_KEY from an authenticated session.",
    );
  }

  return loginResult.authKey ?? null;
};
