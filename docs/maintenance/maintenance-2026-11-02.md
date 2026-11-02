# Maintenance sweep — 2026-11-02

Second sweep; deltas against [2026-10-23](maintenance-2026-10-23.md). Scope:
full, **local only**, report + fixes (user go: "fix everything"). Personal
project on Vercel, no CI config, no CMS — lanes E (CI), F and H stay n/a.

## Progress

| Item | Status | Evidence (2026-11-02) |
| --- | --- | --- |
| Security: storybook critical, 13 highs | **fixed, uncommitted** | `npm update` → audit 75 → 55, 0 high/critical |
| Node pin behind security release | **fixed, uncommitted** | `.nvmrc` 24.11.0 → 24.22.1, `engines` `24.x` |
| In-range updates (31 packages) | **fixed, uncommitted** | `next` 16.4.4, `zod` 4.6.7, storybook 10.6.5, … |
| React 19.2.7 → 19.3.1 (+ types 19.3) | **fixed, uncommitted** | tests + build green |
| `dotenv` 18, `@testing-library/jest-dom` 7 | **fixed, uncommitted** | tests + scripts import check green |
| Lint regression from linting-config 1.1 | **fixed, uncommitted** | 87 errors / 54 warnings → 0 / 0 |
| JSON-LD `</script>` injection | **fixed, uncommitted** | escapes `<`; new `JsonLd.test.tsx` |
| `.env.example` drift | **fixed, uncommitted** | `NEXT_PUBLIC_REACT_SCAN` documented |
| `framer-motion` 12 → 14 | **fixed, uncommitted** | no API changes needed; visual check pending |
| `picnic-api` 4 → 5 | **fixed, uncommitted** | 4 files migrated, +1 test; live 2FA check pending |
| `typescript` 6 → 7 | **blocked** | `typescript-eslint@8.72.1` peer `<6.1.0` |
| Deploy (Vercel) | not done | nothing committed or pushed |

## Verdict per lane

| Lane | Verdict | Delta vs 10-23 |
| --- | --- | --- |
| A. Dependencies & vulns | ok (after fix) | regressed to 75 incl. critical, now 55 moderate/low |
| B. Runtime & EOL | ok (after fix) | pin was 3 security releases behind |
| C. Credentials | attention | 5 unused secrets in local `.env`; not probed |
| D. Quality baseline | ok | 627 tests, lint 0/0 (was 0/44) |
| E. Repo/CI | attention | 2 stale merged branches, 2 old stashes |
| F / H | n/a | — |
| G. Docs drift | ok (after fix) | README/CONVENTIONS Node + TS versions corrected |

## Findings

### A — Dependencies (was urgent)

In 10 days the audit went from 12 to **75** (1 critical, 13 high): new
advisories against the *installed* versions, not new packages.

- `storybook` 10.5.0 **critical** (GHSA-f2ph-cmg5-wxc8, GHSA-px85-f4q5-jh77):
  the dev server accepts code injection from websites/local network. The
  10-23 `audit fix` never landed the 10.6.x bump in `package-lock.json`.
- `zod` <4.6.6 **high**, a **prod** dependency (GHSA-mrhx-c7xc-m3w5, memory
  exhaustion on oversized constrained collections). Reachable through the
  Server Action and API-route validation.
- `vite` ≤8.1.5, `fast-uri`, `browserslist`, `image-size`, `source-map-js`,
  `immutable`: high, dev/build only.

Fix: `npm update` + `npm audit fix` on the pinned runtime. **What remains (55,
moderate/low, dev-only, no non-breaking fix upstream):** `glob` / `minimatch`
via jest 30 and the eslint chain, `deepmerge` via `@svgr/webpack`. Parked.

Deliberately not done:

- **`typescript` 7**: `typescript-eslint` (latest 8.72.1) declares
  `typescript >=4.8.4 <6.1.0`. Wait for typescript-eslint support.
- `framer-motion` 14 and `picnic-api` 5: done, see the research section at the
  bottom.

### B — Runtime

Node 24 published security release **24.22.1** (2026-10-20); the repo pinned
24.11.0 and ran 24.18.1. `.nvmrc` now pins 24.22.1 (installed locally), and
`engines.node` moved from `>=22.11.0` to `24.x`. The open-ended range let
Vercel choose the Node major; `24.x` pins it. npm 11.19.1 (bundled with 24.22.1)
regenerated the lockfile. Node 24 is LTS "Krypton", EOL 2028-04: no EOL in the
6-month window.

### C — Credentials (not probed)

