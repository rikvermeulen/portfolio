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
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GITHUB_CLIENT_TOKEN: process.env.GITHUB_CLIENT_TOKEN,
    GITHUB_CLIENT_USERNAME: process.env.GITHUB_CLIENT_USERNAME,
  },
});
