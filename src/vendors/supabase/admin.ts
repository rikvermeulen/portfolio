import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@env";
import { createClient } from "@supabase/supabase-js";

/** Service-role client for server-side reads/writes of RLS-locked tables. */
export function createSupabaseAdminClient(): SupabaseClient {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env;

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
