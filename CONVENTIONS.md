# CONVENTIONS.md

## Project

Personal portfolio — a single-page **bento-grid dashboard** (rikvermeulen.com). A Next.js
app that composes a responsive grid of "bento" tiles, several of which pull live data from
third-party integrations (Spotify, Steam, Planta, Picnic, Supabase, Open-Meteo).

There is **no CMS, database, or i18n layer** in this project.

## Stack

- Next.js 16, React 19, TypeScript 5.9 (React Compiler enabled via `babel-plugin-react-compiler` + `reactCompiler: true`)
- Tailwind CSS 4 (v4, configured via the `@tailwindcss/postcss` plugin — there is **no** `tailwind.config` file)
- Storybook 10 (`@storybook/nextjs-vite`)
- Animation: GSAP 3 (`@gsap/react`, lazily loaded) + framer-motion 12
- Data/validation: Zod 4 + `@t3-oss/env-nextjs`; `@supabase/supabase-js`; `picnic-api`; `mapbox-gl`
- Testing: **Jest 30 only** (jsdom). No Vitest — `vite` is present only as Storybook's transitive builder.
- Tooling: husky (git hooks), react-scan (dev perf overlay), ESLint (`@greenberry/linting-config`), Stylelint, Prettier
- Runtime: Node `>=22.11` (`.nvmrc`)

## Structure

- `src/app/(dashboard)`: the dashboard route — `layout.tsx` wraps children in `BentoGrid`,
  `page.tsx` maps the registry, `bento-registry.tsx` is the single source of truth for tile order/wiring
- `src/app/api/*`: HTTP routes (spotify/token, planta/plants, find-me/conditions, picnic/\*, dev-diagnostics). The contact form submits via the `submitContact` server action, not an API route
- `src/components`: generic, reusable UI primitives (folder-per-component, PascalCase). Includes the
  Bento grid infrastructure in `components/Bento/` (`Bento`, `AsyncBento`, `BentoGrid`, `BentoSkeleton`, `BentoErrorBoundary`); `AppIcon` in `components/AppIcon/`
- `src/modules`: feature blocks (`Bentos/*` — the 13 concrete tiles — and `Navigation/*`)
- `src/hooks`: React hooks (folder-per-hook, camelCase `useX`, named export)
- `src/contexts`: React contexts (Provider + accessor hook)
- `src/lib`: project-aware domain code + third-party integrations (Spotify, Steam, Planta, Picnic, Supabase, Open-Meteo) plus feature modules `glass` and `fonts`
- `src/utils`: pure, project-agnostic helpers — no env, no business logic (`classnames`, `datetime`, `debounce`, `isExternalUrl`, `playSound`, `getSecurityHeaders`)
- `src/types`: cross-cutting shared types only (`Result<T>`, `StatusResult<T>`)
- `src/styles`, `src/assets`: design-system styles and static assets
- `config/`: app config consumed by `next.config.ts` (`responseHeaders.ts`, `webpackLoaders.ts`)
- `scripts/`: one-off auth helpers (`spotify-auth.ts`, `picnic-auth.ts`)

## Scripts

| Command                   | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `npm run dev`             | Start local Next dev server                         |
| `npm run build`           | Build production bundle                             |
| `npm run start`           | Run production build locally                        |
| `npm run lint`            | Run ESLint with autofix                             |
| `npm run lint:styles`     | Run Stylelint with autofix                          |
| `npm run type-check`      | Run TypeScript without emitting                     |
| `npm run test`            | Run Jest tests (with coverage)                      |
| `npm run test:watch`      | Run Jest in watch mode                              |
| `npm run spotify:auth`    | Local OAuth helper to mint a Spotify refresh token  |
| `npm run picnic:auth`     | Interactive Picnic login (SMS 2FA) to mint auth key |
| `npm run storybook`       | Start Storybook                                     |
| `npm run build-storybook` | Build the static Storybook                          |

## Conventions

### Directory taxonomy & file-naming grammar

- Casing is role-dependent: `components/`, `modules/`, `contexts/` are **PascalCase**;
  `hooks/`, `utils/`, `lib/`, `vendors/` are **camelCase**.
- A unit named `Foo` uses exactly: `Foo.tsx`/`foo.ts`, `Foo.types.ts`, `Foo.const.ts`
  (constants/static data), `Foo.utils.ts` (local helpers), `Foo.animate.ts` (animation
  logic), `Foo.mock.ts`, `Foo.stories.tsx`, `Foo.test.ts(x)`, and an `index.ts` barrel.
- **Every leaf unit folder has an `index.ts` barrel**, using relative `./Foo.tsx` internal paths.
- Components/modules: `default` export. Hooks: **named** export. Props types: `interface XProps`.
- Contexts: Provider + accessor hook (`useXContext`), `null` default + throw-if-outside-provider.

### Vendors & domain (`src/vendors/<vendor>/` + `src/lib/<domain>/`)

Third-party integrations are kept fully separate from first-party domain code:

