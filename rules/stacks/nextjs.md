# Stack: Next.js App Router (this repo)

Concrete folder mapping for **rikvermeulen.com** — a single-page bento-grid
dashboard. Next.js 16 App Router, React 19, TypeScript 5.9, Tailwind 4.
**No CMS, no database ORM, no i18n, no server-side migrations.** Live data
comes from third-party HTTP/SDK integrations under `src/lib/<vendor>/`.

This file expresses `clean-architecture.md` in this project's actual structure.
When it conflicts with `CONVENTIONS.md`, `CONVENTIONS.md` wins.

## Folder → CA layer

| Folder | Layer | Holds |
| --- | --- | --- |
| `src/app/(dashboard)/` | Presentation | Route UI: `layout.tsx`, `page.tsx`, `bento-registry.tsx` (single source of truth for tile order/wiring) |
| `src/app/api/*/route.ts` | Presentation → Application edge | HTTP routes. Thin: `route → service → client`, return the service `Result` mapped to an HTTP status. No env reads or crypto in routes except an auth gate |
| `src/components/` | Presentation | Generic reusable UI primitives (folder-per-component, PascalCase) |
| `src/modules/` | Presentation | Feature blocks — `Bentos/*` concrete tiles, `Navigation/*` |
| `src/hooks/` | Application | React hooks encoding one operation (`useX`, camelCase, **named** export) |
| `src/contexts/` | Application | React contexts (Provider + `useXContext` accessor) |
| `src/lib/<vendor>/` | Infrastructure | Third-party integrations: client (transport) + service (env-gate → cache → map → `Result<T>`) + types + Zod schema |
| `src/lib/{glass,fonts}/` | — | Feature/config code, **not** integrations — exempt from the integration template |
| `src/utils/` | Domain-ish / pure | Project-agnostic helpers, no env, no business logic |
| `src/types/` | Domain | Cross-cutting shared types (`Result<T>`, `StatusResult<T>`) |

## Rules

- **Default to Server Components.** `"use client"` only for event handlers, hooks,
  browser APIs, or client-only libraries. The dashboard tiles that fetch live data
  call their service directly (Server Component); interactive tiles are client.
- **React Compiler is on** (`babel-plugin-react-compiler` + `reactCompiler: true`).
  Do **not** hand-write `React.memo` / `useCallback` / `useMemo` for memoization —
  the compiler handles it. See the perf notes in `CONVENTIONS.md`.
- **Integrations follow one template** (see `CONVENTIONS.md` → Integrations):
  client throws a typed error, service returns `Result<T>`/`StatusResult<T>` from
  `@/types`, Zod validates at the wire boundary.
- **Tailwind 4, no config file** — styling is inline via the `classnames()` util;
  avoid CSS files. See `tailwind.md`.
- **Jest only** (no Vitest). 100% coverage gate on `src/{utils,lib,hooks}`. See `testing.md`.

## Forbidden here

- ❌ Business logic or direct `fetch`/SDK calls inside components — go through a hook or service
- ❌ API routes that re-implement client/service logic instead of calling it
- ❌ Env reads outside `src/env.ts` (imported as `@env`) or an integration service's env-gate
- ❌ Assuming Payload/CMS, database, or i18n folders — they don't exist in this repo
