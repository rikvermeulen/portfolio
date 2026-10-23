# Maintenance sweep — 2026-10-23

> **Fixes applied same day** (after the sweep, on user go): `next` 16.2.10 →
> 16.4.2 and `npm audit fix` → **both criticals cleared, 34 vulns → 12**
> (remaining 12 all `braces`, dev-only, no fix available upstream — parked).
> 16.4's breaking removal of `experimental.turbopackMemoryLimit` was caught by
> the rebuild; the knob (gone from Next's API) was removed from `next.config.ts`.
> Re-verified: 619 tests pass, `next build` clean (18 routes). Not committed.


First sweep (no prior report → no deltas). Scope: full, **local only**,
report-only. Personal project; no GitLab CI and no Prepr CMS, so the CI,
credential-probe, delivery-metrics and migration lanes mostly don't apply.

## Verdict per lane

| Lane | Verdict | One-liner |
| --- | --- | --- |
| A. Dependencies & vulns | **urgent** | 34 audit findings incl. 2 critical (`next`, `storybook`); in-range fixes exist |
| B. Runtime & EOL | attention | `.nvmrc` 24.11.0 trails running 24.18.1; `engines` says `>=22.11.0` |
| C. Credentials | attention | `.env` ↔ `.env.example` drift; not probed (local, not requested) |
| D. Quality baseline | **ok** | type-check ✓, 619 tests ✓, build ✓, eslint 0 errors |
| E. Repo/CI | n/a | GitHub repo, no CI config present |
| F. Data/migrations/jobs | n/a | no migration or job tooling in repo |
| G. Docs drift | attention | `.env.example` missing 6 live vars |

## Inventory

- **App**: `rikvermeulen.com` (personal portfolio/dashboard), private.
- **Stack**: Next `^16.2.10`, React `19.2.7`, Tailwind `^4.3.2`, TypeScript
  `^6.0.3`, React Compiler `babel-plugin-react-compiler@1.0.0`.
- **Package manager**: npm (`package-lock.json`). Running Node v24.18.1 / npm 11.16.0.
- **Runtime pin**: `.nvmrc` 24.11.0; `engines.node` `>=22.11.0`.
- **Hosting**: Vercel (`VERCEL_ENV` present). No CI config in repo.
- **External services** (from deps + env): Supabase, Mapbox, Spotify, Picnic,
  Planta, Steam, Xbox (OpenXBL), OpenAI, ntfy, a private GSAP + component library.
- **Scripts**: `dev build start lint lint:styles type-check test storybook` + auth helpers.

## Findings (ranked)

### URGENT

**A1 — `next` critical CVEs (prod dependency).** `npm audit` flags installed
`next@16.2.10` critical: Image-Optimization RCE (SVG/AVIF), SSRF, cache
poisoning, Server-Action DoS, `next/og` RCE. In-range fix: `next@16.4.2`
(`^16.2.10` already permits it). Impact: deployed site runs a version with
known unauthenticated RCE/SSRF classes. **Fix:** `npm update next` (non-breaking,
stays in range), then build + smoke test.

**A2 — `storybook` critical (dev-only).** `storybook@10.5.0`: missing origin
validation in preview → code injection from a malicious website / local
network while the dev server runs. In-range fix: `storybook@10.6.3` (+ its
addons/plugin, all 10.6.3). Dev-surface only, not shipped. **Fix:** part of
`npm audit fix` / `npm update`.

### HIGH

**A3 — 28 high vulns in build tooling** (`svgo` via `@svgr/webpack`, `vite` via
`storybook`/`vite-plugin-svgr`). All dev/build-time, none in the runtime
bundle. `npm audit fix` resolves the in-range ones without `--force`. Verify
nothing shipped depends on the vulnerable `svgo` path at runtime (it doesn't —
svgr is a webpack/vite loader).

### MEDIUM

**B1 — Node pin drift.** `.nvmrc` 24.11.0 vs running 24.18.1 vs
`engines.node >=22.11.0` — three different statements. No CI to enforce it, so
low blast radius, but a `nvm use` here installs 24.11.0 while you've been
testing on 24.18.1. **Fix:** bump `.nvmrc` to the 24.x you actually run (24.18.1)
and tighten `engines` if you want a floor.

**G1 — `.env.example` out of date.** Live vars not in the contract:
`COMPONENT_LIBRARY_REPO_TOKEN`, `COMPONENT_LIBRARY_REPO_URL`, `GSAP_AUTH_TOKEN`,
`OPENAI_API_KEY`, `SPOTIFY_PLAYLIST_ID`, `SUPABASE_SERVICE_ROLE_KEY`,
`VERCEL_ENV`. And `.env.example` documents two the local `.env` lacks:
`NEXT_PUBLIC_ENVIRONMENT`, `NTFY_SERVER` (likely have code defaults — confirm).
**Fix:** reconcile `.env.example` (names only, no values). Note
`SUPABASE_SERVICE_ROLE_KEY` is a server secret — keep it out of any
`NEXT_PUBLIC_` path.

### LOW / PARKED

- **Outdated majors** (no security pressure): `framer-motion` 12→14,
  `picnic-api` 4→5, `typescript` 6→7, `dotenv` 17→18,
  `@testing-library/jest-dom` 6→7, `@types/react(-dom)` 19.2→19.3. Each is a
  deliberate upgrade with its own changelog read — not part of this sweep.
- **In-range patch backlog**: supabase-js, mapbox-gl, eslint, typescript-eslint,
  sass, jest, zod, react-aria-components, tailwind all have newer wanted
  patches. Picked up by a routine `npm update`.
- **eslint 44 warnings, 0 errors** — mostly `button` missing `type` in one
  file and one intentional `dangerouslySetInnerHTML` in `JsonLd.tsx`. Not
  blocking; fix opportunistically on lines you already touch.
- **Build-time fetch noise**: build logged `[spotify] DYNAMIC_SERVER_USAGE`
  (route `/` is correctly dynamic — expected) and `[xbox] 429 rate limit`
  (transient). Both are caught/logged; build completed 18/18 routes. Not a
  defect.

## Verified current (2026-10-23)

- `tsc --noEmit`: clean.
- `jest`: 68 suites / 619 tests pass; vendor layer 100% coverage.
- `next build`: succeeds, 18 routes.
- `eslint .`: 0 errors.

## Credentials — NOT probed

Local-only scope, and you didn't ask to verify live keys, so no credential was
probed against its service. All service keys are present in `.env`. If you want
liveness checks (Supabase, Spotify, Mapbox, Picnic, Planta, OpenAI), say so and
I'll probe read-only by fingerprint without printing values.

## Manual checks for you (dashboard-only)

- Vercel env vars match `.env` for the vars above (esp. the 6 undocumented ones).
- `COMPONENT_LIBRARY_REPO_TOKEN` / `GSAP_AUTH_TOKEN` expiry — if either lapses,
  `npm install` breaks on the private deps.

## Proposed backlog items (confirm before I create any)

1. **[urgent] Bump `next` to 16.4.2** — clears critical RCE/SSRF CVEs (A1).
2. **[high] `npm audit fix` dev tooling** (storybook 10.6.3, svgo, vite) (A2/A3).
3. **[medium] Reconcile `.nvmrc` + `engines` + `.env.example`** (B1/G1).

A1+A2+A3 are one `npm update` / `npm audit fix` MR; #3 is a docs/config MR.
