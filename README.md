# rikvermeulen.com

Personal portfolio — a single-page **bento-grid dashboard**. A Next.js app that composes a
responsive grid of "bento" tiles, several of which pull live data from third-party
integrations (Spotify, Steam, Planta, Picnic, Supabase, Open-Meteo).

There is **no CMS, database, or i18n layer** — tiles read from typed integration services
in `src/vendors/<vendor>/`, shaped into UI-ready data by domain code in `src/lib/<domain>/`.

## Stack

- **Next.js 16** / **React 19** / **TypeScript 6** (React Compiler enabled in production)
- **Tailwind CSS 4** via `@tailwindcss/postcss` (no `tailwind.config` file)
- **Storybook 10** (`@storybook/nextjs-vite`)
- Animation: **GSAP 3** (lazily loaded) + **framer-motion 12**
- Data/validation: **Zod 4** + `@t3-oss/env-nextjs`; `@supabase/supabase-js`; `picnic-api`; `mapbox-gl`
- Testing: **Jest 30** only (jsdom) — 100% coverage gate on `src/{utils,lib,vendors,hooks}`
- Tooling: husky (git hooks), react-scan (dev perf overlay), ESLint, Stylelint, Prettier
- Runtime: **Node 24** (pinned in `.nvmrc`)

## Getting started

```bash
nvm use                 # Node 24 (.nvmrc)
npm install
cp .env.example .env    # then fill in the values you need (see below)
npm run dev             # http://localhost:3000
```

`src/env.ts` validates env at boot and **throws** if the required keys are missing:
`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ENVIRONMENT` (defaults to `development`),
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SPOTIFY_CLIENT_ID`, and `SPOTIFY_CLIENT_SECRET`.
Everything else is optional — tiles whose optional env vars are absent degrade gracefully.

### Minting integration tokens

```bash
npm run spotify:auth    # local OAuth helper → SPOTIFY_REFRESH_TOKEN
npm run picnic:auth     # interactive Picnic login (SMS 2FA) → PICNIC_AUTH_KEY
npm run planta:auth     # exchange a Planta app code → token row in Supabase (planta_tokens)
npm run notify:test     # send a test push via ntfy (needs NTFY_TOPIC)
```

## Scripts

| Command                   | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `npm run dev`             | Start local Next dev server                        |
| `npm run build`           | Build production bundle                            |
| `npm run start`           | Run production build locally                       |
| `npm run lint`            | ESLint with autofix                                |
| `npm run lint:styles`     | Stylelint with autofix                             |
| `npm run type-check`      | TypeScript without emitting                        |
| `npm run test`            | Jest with coverage                                 |
| `npm run test:watch`      | Jest in watch mode                                 |
| `npm run spotify:auth`    | Mint a Spotify refresh token                       |
| `npm run picnic:auth`     | Mint a Picnic auth key                             |
| `npm run planta:auth`     | Mint Planta tokens                                 |
| `npm run notify:test`     | Send a test ntfy push                              |
| `npm run storybook`       | Start Storybook on :6006                           |
| `npm run build-storybook` | Build static Storybook                             |

## Project structure

```
src/
  app/(dashboard)/   dashboard route — bento-registry.tsx is the single source of tile wiring
  app/api/*          HTTP routes (spotify/token, planta/{plants,remind,nudge}, picnic/*, dev-diagnostics)
  components/        generic reusable UI primitives + Bento grid infra (folder-per-component)
  modules/           feature blocks — Bentos/* (the concrete tiles) and Navigation/*
  hooks/             React hooks (folder-per-hook, named exports)
  contexts/          React contexts (Provider + accessor hook)
  vendors/           third-party transport: client + service + wire types per vendor
  lib/               first-party domain code: types, mappers, formatters per domain
  utils/             pure, project-agnostic helpers (no env, no business logic)
  types/             cross-cutting shared types (Result<T>)
  styles/ assets/    design-system styles and static assets
config/              app config consumed by next.config.ts
scripts/             one-off auth helpers
```

## Conventions

The authoritative rules live in [`CONVENTIONS.md`](CONVENTIONS.md). In short:
folder-per-unit with an `index.ts` barrel; role-based casing (`components/`, `modules/`,
`contexts/` PascalCase — `hooks/`, `utils/`, `lib/` camelCase); components/modules
`default`-export, hooks named-export; env validated with Zod in `src/env.ts` and imported
from `@env`.

The refactor roadmap toward one coherent system is tracked in
[`docs/unification-plan.md`](docs/unification-plan.md).

## Environment variables

See [`.env.example`](.env.example). Required to boot: `NEXT_PUBLIC_APP_URL`,
`NEXT_PUBLIC_ENVIRONMENT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SPOTIFY_CLIENT_ID`,
`SPOTIFY_CLIENT_SECRET`. Everything else is optional. The required/optional split is
enforced by Zod in [`src/env.ts`](src/env.ts).

## Deploying (Vercel)

Hosted on Vercel, Node `24.x` (`engines`). There is no CI — the husky hooks
(`pre-commit`: lint + type-check, `pre-push`: tests) are the gate, so run
`npm run build` locally before pushing to `main`.

Go-live checklist:

1. **Env vars** — set every value from `.env.example` you use in the Vercel
   project (Production). `NEXT_PUBLIC_APP_URL` **must** be
   `https://rikvermeulen.com`: it falls back to `http://localhost:3000`, which
   would leak into `metadataBase`, canonical URLs, `robots.txt` and `sitemap.xml`.
   `NEXT_PUBLIC_ENVIRONMENT=production`.
2. **Secrets stay server-side** — only `NEXT_PUBLIC_*` vars reach the browser.
   `NTFY_TOPIC` acts as a password; pick an unguessable one.
3. **Dev-only routes** — `/api/dev-diagnostics` and `/api/picnic/auth/key`
   no-op / 404 outside `NODE_ENV=development`.
4. **Domain** — add `rikvermeulen.com` (+ `www` redirect) in Vercel → Domains.
5. **Smoke test** the production URL: every tile renders (or degrades), OG image
   at `/opengraph-image`, `robots.txt`, `sitemap.xml`, security headers present.

Known limits on serverless:

- **Planta** rotates its refresh token on every refresh, so local dev and every
  Vercel instance share one token row in Supabase (`planta_tokens`, migration in
  `supabase/migrations/`), written with `SUPABASE_SERVICE_ROLE_KEY`. Env tokens
  only seed an empty table. If the row's token is ever rejected, re-mint with
  `npm run planta:auth <code>`. Two instances refreshing at the same instant can
  still race; the loser's request fails until the next load reads the new row.
- **Spotify playback** runs the Web Playback SDK in the visitor's browser under
  Rik's Premium account, so `/api/spotify/token` has to hand that account's
  access token to the page. It refuses cross-site callers (`Sec-Fetch-Site`),
  is never cached, and reuses one token per hour per instance. The token stays
  readable in devtools, and when two visitors press play at once, the last one
  takes over the stream.
- The Plants "remind" server action (`Plants.actions.ts`) is publicly callable; it
  has a per-instance 30-minute cooldown. Add a Vercel Firewall rate-limit rule if
  pushes still get spammed.
