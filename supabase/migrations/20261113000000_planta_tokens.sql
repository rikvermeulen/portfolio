-- Single-row store for the Planta token pair (see src/vendors/planta/tokenStore.ts).
-- Planta rotates the refresh token on every refresh, so local dev and every
-- Vercel instance must share this one row instead of env vars or a local file.
create table if not exists public.planta_tokens (
  id smallint primary key default 1 check (id = 1),
  access_token text not null,
  refresh_token text,
  token_type text not null default 'Bearer',
  updated_at timestamptz not null default now()
);

-- RLS on with no policies: only the service-role key (server-side) can read or
-- write the tokens; the anon key used elsewhere gets nothing.
alter table public.planta_tokens enable row level security;
