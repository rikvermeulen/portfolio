# Unify & cleanup plan

Merged from 4 read-only audits (components, modules, vendors/lib/api, hooks/utils/tooling), 2026-11-02.
Estimate: **~4,200 lines removable (~15% of 27k) + 6 deps**, after de-duplicating overlapping findings.
Line numbers reflect the working tree at audit time.

## Status (2026-11-02, after PR #1 merge)

- **Done in PR #1 (`chore/go-live-hardening`)**: both Picnic key leaks (recipes route removed, image proxy hardened), remind retry-after-failure.
- **Done (uncommitted, Planta + Music/Podcast pass)**: Planta `nudge`/`plants`/`remind` routes removed → `Plants.actions.ts` server action passed in as `onRemind`; due-plant mapping → `lib/plants/getDuePlants`; client pagination/`getPlant`/`params` removed, `reauthorize()` dedup, `TimeoutError` fix; fixed user-facing error message; `StatusResult` removed. Music/Podcast → shared `SpotifyAudioBento`; Spotify unhandled rejections fixed; Spotify provider only on Music/Podcast stories. Net ≈ −400 lines.
- Everything below not marked done is still open; line numbers predate PR #1 — re-check before acting.

## P0 — Security & bugs (do first, small)

| Item | Where | Fix |
|---|---|---|
| Picnic key returned to anyone | `app/api/picnic/recipes/route.ts:13` | Delete route (0 callers) + `includeNodeId`/`rawRecipes`/`authKey` paths in `vendors/picnic/service.ts`, `findFusionNodeById`/`findNodeRawById` in `lib/recipes/extract.ts`. **Rotate key if deployed.** |
| Open proxy leaks Picnic key | `app/api/picnic/image/route.ts:12` | `new URL(url)`; require `https:` + `hostname.endsWith(".picnicinternational.com")` |
| Unused push-spam route | `app/api/planta/nudge/route.ts` | Delete + `notifyPlantNudge` |
| Unused route | `app/api/planta/plants/route.ts` | Delete + `statusCode`/`rawPlants`/`?raw` paths |
| Retry blocked after failure | `app/api/planta/remind/route.ts:22` | Set `lastSentAt` after success; move mapping to `lib/plants`; make it a `Plants.actions.ts` server action (like Contact) |
| Timeout branch never runs | `vendors/planta/client.ts:261` | Check `TimeoutError`, not `AbortError` |
| Storage error cached as "no photos" 24h | `vendors/supabase/service.ts:26` | `if (error) throw error` |
| Unhandled rejections | `useSpotifyPlayer.ts:76-128`, `useSpotifyConnection.ts:84` | `.catch` → `setPlayError` |
| Hydration mismatch (UTC vs local) | `Journal.tsx:21`, `Contact.tsx:23` | LiveTime's `useSyncExternalStore` pattern |
| Static tiles kill whole page on throw | `app/(dashboard)/page.tsx:31` | Wrap every tile in Suspense + `BentoErrorBoundary` |
| Dark-mode active tab invisible / label read twice | `ToggleGroup.tsx:415-420` | Drop `dark:text-white`, drop Icon `label` |
| "Pause, pressed" | `AudioControls.tsx:27` | Drop `aria-pressed` |
| Double blur (~1.4×, 2× cost) | `Glass/useDisplacementFilter.ts:22` | Drop `blurPart` when painted — visual check |
| Footer logo likely invisible in dark | `Footer.tsx:27` | `dark:invert` like Header — visual check |
| Error messages leak upstream text to UI | picnic/planta `to*ErrorMessage` | Fixed message + `console.error` (lands with P2-B `toResult`) |

## P1 — Dead code purge (low risk, mechanical)

- GSAP: `AnimationContext`, `useLoadGsap`, `useIsLowEndDevice`, `<AnimationProvider>` in `layout.tsx`, deps `gsap` `@gsap/react` (~300, also a bundle win)
- `utils/debounce`, `hooks/useClipboard`, `_dev/ReactScan`, `proxy.example.ts`, `lib/games/index.test.ts`
- Deps: `ts-node`, `string-similarity-js`, `sass`; `identity-obj-proxy` mapping in jest config
- Planta: pagination loop + `cursor/fetchAll/maxPlants` + `getPlant` → single GET + `.slice(0, 6)`
- Picnic: dev `auth/key` route + `fetchPicnicAuthKey` + env login fallback (script covers 2FA) — **med: drops runtime password login**
- Unused props/options: Drawer `header/footer`, LiveTime `updateInterval`, AdaptiveText `light/dark`, Slider `min/max/step`, Bento `image/imageAlt/iconPosition`, Category `label`, `className` on Contact/FindMe/Journal/Category, `data-bento*` attrs, `data-glass`
- `SkeletonCard` → inline into BentoSkeleton
- Unused Tag variants/tokens (`orange/red/dark`, `ds-tag-green`, `ds-tag-rested-ink`), icons `next.svg`, `arrow.up.right.svg`
- 5 `Unavailable` stories → one in `Bento.stories.tsx`; empty `Record<string,never>` props types + `{}` mocks
- Dead barrel/type re-exports, `NEXT_PUBLIC_ENVIRONMENT`, nintendo image pattern, `.next-prod` tsconfig includes, `.gitkeep`s