- **`src/vendors/<vendor>/`** — one folder per third party (`steam`, `xbox`, `spotify`,
  `supabase`, `picnic`, `planta`, `openMeteo`). Strictly transport: a **client**
  (fetch/SDK, tokens, throws a typed error), a **service** (env-gate → cache → client →
  _delegate_ wire→domain mapping to `lib/<domain>` → return `Result<T>`/`StatusResult<T>`),
  and a **types** file holding **wire shapes only**, plus Zod validation at the boundary.
  Imported via `@/vendors/…`. No domain types, formatters, mappers, or URL builders here.
- **`src/lib/<domain>/`** — first-party domain code: the shared domain **types** plus every
  **formatter / mapper / selector / URL builder** that shapes vendor data into UI-ready
  objects. Examples: `lib/games` (Steam/Xbox mappers, art URLs, dedup, playtime formatting,
  a provider aggregator over the `steam`/`xbox` vendors), `lib/plants` (selectors + card
  formatting), `lib/recipes` (extraction, image URLs, card mapper), `lib/music` (track /
  episode mappers, image picking), `lib/weather` (Open-Meteo condition mapping), `lib/photos`.

Dependency direction:

- **Pure domain shaping** (`types`, mappers, formatters, `dedup`, …) never imports a
  vendor's `client`/`service` — it only reads a vendor's wire `types` to map them. No env,
  no I/O.
- A **vendor service imports its domain** to map wire→domain (e.g. `picnic/service` →
  `lib/recipes/toRecipeCard`).
- A domain feature may add a thin **composition/adapter layer** — the aggregator plus its
  provider adapters (e.g. `lib/games/service.ts` + `lib/games/providers/*`). This layer is
  the sanctioned place that _does_ import vendor `service`s and read `@env`: each adapter
  implements the domain's `GameProvider` interface against one vendor, and the aggregator
  composes them. Keep it thin — mapping/logic stays in the pure files.

`src/lib/{glass,fonts}` are feature/config code, not integrations — exempt from the template.
Use the shared `Result<T>`/`StatusResult<T>` from `src/types` — do not re-invent the union.

### Imports

- Cross-unit → `@/…` alias; own siblings → relative `./`. Always explicit `.ts`/`.tsx` extensions.
- Third-party integrations → `@/vendors/<vendor>/…`; first-party domain/UI → `@/…`.
- Env is imported from `@env`.
- Group: third-party → blank line → `@/` internal.

### Components

- Prefer **extracted named function components** over inline helpers that only exist to
  `return` JSX — even small ones. It keeps structure consistent, improves diffs, and avoids
  unstable nested component identities.
- Styling is inline Tailwind via the `classnames()` util. Avoid CSS files (the one exception
  is `AudioBento.css`, imported globally from `styles/globals.css`).
- ESLint extends `@greenberry/linting-config`; discuss local rule changes before adding them.
- Prefer `npx` for one-off package execution over global installs.
- Prefer **explicit object properties** (`{ test, test2 }`) over conditional spreads used
  only to add optional keys. See `rules/object-literals.md`.

## Type Safety

- `strict`, `noUncheckedIndexedAccess`, `checkJs`, and `allowImportingTsExtensions` are enabled.
- `exactOptionalPropertyTypes`, `useUnknownInCatchVariables`, `noPropertyAccessFromIndexSignature`,
  `noFallthroughCasesInSwitch`, and `noImplicitOverride` are not enabled.
- Env boundaries are validated with Zod in `src/env.ts`.
- External data is not trusted because TypeScript types exist nearby — validate at the wire
  boundary (see `rules/type-safety.md`).

## Testing

- Jest is the only test runner. `jest.config.ts` enforces **100% coverage** on
  `src/{utils,lib,hooks}` plus module pure logic (`src/modules/**/*.{utils,validation}.ts`);
  re-export `index.ts` barrels are excluded from collection. Unreachable defensive fallbacks
  (e.g. `?? 0` behind `noUncheckedIndexedAccess`) use `/* istanbul ignore next — reason */`.
- Module-private **hooks** with real logic (`useChat`, `useFindMe*`) are not yet gated; give
  them co-located tests, or move them to `src/hooks/` (gated) once reused.
- Storybook stories double as visual/interaction documentation for components and modules.

## Git hooks (husky)

- `pre-commit`: `lint` + `lint:styles` + `type-check`, then re-stages fixed files.
- `pre-push`: `npm run test`.

## Precedence

1. `CONVENTIONS.md` (this file — project-specific conventions)
2. `rules/` (baseline coding standards)
3. `CLAUDE.md` / `AGENTS.md` (tool adapters)

When `CONVENTIONS.md` conflicts with `rules/`, this file wins.

> Note: `rules/`, `AGENTS.md`, `CLAUDE.md`, and `AI-WORKFLOWS.md` are synced from the shared
> `ai-workflows` template. The Payload-CMS / Jira-workflow material that does not apply here
> has been pruned locally (P0 in `docs/unification-plan.md`); a future re-sync would reintroduce
> it, so the reusable parts of that cleanup still need upstreaming to `ai-workflows`.
