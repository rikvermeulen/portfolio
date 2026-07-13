# rikvermeulen.com

Personal portfolio — a single-page **bento-grid dashboard**. A Next.js app that composes a
responsive grid of "bento" tiles, several of which pull live data from third-party
integrations (Spotify, Steam, Planta, Picnic, Supabase, Open-Meteo).

There is **no CMS, database, or i18n layer** — tiles read directly from typed integration
services in `src/lib/<vendor>/`.

## Stack

- **Next.js 16** / **React 19** / **TypeScript 5.9** (React Compiler enabled in production)
- **Tailwind CSS 4** via `@tailwindcss/postcss` (no `tailwind.config` file)
- **Storybook 10** (`@storybook/nextjs-vite`)
- Animation: **GSAP 3** (lazily loaded) + **framer-motion 12**
- Data/validation: **Zod 4** + `@t3-oss/env-nextjs`; `@supabase/supabase-js`; `picnic-api`; `mapbox-gl`
- Testing: **Jest 30** only (jsdom) — 100% coverage gate on `src/{utils,lib,hooks}`
- Tooling: husky (git hooks), react-scan (dev perf overlay), ESLint, Stylelint, Prettier
- Runtime: **Node >=22.11** (see `.nvmrc`)

## Getting started

```bash
nvm use                 # Node 22.11+
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
| `npm run storybook`       | Start Storybook on :6006                           |
| `npm run build-storybook` | Build static Storybook                             |

## Project structure

```
src/
  app/(dashboard)/   dashboard route — bento-registry.tsx is the single source of tile wiring
  app/api/*          HTTP routes (spotify/token, planta, find-me, picnic, dev-diagnostics)
  components/        generic reusable UI primitives + Bento grid infra (folder-per-component)
  modules/           feature blocks — Bentos/* (the concrete tiles) and Navigation/*
  hooks/             React hooks (folder-per-hook, named exports)
  contexts/          React contexts (Provider + accessor hook)
  lib/               project-aware domain code + third-party integration clients/services
  utils/             pure, project-agnostic helpers (no env, no business logic)
  types/             cross-cutting shared types (Result<T>, StatusResult<T>)
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
