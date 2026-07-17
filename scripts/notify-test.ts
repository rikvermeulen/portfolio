/* eslint-disable no-process-env */

import { stdout as output } from "node:process";

import { config } from "dotenv";

config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

/**
 * Publishes a push notification to your ntfy topic, to verify the setup without
 * going through the app.
 *
 *   npm run notify:test
 *       → sends a default test message.
 *
 *   npm run notify:test "your custom message here"
 */
const main = async () => {
  const topic = (process.env.NTFY_TOPIC ?? "").trim();

  if (!topic) {
    throw new Error(
      "Missing NTFY_TOPIC in .env.local. Install the ntfy app, subscribe to a\n" +
        "private topic (any unguessable name), and set NTFY_TOPIC to it.",
    );
  }

  const server = (process.env.NTFY_SERVER || "https://ntfy.sh").replace(
    /\/+$/,
    "",
  );
  const message =
    process.argv[2] ?? "✅ ntfy test from your dashboard. It works!";

  output.write(`Publishing to ${server}/${topic}…\n`);

  const response = await fetch(`${server}/${topic}`, {
    method: "POST",
    body: message,
    headers: { Title: "Dashboard test" },
  });
  const text = (await response.text().catch(() => "")).trim();

  if (!response.ok) {
    throw new Error(`ntfy ${response.status}: ${text || "unknown error"}`);
  }

  output.write(
    "✅ Sent. Check the ntfy app on your phone — it should arrive instantly.\n",
  );
};

main().catch((error: unknown) => {
  output.write(
    `\n❌ ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
