# CONVENTIONS.md

## Project

`refugeework-website` — Next.js + Payload CMS website for the RefugeeWork project.

## Stack

- Next.js 16, React 19, TypeScript 6
- Payload CMS 3 with Postgres
- Tailwind CSS 4, Storybook 10, Jest + Vitest
- Zod + `@t3-oss/env-nextjs`, Sharp, react-scan

## Structure

- `src/app/(frontend)`: public routes and page shells
- `src/app/(payload)`: Payload admin routes
- `src/payload`: Payload plugins, custom admin UI, app helpers (`lib/`), and shared non-schema assets (e.g. `definitions/`, `i18n.config`)
- `src/vendor/payload`: Payload `buildConfig`, and CMS definitions in `blocks/`, `collections/`, `fields/`, `heroes/`, `tabs/`, and `globals/` (plus `lib/` for shared helpers such as locale resolution, `pages/`, `roles/`, etc.), generated types, import map, and migrations
- `src/modules`, `src/templates`, `src/components`: page composition, content blocks, reusable UI
- `src/hooks`, `src/contexts`, `src/i18n`: client behavior and localization
- `src/utils`: generic utility functions, project-agnostic, no business logic (e.g. `debounce`, `classnames`)
- `src/lib`: project-specific utilities and helpers, project-aware but no direct third-party SDK calls (e.g. `a11yPreferences`, `fonts`)
- `src/vendor`: third-party-coupled integration code where the vendor boundary is intentional (for example `vendor/payload` config, CMS models, admin components, and field/page helpers)
- `config`: app configuration
- `src/styles`, `src/assets`: design system styles and static assets

## Scripts

| Command                  | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `npm run dev`            | Start local Next dev server               |
| `npm run build`          | Build production bundle                   |
| `npm run start`          | Run production build locally              |
| `npm run lint`           | Run ESLint with autofix                   |
| `npm run lint:styles`    | Run Stylelint with autofix                |
| `npm run type-check`     | Run TypeScript without emitting           |
| `npm run test`           | Run Jest tests                            |
| `npm run storybook`      | Start Storybook                           |
| `npm run test-storybook` | Run Storybook/Vitest tests                |
| `npm run payload`        | Run Payload CLI                           |
| `npm run generate:types` | Regenerate Payload types                  |
| `npm run migrate:create` | Create migration file from schema changes |
| `npm run migrate`        | Run Payload migrations                    |
| `npm run migrate:status` | Check for pending migrations              |
| `npm run generate:icons` | Regenerate SVG icon registry              |

## Payload Migrations

When you modify collection schemas (add/remove/change fields):

1. Run `npm run migrate:create` locally to capture the schema changes
2. The migration file will be created in `src/vendor/payload/migrations/`
3. Commit the migration file before pushing
4. The `pre-push` hook will verify no pending migrations remain

**Never push without committing migrations.** The hook will block the push if migrations are pending.

**AI agents must not run any migrate commands** (`migrate`, `migrate:create`,
`migrate:status`, `migrate:fresh`, `migrate:reset`, or `payload migrate*`).
Schema work and `npm run generate:types` are fine; migration create/apply is
always manual.

## Conventions

- Prefer **extracted React components** (named function components in the same file or a module) over **inline helpers** inside a component that only exist to `return` JSX. Apply this even when the extracted piece is very small — it keeps structure consistent, improves readability in diffs, and avoids unstable nested component identities when the helper is used as a child or passed around.
- ESLint extends `@greenberry/linting-config`; local rule changes should be discussed before adding them here.
- Merge request titles should start with the Jira ticket key when the work maps to a ticket, for example `RFW-25: collection Organisation`, so the GitLab/Jira integration can pick it up reliably.
- Prefer deriving the Jira ticket key from the branch name or linked backlog/spec work when present, and do not invent a key when none is known.
- Prefer `npx` for temporary npm package execution over global (`-g` or `--global`) installation.
- Prefer **explicit object properties** (`{ test, test2 }`) over **conditional spreads** used only to add optional keys (for example `{ test, ...(test2 ? { test2 } : {}) }`) when building objects or passing JSX props. Use a real merge spread when combining objects, or a small ternary between two literals when branches differ. See `rules/object-literals.md`.

## Backlog

- Backlog items in `docs/backlog/` must start the filename with the Jira ticket key from the file's `Ticket` field, for example `RFW-214-feat-organization-contact-invites.md`.
- If a backlog item is created before the Jira ticket exists, rename the file as soon as the ticket key is assigned and update local `docs/` references to match.

## Type Safety

- `strict`, `noUncheckedIndexedAccess`, `checkJs`, and `allowImportingTsExtensions` are enabled.
- `exactOptionalPropertyTypes`, `useUnknownInCatchVariables`, `noPropertyAccessFromIndexSignature`, `noFallthroughCasesInSwitch`, and `noImplicitOverride` are not enabled; this is weaker than the shared baseline.
- Env boundaries are validated with Zod in `src/env.ts`.

## Deviations from Global Rules

- Jest and Vitest are both intentional: Jest is the primary test runner, while Vitest supports Storybook/browser testing.

## Precedence

Rules in this file override shared baseline rules from `ai-workflows` when they conflict.