## P2 — Unified systems (the actual "one system")

Run as parallel slices — file ownership below so no two agents touch the same files.

**A. Bento contract** — owns `components/Bento`, `AppIcon`, `Toast`, `Audio/*`, `modules/**`
```ts
bentos[key] = { sizes, name?, icon?, darkIcon? }        // catalog
<Bento sizeKey surface? href? className>                  // resolves sizes + icon itself
<BentoEmptyState sizeKey message>                         // the ONE fallback (empty/error/boundary)
type Tile = { id; sizeKey; render: () => ReactNode }     // one registry shape
```
- `sizeKey` replaces 16× `sizes={bentos[x].sizes}`; `<AppIcon app>` resolves icon/darkIcon once (Bento + Toast)
- BentoGrid → server `<div>` + container-query CSS; delete config/const/types/mock (~170)
- Music + Podcast → thin wrappers over AudioBento (~40)
- WeatherBadge → `AsyncBento`; Recipes wrapper/useCallback cleanup; constants → `*.const.ts`

**B. Vendor contract** — owns `vendors/**`, `lib/**`, `app/api/**`, `scripts/*-auth.ts`
```ts
// src/vendors/http.ts
class VendorError(vendor, msg, status?)
fetchJson<T>(vendor, url, schema, init & { timeoutMs })   // timeout, !ok → VendorError, zod parse
memoToken(get, marginMs?)                                   // token cache
toResult<T>(vendor, run, { configured?, isEmpty? })         // unstable_rethrow + log + fixed message
// service = env gate → one cache layer → fetchJson → lib mapper → toResult
```
- Steam, Xbox, Spotify, openMeteo collapse fully; Supabase/Picnic/Planta use `toResult` only
- Replace 3 identical error classes; add zod for Steam/Xbox/Spotify (**med: may reject payloads**)
- One caching strategy (drop fetch-level `revalidate`); openMeteo stops importing from `modules/`
- Spotify: one `requestToken(grant)`; review `user-modify-playback-state` scope on the public token route
- Planta `reauth()` dedup; Picnic `PICNIC_COUNTRY` once; scripts share `loadEnv/run`

**C. UI primitives** — owns `FocusTrap`, `Drawer`, `Button`, `Slot`, `Glass`, `ToggleGroup`, `Icon`, `Tag`, `lib/radius`
- FocusTrap (241 + 1,046 test/story) → `react-aria` `FocusScope` (already installed via RAC) (~1,280)
- Button: drop Slot, one `cloneElement`; drop iconOnly/md/lg/neutral/destructive (only stories use them) — fixes Slot ref bug
- Glass reads radius from parent computed style → drop `radius` prop at ~22 sites (**med, visual**)
- Radius tokens everywhere (`rounded-tile/card/control/field`), fix `radius.ts:7` comment
- `IconName = keyof typeof ICON_COMPONENTS`; one key casing; `function` not `React.FC`
- ToggleGroup: springs → `ToggleGroup.animate.ts`, `text-ds-blue`

**D. Tooling** — owns `config/**`, `utils/getSecurityHeaders`, jest/storybook/prettier/stylelint config, `package.json` scripts, test mocks
- `getSecurityHeaders` → static header array in `config/responseHeaders.ts` (~450) — **diff output before/after**
- `src/__mocks__/env.ts` replaces 16× inline `jest.mock("@env")`
- `tsx --env-file-if-exists` → drop `dotenv`
- Storybook: Spotify provider only on Music/Podcast stories; try dropping alias/postcss blocks
- prettier/stylelint → re-export; `--coverage` only on `test`; widen coverage glob to `src/**/*.utils.ts`

## P3 — Sequential cross-cutting (after P2 merges)

- One reduced-motion source (`usePrefersReducedMotion` + non-hook helper for `toastQueue`)
- Round glass buttons in Journal/Plants/Recipes/FindMe → `<Button iconOnly size="sm">` (needs A + C)
- Single-consumer shared files → move next to consumer (`useOutsideClick`, `useShare`, `isExternalUrl`, `playSound`, `backdropContrast`, `useSpotifyConnection` into its context)
- Convention sweep: `function` components, default exports, `Foo.types.ts` naming
- CONVENTIONS.md drift (GSAP, framer version, utils list, BentoGrid location)

## Needs a real-browser check

BentoGrid CSS rewrite, Glass radius/double-blur, round-button swap, Footer logo, ToggleGroup. Spotify playback: real Chrome only (no DRM in the preview pane).
