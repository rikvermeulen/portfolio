/* eslint-disable no-process-env */

import { exec } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { stdout as output, platform } from "node:process";

import { config } from "dotenv";

config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

// Loopback IP literal — plain http on localhost was banned by Spotify in 2025.
// This exact string must be registered as a Redirect URI in the Spotify
// dashboard: https://developer.spotify.com/dashboard
const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;

// Everything the portfolio needs: SDK playback + read/modify playback state +
// recently played, plus the profile scopes the SDK expects.
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
  "user-read-recently-played",
].join(" ");

interface TokenResponse {
  readonly refresh_token?: string;
  readonly scope?: string;
  readonly error?: string;
  readonly error_description?: string;
}

const openInBrowser = (url: string): void => {
  const opener =
    platform === "darwin"
      ? "open"
      : platform === "win32"
        ? 'start ""'
        : "xdg-open";
  exec(`${opener} "${url}"`, () => {
    // Best-effort; the URL is also printed so the user can open it manually.
  });
};

const exchangeCodeForTokens = async (
  code: string,
  clientId: string,
  clientSecret: string,
): Promise<TokenResponse> => {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );
  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  return (await resp.json()) as TokenResponse;
};

/**
 * Runs the OAuth authorization-code flow entirely on this machine: opens the
 * consent page, catches the redirect on a one-shot local server, exchanges the
 * code, and resolves with the refresh token. The client secret never leaves
 * your machine.
 */
const authorize = (
  clientId: string,
  clientSecret: string,
): Promise<TokenResponse> => {
  const state = randomUUID();
  const authorizeUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: SCOPES,
      redirect_uri: REDIRECT_URI,
      state,
      // Force the account/consent chooser every time. Skipping it lets Spotify
      // silently reuse a stale/wrong browser session, which surfaces as
      // `server_error` on the callback.
      show_dialog: "true",
    }).toString();

  return new Promise<TokenResponse>((resolve, reject) => {
    const server = createServer((req, res) => {
      if (!req.url?.startsWith("/callback")) {
        res.writeHead(404).end();
        return;
      }

      const params = new URL(req.url, REDIRECT_URI).searchParams;
      const finish = (message: string) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<html><body style="font-family:sans-serif;padding:2rem">
          <h2>${message}</h2><p>You can close this tab and return to your terminal.</p>
        </body></html>`);
        server.close();
      };

      if (params.get("error")) {
        finish("Authorization denied.");
        reject(new Error(`Spotify returned: ${params.get("error")}`));
        return;
      }
      if (params.get("state") !== state) {
        finish("State mismatch — aborting.");
        reject(new Error("State mismatch (possible CSRF); aborted."));
        return;
      }

      const code = params.get("code");
      if (!code) {
        finish("No authorization code received.");
        reject(new Error("No authorization code in callback."));
        return;
      }

      exchangeCodeForTokens(code, clientId, clientSecret)
        .then((tokens) => {
          finish("Authorized! Refresh token printed in your terminal.");
          resolve(tokens);
        })
        .catch(reject);
    });

    server.listen(PORT, "127.0.0.1", () => {
      output.write(
        `\nOpening the Spotify consent page (port ${PORT})...\n` +
          `If it doesn't open, paste this URL into your browser:\n\n${authorizeUrl}\n\n`,
      );
      openInBrowser(authorizeUrl);
    });
    server.on("error", reject);
  });
};

const main = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env first.",
    );
  }

  output.write(
    `\nBefore continuing, add this exact Redirect URI in the Spotify dashboard:\n  ${REDIRECT_URI}\n`,
  );

  const tokens = await authorize(clientId, clientSecret);

  if (tokens.error) {
    throw new Error(
      `Token exchange failed: ${tokens.error} — ${tokens.error_description ?? ""}`,
    );
  }
  if (!tokens.refresh_token) {
    throw new Error("No refresh_token returned by Spotify.");
  }

  output.write("\nSuccess. Add (or replace) this line in your .env:\n\n");
  output.write(`SPOTIFY_REFRESH_TOKEN="${tokens.refresh_token}"\n\n`);
  output.write(`Granted scopes: ${tokens.scope ?? "(none reported)"}\n`);
};

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Unknown error during auth.";
    console.error(`\nSpotify auth failed: ${message}`);
    process.exit(1);
  });
