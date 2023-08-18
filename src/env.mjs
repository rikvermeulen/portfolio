import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * @t3-oss/env-nextjs will validate your environment variables
 * @see https://env.t3.gg/docs/nextjs
 */

export const env = createEnv({
  server: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    GITHUB_CLIENT_TOKEN: z.string().min(1),
    GITHUB_CLIENT_USERNAME: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    SPOTIFY_CLIENT_ID: z.string().min(1),
    SPOTIFY_CLIENT_SECRET: z.string().min(1),
    SPOTIFY_CLIENT_ACCESS_TOKEN: z.string().min(1),
    TMDB_CLIENT_KEY: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_PRISMA: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GITHUB_CLIENT_TOKEN: process.env.GITHUB_CLIENT_TOKEN,
    GITHUB_CLIENT_USERNAME: process.env.GITHUB_CLIENT_USERNAME,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    SPOTIFY_CLIENT_ACCESS_TOKEN: process.env.SPOTIFY_CLIENT_ACCESS_TOKEN,
    TMDB_CLIENT_KEY: process.env.TMDB_CLIENT_KEY,
    NEXT_PUBLIC_SUPABASE_PRISMA: process.env.NEXT_PUBLIC_SUPABASE_PRISMA,
  },
});
