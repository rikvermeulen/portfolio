# Payload Rules

Apply these rules when adding, refactoring, or reviewing Payload CMS schemas,
queries, hooks, admin components, or Payload-backed content blocks.

Load `rules/content-blocks.md` as well when the task involves frontend block
modules.

## Model placement

- follow the project's existing Payload folder structure instead of inventing a
  parallel layout
- keep block definitions, collection configs, and shared field helpers in the
  established `src/vendor/payload/` areas for the repo (`blocks/`, `collections/`, `fields/`, etc.)
- shared field definitions and helpers belong in the existing field helper
  areas instead of being duplicated inline

In repos like this one, common locations are `src/vendor/payload/blocks/**`,
`src/vendor/payload/collections/**`, `src/vendor/payload/fields/**`,
`src/vendor/payload/heroes/**`, `src/vendor/payload/tabs/**`, and
global configs under `src/vendor/payload/globals/**`.

## Payload Blocks

For every new Payload block:

- create the block definition in `src/vendor/payload/blocks/`
- export it from the local blocks barrel (`src/vendor/payload/blocks/index.ts`) when the repo uses one
- add it to every relevant `layoutBlocks` array or shared page-collection
  config that should allow the block
- run `npm run generate:types` after schema changes so generated Payload types
  stay current

Payload provides `blockType` on block items. Preserve that discriminator through
the frontend transform layer and expose it to the rendered block component.

## Type Boundaries

- treat generated Payload document types as transport types
- map Payload data through `Transform*.ts` helpers before passing it into
  presentation components
- do not hand-maintain unions that are already derivable from generated Payload
  types when the generated types can be the source of truth

## Architecture

- keep `getPayload()` calls, collection queries, and other Payload
  infrastructure concerns out of presentational components
- prefer transforming Payload transport data into trusted module or component
  props before rendering
- keep schema definitions, hooks, and admin concerns within Payload areas rather
  than spreading them through unrelated frontend folders

## Payload Collections

For every new Payload collection:

- create the collection config under `src/vendor/payload/collections/` (flat file or feature subfolder, e.g. `Vacancy/`) — follow existing patterns in this repo
- **do not** create a test file for the collection schema itself
- **do** create a matching presentation module in `src/modules/` that consumes
  the collection's generated type via a `Transform*.ts` helper
- the module must include: types, transform, component, test (for the
  transform), stories, a `__mocks__/` file with shared mock data, and a barrel
  `index.ts`

## Collection folder organization

When a collection folder grows beyond the schema file (multiple queries, a form
layer, helpers), keep concerns separated so the folder stays readable:

- **one query/mutation per file**, named after the exported function
  (`findVacancyById.ts`, `createVacancy.ts`) — never a grab-bag `queries.ts`
  that mixes unrelated reads and writes
- group read queries under a `queries/` subfolder with a barrel `index.ts`;
  keep write operations (`create*`, `update*`, `delete*`) in a `mutations.ts`
  (or `mutations/`) so reads and writes are not interleaved
- put all `Where`/filter predicates for a collection in a single `where.ts` —
  do not split predicate helpers across multiple tiny files
- split form/DTO builders by responsibility under a `form/` subfolder
  (field definitions, value mapping, validation helper) — no single file may
  mix build + transform + validate, and none should exceed ~200 lines
- keep the zod input schema in `validation.ts`; keep domain skill/option lists
  in their own files (or a `skills/` subfolder when there are several)

## Transport boundary (no HTTP in vendor)

- **never** import `next/server`, `NextResponse`, or return HTTP responses from
  any file under `src/vendor/payload/**` — that is a transport/presentation
  concern, not Payload infrastructure
- request parsing and response shaping live in the API route — either inline or
  in a helper file colocated next to `route.ts` (e.g. `formRequest.ts` in the
  same folder; Next.js only routes `route.ts`, so siblings are safe and not
  exposed) — not in the collection folder, and not in a separate `_lib/` folder
- avoid duplicate function names across the transport and module layers (e.g.
  two different `parseVacancyFormInput`s) — name them by what they actually do
  (`parseFormRequestBody` vs `parseFormDataValues`)

## Shared transforms and the Payload client

- format conversions (lexical ↔ text, date formatting, etc.) live in **one**
  shared helper module — never duplicate the inverse direction inline in a
  collection file
- always import the server Payload client from
  `@/vendor/payload/getAppPayload` — never from the deprecated
  `@/payload/lib/getAppPayload` shim; migrate any shim import you touch

## Migrations

- **agents must never run migration commands** — not `npm run migrate`,
  `npm run migrate:create`, `migrate:status`, `migrate:fresh`, `migrate:reset`,
  or any `payload migrate*` CLI. The user applies migrations manually; tell them
  what to run after schema changes
- check `push` in the Postgres adapter config (`src/vendor/payload/payload.config.ts`)
  before creating migration files
- when `push: true`, Payload auto-syncs schema to the database — **do not**
  create migration files
- only create migrations when `push: false`
- **the user** generates migrations via the CLI:
  `npm run migrate:create -- --name <description>` — agents do not run this
- **never** create migration `.ts` files manually — the CLI generates both the
  `.ts` and the required `.json` schema snapshot; a manually created migration
  is missing the snapshot and will break Payload's migration tracking
- after generating, the `migrations/index.ts` is updated automatically by
  Payload — do not edit it manually

## Generated Artifacts

- treat generated Payload types and special-case generated files as generated
  code
- do not hand-edit generated outputs unless the project has an explicit
  exception
- when generated types drift from schema reality, regenerate them instead of
  patching downstream types around the mismatch
