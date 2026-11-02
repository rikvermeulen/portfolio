/* eslint-disable no-restricted-properties -- validated env module / standalone scripts read process.env directly */

import { z } from "zod";

import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  /**
   * Environment variables available on both the client and the server.
   * `NODE_ENV` lives here (not `server`) so client components — e.g. the dev
   * breakpoint indicator — can read it without throwing.
   */
  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]),
  },
  /**
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    SUPABASE_URL: z.string().min(1),
    SUPABASE_ANON_KEY: z.string().min(1),

    // Spotify
    SPOTIFY_CLIENT_ID: z.string().min(1),
    SPOTIFY_CLIENT_SECRET: z.string().min(1),
    SPOTIFY_REFRESH_TOKEN: z.string().optional(),
    SPOTIFY_MARKET: z.string().optional(),

    // Planta
    PLANTA_AUTH_CODE: z.string().optional(),
    PLANTA_ACCESS_TOKEN: z.string().optional(),
    PLANTA_REFRESH_TOKEN: z.string().optional(),
    PLANTA_TOKEN_TYPE: z.string().optional(),

    // Picnic
    PICNIC_EMAIL: z.string().optional(),
    PICNIC_PASSWORD: z.string().optional(),
    PICNIC_AUTH_KEY: z.string().optional(),
    PICNIC_COUNTRY_CODE: z.enum(["NL", "DE"]).optional(),
    PICNIC_AUTH_ADMIN_SECRET: z.string().optional(),

    // Steam
    STEAM_API_KEY: z.string().optional(),
    STEAM_ID: z.string().optional(),

    // Other gaming profiles (links visitors can add / follow)
    XBOX_API_KEY: z.string().optional(), // OpenXBL (xbl.io) key — enables real Xbox data
    XBOX_GAMERTAG: z.string().optional(),
    XBOX_PROFILE_URL: z.string().optional(),

    // ntfy.sh (outbound push notifications → Rik's phone).
    // All optional: when unset, notification sends are skipped, not thrown.
    NTFY_TOPIC: z.string().optional(), // private/unguessable topic name
    NTFY_SERVER: z.string().optional(), // optional self-hosted server URL
  },
  /**
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_ENVIRONMENT: z.string().min(1),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  },
  /**
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    //Server
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN,
    SPOTIFY_MARKET: process.env.SPOTIFY_MARKET,
    PLANTA_AUTH_CODE: process.env.PLANTA_AUTH_CODE,
    PLANTA_ACCESS_TOKEN: process.env.PLANTA_ACCESS_TOKEN,
    PLANTA_REFRESH_TOKEN: process.env.PLANTA_REFRESH_TOKEN,
    PLANTA_TOKEN_TYPE: process.env.PLANTA_TOKEN_TYPE,
    PICNIC_EMAIL: process.env.PICNIC_EMAIL,
    PICNIC_PASSWORD: process.env.PICNIC_PASSWORD,
    PICNIC_AUTH_KEY: process.env.PICNIC_AUTH_KEY,
    PICNIC_COUNTRY_CODE: process.env.PICNIC_COUNTRY_CODE as
      "NL" | "DE" | undefined,
    PICNIC_AUTH_ADMIN_SECRET: process.env.PICNIC_AUTH_ADMIN_SECRET,
    STEAM_API_KEY: process.env.STEAM_API_KEY,
    STEAM_ID: process.env.STEAM_ID,
    XBOX_API_KEY: process.env.XBOX_API_KEY,
    XBOX_GAMERTAG: process.env.XBOX_GAMERTAG,
    XBOX_PROFILE_URL: process.env.XBOX_PROFILE_URL,
    NTFY_TOPIC: process.env.NTFY_TOPIC,
    NTFY_SERVER: process.env.NTFY_SERVER,
    // NOTE: you could set this to process.env.VERCEL_ENV when hosting on Vercel
    NEXT_PUBLIC_ENVIRONMENT:
      process.env.NEXT_PUBLIC_ENVIRONMENT || "development",

    // Client
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
});
