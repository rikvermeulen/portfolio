# Unification Plan — one system for `src/`

Goal: collapse the "every feature invented its own shape" sprawl into **one coherent
system** — one directory taxonomy, one file-naming grammar, one integration template,
shared primitives instead of copy-paste, and docs that describe *this* project.

This doc is the tracker + the spec. Work top-down; reference the section in PRs.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done
Priority: **P0** meta/docs truth · **P1** structural gaps · **P2** naming collisions · **P3** reuse/dedup · **P4** polish

---

## Why it feels disconnected (root causes)

The code is actually in decent shape — the disconnection is real but comes from **four
specific fault lines**, not general mess:

1. **The whole doc/rules layer describes a different project.** `CONVENTIONS.md`,
   `AGENTS.md`, `CLAUDE.md`, `AI-WORKFLOWS.md`, `.cursor/rules/*`, and all of `rules/`
   were synced from a shared template for `refugeework-website` (Payload CMS + Postgres +
   i18n + migrations). None of that exists here. They reference `commands/` and
   `.github/copilot-instructions.md` which **don't exist**. So the "source of truth" is
   fiction — every time you read it, the project feels foreign. **This is the biggest
   single driver and the cheapest to fix.**

2. **The integration layer has no shared template.** Eight `lib/` folders, three
   different client styles, the `Result<T>` union reinvented four times, caching applied
   four different ways (and missing on Spotify), error handling done five ways, Zod used
   in exactly one place. Each integration was written from scratch.

3. **The generators (the real, accurate source of truth) are under-used and
   under-scoped.** `plop` scaffolds components/modules/utils correctly and matches the
   repo — but there's no generator for hooks, contexts, or integrations, so those drift.

4. **Small structural gaps break the "folder-per-thing + barrel" contract** just often
   enough (missing `index.ts`, missing types, one default export among named, one CSS
   file among Tailwind) that no rule feels reliable.

Fix those four and the system reads as one thing.

---

## Part A — The target system (rules everything conforms to)

### A.1 Directory taxonomy — what goes where

| Dir | Holds | Folder casing |
|---|---|---|
| `src/components/` | Generic, reusable UI primitives | PascalCase |
| `src/modules/` | Feature blocks (`Bentos/*`, `Navigation/*`) | PascalCase |
| `src/hooks/` | React hooks | camelCase `useX` |
| `src/contexts/` | React contexts (Provider + accessor) | PascalCase |
| `src/lib/` | Project-aware domain code + third-party integrations | camelCase |
| `src/utils/` | **Pure**, project-agnostic helpers, no env, no business logic | camelCase |
| `src/types/` | Cross-cutting shared types only | single `index.ts` |
| `src/app/` | Routes: `(dashboard)` UI + `api/*` HTTP | Next.js convention |
| `config/`, `src/styles/`, `src/assets/` | app config, design tokens, static assets | — |

Casing is role-dependent on purpose — codify it, don't "fix" it.

### A.2 File-naming grammar — canonical suffixes

A unit named `Foo` uses **exactly** these. One spelling per role; kill the variants.

| Role | Canonical | Variants to kill |
|---|---|---|
| Component / impl | `Foo.tsx` / `foo.ts` | — |
| Types | `Foo.types.ts` | bare `types.ts` (all of `lib/*`), `getSecurityHeaders/types.ts` |
| Constants / config | `Foo.const.ts` | `Bento/config.ts`, `getSecurityHeaders/constants.ts` |
| Static data | `Foo.const.ts` (`.data.ts` if large) | `Journal.questions.ts` |
| Local helpers | `Foo.utils.ts` | bare camel helper files |
| Animation logic | **`Foo.animate.ts`** (pick this one project-wide) | `Recipes.animate.ts` is already right; align others |
| Mock / Stories / Test | `Foo.mock.ts` / `Foo.stories.tsx` / `Foo.test.ts(x)` | — |
| Barrel | `index.ts` | — |

### A.3 Barrels

- **Every leaf unit folder has an `index.ts`.** No exceptions.
- Barrel internal path style: **relative `./Foo.tsx`** (shorter, move-safe). Standardize —
  today most use `@/components/...` and `Slider` uses `./`.
- Components/modules: `export { default } from "./Foo.tsx"` + `export type { FooProps }`.
- One export shape per role (see A.4). Drop file-level `/* istanbul ignore file */`
  headers — ignore at the line.

