# AGENTS.md

Adapter for Codex / Cursor and other agents.

Read `CONVENTIONS.md` for this project's context, stack, structure, and conventions —
it is the source of truth and wins over everything below.
Read `rules/rules.md` as the index, then only the relevant focused file:

- `rules/stacks/nextjs.md` — folder → layer mapping for this repo (read first for structure)
- `rules/clean-architecture.md` — layer/dependency principles (stack-agnostic)
- `rules/type-safety.md` — TypeScript posture, trust boundaries, runtime validation
- `rules/tailwind.md` — styling and design-token work
- `rules/testing.md` — tests and test reviews (Jest only)
- `rules/accessibility.md` — interactive UI and a11y checks
- `rules/object-literals.md` — object/JSX-prop composition

## Precedence

1. `CONVENTIONS.md` (project-specific conventions)
2. `rules/` (baseline coding standards)
3. This file (adapter)

When `CONVENTIONS.md` conflicts with `rules/`, `CONVENTIONS.md` wins.

## Workflows

Repeatable workflows run as **skills** where the tool supports them. This project
defines no `commands/` runbooks and no sprint/backlog/CMS process.

## Shared Workflow Source

`AI-WORKFLOWS.md`, `rules/**`, `AGENTS.md`, `CLAUDE.md`, and `.cursor/rules/**` are
synced from the shared [ai-workflows](https://github.com/wpots/ai-workflows) repo.
When a change to one of them is reusable across projects, propose it upstream
there. Project-specific facts belong in `CONVENTIONS.md` (not synced).

## Safety

- Prefer concrete execution over long planning.
- Do not modify code unless requested.
- Ask before destructive actions (force kill, reset, delete) unless explicitly requested.
- Always summarize what was run and what changed.
