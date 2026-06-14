# Content Block Rules

Apply these rules when adding, refactoring, or reviewing CMS-backed content
blocks and their frontend renderers.

Use this file for CMS-agnostic block conventions. Put CMS-specific schema,
generated-type, and editor-model rules in a separate CMS rule file.

## Purpose

Treat this file as the source of truth for the frontend block contract. Do not
keep per-block status tracking or implementation checklists beside the block
implementation folders.

## Module Structure

Each block module should usually include:

- `<BlockName>.tsx` — presentational component
- `types.ts` — exported props interface and block-specific types
- `Transform<BlockName>.ts` — maps CMS transport data into trusted component
  props
- `<BlockName>.mocks.ts` — reusable mock content for stories, tests, and design
  examples when the block needs representative content
- `<BlockName>.stories.tsx` — Storybook coverage
- `<BlockName>.test.ts` or `<BlockName>.test.tsx` — Jest coverage
- `index.ts` — barrel exports for component, types, and transform

Use existing block modules in the repo as the pattern source when a new block
does not fit the common shape exactly.

## Naming

- block folders and component files use PascalCase, for example
  `CallToActionBlock/CallToActionBlock.tsx`
- transform files use `Transform<BlockName>.ts`
- transform exports use `transform<BlockName>`
- props interfaces live in `types.ts` and follow `<BlockName>Props`

## Frontend Contract

Every block component should preserve a stable block discriminator end to end:

- include a block discriminator prop such as `blockType` whose value matches the
  CMS model identifier, slug, or normalized block key used by the project
- map that discriminator through the transform layer instead of re-deriving it
  inside the component
- set `data-block-type={blockType}` or the project's equivalent on the root
  rendered element, usually a `<section>`
- provide the same discriminator in Storybook `args`

If the upstream CMS uses a different field name, normalize it in the transform
layer before it reaches presentation code.

## Transform Boundary

Do not pass raw CMS payloads directly into components. The transform is the
trust boundary between CMS transport data and presentation props.

Transforms should:

- validate or narrow the incoming CMS shape enough to render safely
- return the exact props shape expected by the component
- return `null` when the block cannot render safely because required content is
  missing or invalid
- contain fallback logic for optional content, media, or presentation defaults
  when that logic is specific to the block

## Dynamic Registration

When blocks render through a central registry or dynamic-content mapper:

- export the module pieces from the block's `index.ts`
- register the block in the project's block registry
- update any dynamic transform switch, mapper, or lookup table that resolves a
  CMS block into a component definition

Keep the registry typed from the project's source types when possible instead of
hand-maintaining duplicate unions.

## Mock Content And Design Copy

Design-provided copy, CTA labels, media fixtures, and representative CMS data
must live in a reusable mock file instead of being duplicated inline in stories,
tests, or ad hoc examples.

For block modules:

- prefer `<BlockName>.mocks.ts` in the block folder when the mock is specific to
  that block
- use an existing shared mock helper only when the content shape is genuinely
  shared across modules
- import mock data into stories and tests rather than retyping the same design
  copy in each file
- keep mocks representative of the agreed design state, but do not treat mock
  copy as production CMS content

## Tests And Stories

Every block should ship with:

- a `Default` story at minimum
- transform tests for the expected props shape
- transform tests for invalid or incomplete CMS data returning `null` when the
  block cannot render safely
- tests for important optional-field and fallback behavior specific to the block

Follow `rules/testing.md` for whether behavior belongs in Jest or Storybook.