### A.4 Export & typing conventions

- **Components/modules:** `default` export (already 100% consistent — keep).
- **Hooks:** **named** export. Fix the one outlier `useOutsideClick` (currently `default`).
- **Props types:** pick **`interface XProps`** (the majority; the plop template's `type`
  is the minority — update the template, not the 10 components).
- **Contexts:** Provider + accessor hook, accessor named `useXContext`, `export function`,
  `null` default + throw-if-outside-provider. Align `AnimationContext`
  (`useAnimationContext`, non-null default, `const` arrow) to match `SpotifyConnectionContext`
  — or pick the other way, but **pick one**.

### A.5 Imports

- Cross-unit → `@/…` alias; own siblings → relative `./`.
- Always explicit `.ts`/`.tsx` extensions (one file imports without — fix it).
- One env alias: **`@env`** (already the majority) — drop `@/env.ts`.
- Group: third-party → blank line → `@/` internal.

---

## Part B — The integration system (the biggest gap)

Today every `lib/` integration is bespoke. Target: **one template**, so a new integration
is "fill in the client + the domain mapping" and everything else is shared.

### B.1 Canonical integration shape

```
src/lib/<vendor>/
  <vendor>.client.ts    transport only: fetch/SDK, tokens, wire types, throws IntegrationError
  <vendor>.service.ts   env-gate -> cache -> client -> map wire->domain -> return Result<T>
  <vendor>.types.ts     wire shapes + domain types (NOT the Result union — that's shared)
  <vendor>.schema.ts    Zod schemas for wire validation (see B.4)
  index.ts              barrel (only picnic has one today)
  *.test.ts
```

Kill vendor-named files (`supabase.ts` -> `supabase.client.ts`, `photos.ts` -> the supabase
service; `openMeteo.ts` -> `findMe.client.ts`). Decide `client.ts` vs `<vendor>.client.ts`
— recommend the prefixed form so it matches the component grammar.

`glass` and `fonts` are **not** integrations (pure feature/config code) — exclude them from
this template even though they share `lib/`.

### B.2 Adopt the shared `Result<T>` / `StatusResult<T>` (already in `types/index.ts`)

**✅ Mostly already done** (verified 2026-07-12): `steam`, `spotify` (service +
podcast-service), and `planta` (`StatusResult`) already import from `@/types`; `supabase`
too. The earlier line-number targets were stale.
- [~] `lib/findMeConditions` — intentionally a **flat API-response** shape
      (`FindMeConditionsResponse`: success carries `location/weather/airQuality/updatedAt`,
      error uses `error` not `errorMessage`). The route returns this to the client, so it's a
      client contract, not an internal `Result<T>`. **Leave as-is** unless we deliberately
      reshape the find-me API response (decision — not a pure refactor).

### B.3 Shared HTTP + error + cache + env helpers -> `src/lib/integration/` (new)

- [ ] `fetchJson(url, opts)` — the ~7 `if (!res.ok) throw new Error(…status)` sites
      (spotify x4, steam x2, findMe).
- [ ] `IntegrationError` base class — replace the 4 independent subclasses
      (`SteamError`, `PlantaError`, `PlantaUnauthorizedError`, `PicnicError`) and standardize
      `toErrorMessage(err)` (planta/picnic have `to<Vendor>ErrorMessage`; steam/spotify/supabase inline it).
- [ ] `cachedService(key, { tag, revalidate }, fn)` — steam/planta/supabase/picnic each
      hand-write the same `unstable_cache(..., { revalidate, tags })` block. **Spotify is
      missing caching entirely** — this helper closes that gap for free.
- [ ] `requireEnv([...])` — the duplicated "X is not configured" early-return gate in every
      service (each with different phrasing).

### B.4 Runtime validation at the wire boundary

Only **findMe** validates (`openMeteo.ts:92`, `z.parse()`). Everyone else trusts `as`
casts / manual guards (`steam` `isSteamGame`, `picnic/extract.ts`). Standardize:
**wire schema `.parse()` inside the `toDomain` mapper** for every integration. Also tighten
`src/env.ts` — many secrets are `.optional()`, forcing every service to re-check at runtime;
decide required-vs-optional per integration deliberately.

### B.5 API routes — one flow, no bypasses

