# Rules Index

This directory contains focused rule files. Load the relevant file(s) for the current context.

The priority guidance below is conceptual, not a guarantee about how every tool loads files.
Copilot, Claude Code, Codex, and Cursor each load instructions differently.
In synced projects, see `AI-WORKFLOWS.md` for the tool-specific loading model.

In practice, treat this directory as a topic-based rule library:

- compact baseline guidance is always-on only where a tool-specific adapter makes it so
- focused rule files are usually loaded on-demand when the task needs them
- developers should explicitly mention a focused rule in the prompt when they want a strong guarantee that the tool applies it

| File                          | Covers                                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| `communication.md`                      | Tone, response style, problem-solving approach                      |
| `project.md`                            | React, Next.js, TypeScript, component design, naming                |
| `type-safety.md`                        | Runtime trust boundaries, strict TypeScript posture, review guardrails |
| `object-literals.md`                    | Prefer explicit object properties over conditional spreads; JSX / props composition |
| `tailwind.md`                           | Tailwind 4, design tokens, Figma export workflow                    |
| `testing.md`                            | Jest + Storybook split, query priority, coverage                    |
| `accessibility.md`                      | WCAG requirements, ARIA, keyboard navigation                        |
| `backlog.md`                            | User stories, backlog items, feature/bug file structure             |
| `clean-architecture.md`                 | Layer principles, dependency rules, forbidden patterns (all stacks) |
| `stacks/nextjs-payload.md`              | Folder mapping + conventions for Next.js + Payload                  |
| `stacks/experimental.react-native-expo.md` | React Native + Expo conventions (experimental; excluded from default project sync) |

## Loading Priority

1. Load `communication.md` always — baseline behavior.
2. Load `project.md` when no project-local rules exist.
3. Load `clean-architecture.md` whenever writing or reviewing code.
4. Load `type-safety.md` when handling TypeScript-heavy code, integrations,
   parsing, config, or code review focused on correctness.
5. Load `object-literals.md` when building objects, composing props, or writing
   JSX where optional keys might be expressed with conditional spreads.
6. Load `tailwind.md` when working on styles or design tokens.
7. Load `testing.md` when writing or reviewing tests.
8. Load `backlog.md` when writing user stories, backlog items, or task specs.
9. Load `accessibility.md` when building interactive UI components.
10. Load the appropriate stack file based on detected stack (see below).

## Stack Detection

Before loading a stack file, read the project's `package.json` and check
`dependencies` + `devDependencies`:

- `"next"` present → load `stacks/nextjs-payload.md`
  (also applies when `@payloadcms/payload` is present alongside Next.js)
- `"expo"` or `"react-native"` present → load
  `stacks/experimental.react-native-expo.md` when available
  - in synced projects, this file is excluded by default unless the project
    opts into experimental workflow assets
  - if the file is not available locally, fall back to
    `clean-architecture.md` plus a structure probe instead of assuming Expo
    conventions
- Neither detected → apply `clean-architecture.md` principles only; do not
  assume any folder structure

## Structure Probe Directive

When applying stack rules to an **existing project**, do not assume canonical
folder names. Instead:

1. List the top-level directories inside `src/` (or the project root if no
   `src/` exists).
2. Map each detected folder to a CA layer using the mapping table in the
   relevant stack file.
3. If a folder cannot be classified from the table, inspect a sample of its
   files to determine what it imports.
4. Ask the user to classify any folder that remains ambiguous.
5. Only then check CA principles against the resolved mapping.

Never report a violation based on a folder name mismatch. Report violations
based on **principle breaches** within the resolved layer mapping.

## Conflict Resolution

- Project-local rules always win over these baseline rules.
- `communication.md` wins over project rules only for tone and response style.
- Stack rules are additive — they extend `clean-architecture.md`, never
  contradict it.
