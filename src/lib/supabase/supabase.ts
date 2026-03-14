import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/env.ts";
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a new Supabase client instance for server-side operations.
 * This function should be called per request in server components to ensure
 * proper isolation and avoid sharing state between requests.
 *
 * @returns A configured Supabase client instance
 * @throws Error if Supabase URL or Anon Key are missing
 */
export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and/or Anon Key are missing.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