Two consumption paths is fine (dashboard tiles call services directly; HTTP routes wrap
services). The problem is routes that **don't**:
- [ ] `api/spotify/token/route.ts` re-implements `refreshAccessToken` verbatim from
      `spotify/client.ts:44` -> call the client.
- [ ] `api/picnic/recipes/route.ts:13` calls `fetchSavedPicnicRecipes` (uncached) instead of
      the cached `getPicnicRecipesResult` -> route and tile take different paths to the same
      data. Use the service.
- [ ] `api/picnic/image/route.ts` inlines `fetch` + env -> move into the picnic client.
- [ ] Decide fate of stubs: `api/greeting` (`Hello World!`), `api/contact` (`console.info`
      TODO), `api/dev-diagnostics` (`.spotify-diag.log` sink) — keep, finish, or delete.
- [ ] Route convention: `route -> service -> client`, return the service `Result` mapped to
      an HTTP status. No env reads or crypto in routes except the auth gate.

---

## Part C — The Bento system

The registry (`bento-registry.tsx`) and `asyncTile<T>()` helper are genuinely clean — a
single composition point with the generic bound at definition and erased from the array.
Keep that. The gaps are around the *tiles*:

- **Two homes for a tile.** Infra + shared tile chrome lives in `components/Bento/` and
  `components/AudioBento/`; concrete tiles live in `modules/Bentos/`. `AudioBento` is a
  tile-family component consumed only by Music/Podcast. **Decide** its home (see Decisions).
- [ ] **Shared data-tile props** — `{ items, errorMessage? }` is redeclared per tile
      (`MusicProps`, `PodcastProps`, `PlantsProps`, …). Add `BentoDataProps<T>` +
      `interface WithErrorMessage { readonly errorMessage?: string }` to `types/index.ts`
      and extend it (Music, Plants, Podcast, Recipes, Photos, Games, AudioBento).
- [ ] **Shared empty/error state** — Photos (`Photos.tsx:81`) and Recipes (`Recipes.tsx:34`)
      inline the same centered `text-white/50 on bg-neutral-900` empty `<Bento>`. Create
      `components/Bento/BentoEmptyState.tsx` (`sizes`, `message`, optional `image`) and adopt
      in Recipes, Photos, Games, Plants. (`BentoSkeleton`/`BentoErrorBoundary` already cover
      the Suspense/crash paths — this is the *expected-empty* path.)
- [ ] **Size stated twice** — each data tile hard-codes `sizes={bentoBoxSizes.X}` in its
      body *and* the registry declares `sizeKey` for the skeleton/boundary, with nothing
      enforcing they match. Have the registry pass `sizeKey` down (single source).
- [ ] `bentoBoxSizes` key `findMe` is camelCase; every other key is lowercase — pick one.
- [ ] `modules/Bentos/Personal/` — add `Personal.types.ts` (only tile with no props contract).
- [ ] `modules/Bentos/index.ts` — sort default + type exports into one alphabetical order.

**Spotify player hooks (judgment call).** `useSpotifyMusicPlayer` and
`useSpotifyPodcastPlayer` now both sit on top of `SpotifyConnectionContext`
(`useSharedSpotifyConnection`) + shared `webPlayback.ts` helpers, so the device layer is
already unified. What remains duplicated is the playback wrapper + the structurally
identical return interfaces (`track` vs `episode` URI prefix; rotate-list vs single-uri).
The podcast hook has a deliberate "keep independent" comment. **Decide:** extract a private
`useSpotifyPlayerCore({ items, uriPrefix, buildUris })`, or keep the split. (See Decisions.)

---

## P1 — Structural gaps (mechanical, zero behavior change, do first)

**✅ Phase 1 landed** — tsc clean, 406 tests pass @ 100% coverage, eslint clean.

- [x] `contexts/AnimationContext/` — add `index.ts`
- [x] `components/_dev/ReactScan/` — add `index.ts`
- [ ] `components/_dev/` — decide whether it needs a container barrel like `Cards/` has
- [x] `hooks/useIsLowEndDevice/` — add `index.ts`
- [x] `hooks/useOutsideClick/` — add `index.ts` + switch `default`->named export (+ consumer + test)
- [~] `hooks/useLoadGsap/` — `index.ts` added; **`.test.ts` still TODO** (dynamic-import hook,
      currently `istanbul ignore file`)