Five variables in the local `.env` are not read by any code, script or config:
`COMPONENT_LIBRARY_REPO_TOKEN`, `COMPONENT_LIBRARY_REPO_URL`,
`GSAP_AUTH_TOKEN`, `OPENAI_API_KEY`, `SPOTIFY_PLAYLIST_ID`, plus
`SUPABASE_SERVICE_ROLE_KEY`. Correction to 10-23: they should be **removed,
not documented**. A secret nothing reads is only leak surface; delete it from
`.env` and Vercel and revoke the vendor key (OpenAI and the Supabase service
role are the ones that matter). `.env` was not touched; it's yours.
`VERCEL_ENV` is injected by Vercel and needs no entry.

No liveness probes: local scope and not requested. Values never printed.

### D — Quality

- `tsc --noEmit` clean · jest 69 suites / **620** tests · `next build` 18
  routes · `storybook build` ok · stylelint clean · eslint **0 errors / 0
  warnings**.
- `@greenberry/linting-config` 1.0 → 1.1 added rules, which caused 87 errors:
  - `no-process-env` became `no-restricted-properties`: the 7 existing file-level
    disables (env module, scripts, response headers, instrumentation) now point
    at the new rule.
  - `storybook/no-title-property-in-meta` (38): `.storybook/main.ts` now
    uses directory specifiers with `titlePrefix`, and the meta `title`s are
    gone. The sidebar is identical except `Components/Audio/*` and
    `Components/_dev/*`, which gained their folder level. **Story IDs for
    those 4 changed**, so update any bookmarked deep links.
  - `@eslint-react/immutability` on framer-motion `controls`/MotionValue
    `.set()` in `SkipIcon` and `ToggleGroup`: false positive, the
    imperative API is used in handlers and effects only, so a reasoned
    file-level disable. `Glass` reads a ref during render on purpose (the
    comment explains why), so a reasoned line disable.
  - `slot.test.tsx` uses `createRef` instead of mutating a closure;
    `Photos.tsx` got `curly`; 44 button-type, anchor-text and prettier fixes
    in `FocusTrap.test.tsx` / `env.ts` / `xbox/types.ts`.
- **Security fix:** `JsonLd` passed raw `JSON.stringify` output to
  `dangerouslySetInnerHTML`. A value containing `</script>` would break
  out of the tag. It now escapes `<` as `\u003c` (Next.js docs pattern), with
  a regression test.
- Debt counters: `@ts-expect-error` 1 (intentional, Slot test), real `any` 0,
  `TODO/FIXME` 0, skipped/only tests 0. Unchanged.
- `README.md` fails `prettier --check`. That predates this sweep and was left
  alone (no lines touched).

### E — Repo

- Local branches `chore/unification-sweep` (4 months) and
  `perf/attribute-rerender-fanout` (5 months) are fully merged into `main`.
  Safe to delete: `git branch -d`.
- Stashes `whatsapp` and `whatsapp-contact` on `main`: drop or turn into a branch.
- `.env*`, `coverage`, `storybook-static`, `tsbuildinfo` are git-ignored; only
  `.env.example` is tracked.

## Proposed backlog items (confirm before any get created)

1. **[high] Remove unused secrets and revoke OpenAI + Supabase service-role
   keys** (C). Needs the dashboard; manual.
2. **[medium] `typescript` 7** once typescript-eslint supports it (A).
3. **[low] Prettier-format `README.md`** (D).

## Research: framer-motion 14 / picnic-api 4 → 5

Two research agents read the changelogs and diffed the `.d.ts` files.

**framer-motion 14.9.0.** Breaking changes in v13 and v14:

- v13 drops the optional `@emotion/is-prop-valid`.
- v14 removes internal APIs again.

The repo uses neither, so no code changed. Risk: 13.x/14.x moved `x`/`scale`
and SVG animation onto the GPU, and 14.7 changed overdamped springs. **Visual
check in real Chrome:** the ToggleGroup indicator, the SkipIcon, the Drawer
drag and exit, and the Recipes `AnimatePresence` slides.

**picnic-api 5.3.0.** Migrated:

- `auth.login()` now returns camelCase. The old `as LoginResponse` cast hid
  this from `tsc`: after a bare bump, the 2FA check would have silently read
  `undefined`. Both `client.ts` and `scripts/picnic-auth.ts` dropped their
  local casts and now use the library types (`secondFactorAuthenticationRequired`).
- `recipe.getCookbookPage()` is private now. `service.ts` calls
  `app.getPage("cookbook-page-content")`, the same request, and guards
  `format === "fusion"`. A new test covers the RSC branch.
- The jest mocks were updated to match.

**Live check pending**, since it needs SMS 2FA: run `npm run picnic:auth`
once, then load the Recipes tile.

**Concurrent edits observed:** while this sweep ran, another writer changed
`src/vendors/spotify/*`, `src/app/api/{spotify/token,planta/remind}`,
`Contact.actions.ts` and `rules/stacks/nextjs.md`. Those are not part of this
sweep. Keep them out of the maintenance commit.
