/* eslint-disable no-restricted-properties -- validated env module / standalone scripts read process.env directly */

import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

import { config } from "dotenv";
import PicnicClient from "picnic-api";

config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

type CountryCode = "NL" | "DE";

const ensureCountryCode = (value?: string): CountryCode => {
  return value === "DE" ? "DE" : "NL";
};

const main = async () => {
  const email = process.env.PICNIC_EMAIL;
  const password = process.env.PICNIC_PASSWORD;
  const countryCode = ensureCountryCode(process.env.PICNIC_COUNTRY_CODE);

  if (!email || !password) {
    throw new Error("Set PICNIC_EMAIL and PICNIC_PASSWORD in your .env first.");
  }

  const client = new PicnicClient({ countryCode });
  const rl = createInterface({ input, output });

  try {
    const login = await client.auth.login(email, password);
    let authKey = login.authKey;

    if (login.secondFactorAuthenticationRequired) {
      await client.auth.generate2FACode("SMS");
      output.write("\nTwo-factor auth is enabled. A code was sent by SMS.\n");
      const otp = (await rl.question("Enter your Picnic 2FA code: ")).trim();

      if (!otp) {
        throw new Error("No 2FA code entered.");
      }

      const verified = await client.auth.verify2FACode(otp);
      authKey = verified.authKey;
    }

    output.write("\nSuccess. Add this to your .env:\n\n");
    output.write(`PICNIC_AUTH_KEY="${authKey}"\n\n`);
    output.write("Then remove PICNIC_PASSWORD from .env.\n");
  } finally {
    rl.close();
  }
};

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown error during Picnic auth.";
  console.error(`\nPicnic auth failed: ${message}`);
  process.exit(1);
});