- [x] `lib/{steam,spotify,planta,glass,fonts,supabase,findMeConditions}/` — add `index.ts` barrels
- [x] `components/Slider/` — add `Slider.stories.tsx` + `Slider.mock.ts` (barrel already relative `./`)
- [x] `modules/Bentos/Personal/` — add `Personal.types.ts`
- [x] Coverage: exclude re-export `index.ts` barrels from `collectCoverageFrom` +
      drop the 2 defensive `istanbul ignore file` headers (usePrefersReducedMotion, useCopyFeedback)
- [x] Empty scaffolding: deleted `src/constants/`, `src/middleware/`, `src/templates/`
      (zero refs). **Kept** `src/styles/components/`, `src/assets/fonts/` (design-system/font
      locations) and `src/proxy.example.ts` (reference example).

---

## P2 — Naming collisions (rename to the A.2 grammar)

- [ ] `lib/*/types.ts` -> `<vendor>.types.ts` (steam, spotify, planta, picnic, findMe)
- [ ] `lib/supabase/supabase.ts` -> `supabase.client.ts`; `photos.ts` -> the supabase service
- [ ] `lib/findMeConditions/openMeteo.ts` -> `findMe.client.ts`; reconcile folder name
      `findMeConditions` <-> route `find-me/conditions` <-> service naming
- [ ] `lib/planta` <-> route `planta/plants` <-> component `Plants` — pick vendor vs noun and apply
- [ ] `lib/spotify/podcast-service.ts` -> `podcastService.ts` (kebab->camel to match siblings)
- [ ] `components/Bento/config.ts` -> `Bento.const.ts`
- [ ] `utils/getSecurityHeaders/{constants,types}.ts` -> `getSecurityHeaders.{const,types}.ts`
- [ ] `Journal.questions.ts` -> `Journal.const.ts` (or `.data.ts`)
- [ ] `utils/getSecurityHeaders.test.ts` `from "./types"` -> add explicit extension (the one
      no-extension import in the repo)
- [ ] Logging tags: standardize (`[spotify-podcast]` not `[podcast]`, `[photos]` not `[supabase]`)

---

## P3 — Reuse / dedup (by ROI)

### P3.1 Glass presets — 13 ad-hoc `<Glass>` call sites *(highest count)*
Recurring: pill `radius={999}` (x5), faint `intensity={0.05}` (x2), white chip (x2), plus a
local `GLASS` const in `Contact.tsx`.
- [ ] `components/Glass/Glass.const.ts` with `GLASS_PILL`, `GLASS_CHIP`, `GLASS_FAINT`, `GLASS_SHEET`
- [ ] Replace 13 sites (Journal x3, Contact x2, FindMe x2, Recipes x2, Games x2, ToggleGroup x2,
      Slider, AudioControls, AppIcon); delete the local const

### P3.2 Integration helpers — see Part B.2-B.4 (Result, fetchJson, IntegrationError, cachedService, requireEnv, Zod)

### P3.3 Bento data-tile base + empty state — see Part C

### P3.4 Small shared helpers — ✅ done
- [x] `utils/compact` — `compact<T>(arr): NonNullable<T>[]` + adopted in `supabase/photos.ts`
      and `Games.tsx` (×3), with tests
- [x] `lib/spotify/utils.ts` `pickSpotifyImage(images)` — adopted in service + podcast-service, with tests
- [x] hoist `SPOTIFY_DEVICE_NAME` into `lib/spotify/webPlayback.ts`; `SpotifyConnectionContext`
      and both player hooks now import it (was 8 hardcodes)

---

## P4 — Polish
- [ ] Co-locate the design-token-style ms constants (copy-feedback 2000, pulse 600,
      auto-advance 3000) instead of per-file magic numbers
- [ ] Decide the `AudioBento.css` outlier: document co-located CSS as an allowed pattern, or
      migrate to Tailwind (it's the only component CSS file, imported globally via
      `styles/globals.css`)
- [ ] Consistent barrel export shape everywhere; drop file-level istanbul-ignore headers

---

## P0 — Make the docs describe THIS project (do alongside P1)

This is the meta-layer that makes everything feel foreign. Highest emotional ROI.

**✅ Partly landed:** `CONVENTIONS.md` rewritten for the portfolio; `package.json` name fixed
(`project-name` → `rikvermeulen.com`). The synced-asset pruning below is parked on a decision
(edit locally vs upstream to `ai-workflows`, since re-sync would clobber local edits).

