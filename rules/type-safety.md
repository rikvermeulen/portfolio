# Type-Safety Rules

> Load this file when working in TypeScript-heavy code, integration boundaries,
> parsing, environment/config handling, data-model refactors, or code review
> focused on correctness and safety.

## Core Doctrine

- TypeScript-only confidence is not enough. Prefer compile-time strictness plus
  runtime validation at trust boundaries.
- Boundary data starts as `unknown` and becomes trusted only after validation.
- Prefer narrowing and validated parsing over broad `as` assertions.
- Keep transport shapes and domain types separate when the boundary matters.
- Prefer discriminated unions and exhaustive handling over loose optional-state
  objects.

## Trust Boundaries

Treat these as untrusted inputs until validated:

- API payloads and `fetch`/client responses
- `JSON.parse` output
- environment variables and process config
- database rows or CMS payloads
- file contents and uploaded data
- queue, cron, and webhook payloads
- data returned by third-party libraries or SDKs

## Preferred Pattern

1. Read boundary data as `unknown` or as a clearly transport-scoped DTO.
2. Validate it at the edge with Zod, Valibot, ArkType, a custom type guard, or
   an equivalent runtime check.
3. Map the validated shape into an explicit trusted domain type.
4. Pass only the validated domain type deeper into the app.

## Prefer

- `unknown` plus narrowing over `any`
- narrow, justified assertions only after runtime checks
- discriminated unions for state machines and variant-rich props
- exhaustive `switch` statements with a `never` fallback
- small adapter functions that isolate parsing and validation

## Avoid

- `const data = (await response.json()) as MyType`
- `JSON.parse(raw) as MyType`
- `process.env.MY_VALUE as string`
- treating generated API/database types as domain types by default
- accessing uncertain indexes or nested properties without narrowing
- spreading raw transport objects directly into UI or domain entities

## Recommended `tsconfig` Guardrails

- `strict`
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- `useUnknownInCatchVariables`
- `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`
- `noFallthroughCasesInSwitch`
- `noEmitOnError`

## Recommended Lint Guardrails

- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/no-unsafe-argument`
- `@typescript-eslint/no-unnecessary-type-assertion`
- `@typescript-eslint/consistent-type-assertions`
- `@typescript-eslint/switch-exhaustiveness-check`

## Review Checklist

When reviewing TypeScript changes, check for:

- missing validation at API, env, storage, file, queue, or parser boundaries
- unsafe `as` assertions or `any` that hide uncertainty
- transport-domain leakage that keeps raw payloads alive too long
- unsafe indexing or property access on uncertain values
- non-exhaustive unions or switches
- missing workflow guardrails that would prevent the issue in the future

## Relation To Other Surfaces

- `shared/core-rules.md` is the compact always-on baseline.
- This file is the deeper on-demand policy reference.
- The code-review workflow should use this file as its type-safety checklist.
