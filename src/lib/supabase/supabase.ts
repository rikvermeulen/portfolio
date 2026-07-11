import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/env.ts";
import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient(): SupabaseClient {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL and/or Anon Key are missing.");
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