- [x] **Rewrite `CONVENTIONS.md`** for the portfolio: name, real stack (Next 16, React 19,
      TS 5.9, Tailwind 4, Storybook 10, GSAP + framer-motion, Zod + `@t3-oss/env-nextjs`,
      Jest **only** — no Vitest, no Payload/Postgres/Sharp), real structure (`(dashboard)`,
      `api`, bentos, integrations), real scripts (`plop`, `spotify:auth`, `picnic:auth`,
      `storybook` — **not** `migrate`/`generate:types`/`generate:icons`/`payload`). Encode
      Parts A + B as the authoritative rules.
- [ ] **Trim `AGENTS.md` / `CLAUDE.md`** — remove references to `commands/` (doesn't exist),
      `.github/copilot-instructions.md` (doesn't exist), `.github/prompts/`, and the
      Payload/CMS/sprint command mappings. Keep only what maps to real files.
- [ ] **Prune `rules/`** — it's CMS-oriented (`payload.md`, `content-blocks.md`,
      `stacks/nextjs-payload.md`, backlog/sprint). Keep the genuinely shared ones
      (`type-safety`, `testing`, `tailwind`, `accessibility`, `object-literals`), delete or
      replace the Payload-specific ones, add a `stacks/nextjs.md` matching this repo.
- [ ] **`.cursor/rules/`** — drop `no-migrations.mdc` and `i18n-dictionaries.mdc` (glob
      `src/i18n/**` which doesn't exist).
- [ ] Add a real root **`README.md`** (there is none).
- [x] Fix `package.json` `"name": "project-name"` -> `rikvermeulen.com`.
- [ ] Per `CLAUDE.md`, upstream the genuinely-reusable rule edits to the `ai-workflows` repo
      rather than only fixing them here.

---

## Elevate the generators (they're the real source of truth)

`plop` is the one part that already matches reality. Extend it so the taxonomy stays true
by construction:
- [ ] Add `.test.ts(x)` to the component/module templates (jest enforces 100% coverage on
      `src/{utils,lib,hooks}` — templates should not fight that)
- [ ] Wire the existing `modules/fragments.ts.hbs` + `animations.ts.hbs` into the module
      generator (or delete them — currently orphaned templates)
- [ ] Add generators: **hook**, **context**, **integration** (`lib/<vendor>` scaffolding the
      Part B shape). This is what stops hooks/contexts/integrations from drifting again.
- [ ] Align the component `types.ts.hbs` to `interface` (A.4) so new components match the majority

---

## Open decisions (need your call to make the plan executable)

1. **Integration file names:** ✅ **DECIDED — `<vendor>.client.ts` (prefixed)**, matches the
   component grammar so the whole repo reads one way.
2. **`vendor/` boundary:** introduce `src/vendor/` for SDK-coupled clients, or keep them in
   `lib/`? — recommend keep in `lib/`.
3. **Spotify player hooks:** extract `useSpotifyPlayerCore`, or keep the deliberate split?
4. **Rename scope:** ✅ **DECIDED — one sweep now** (single import-only churn PR; no
   half-migrated grammar lingering).
5. **Animation-file convention:** standardize on `.animate.ts` (recommend, `Recipes` already uses it).
6. **Empty scaffolding dirs:** delete the `.gitkeep` placeholders, or keep as intended structure?
7. **`AudioBento`/`AudioControls` home:** part of `components/Bento/`, a new `components/Audio/`,
   or leave as-is?
8. **`getSecurityHeaders` / `isExternalUrl`:** both are env/infra-coupled but live in pure
   `utils/` — move to `lib/`?

---

## Suggested execution order

1. **P0 docs + P1 structural gaps** — mechanical, zero behavior change; kills the "foreign
   project" feeling immediately and unblocks consistency.
2. **P3.1 Glass presets + Part B.2 Result + Part C bento base/empty state** — highest-ROI dedup.
3. **Part B.3-B.5 integration helpers + routes** — touches services; test each.
4. **P2 renames** — one sweep, import-only churn.
5. **Generators + `.animate`/final conventions** — lock the system in so it can't drift back.

Each phase: keep `tsc --noEmit` + `jest` green; behavior unchanged (pure refactors).
