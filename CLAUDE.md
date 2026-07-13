# CLAUDE.md

Read `CONVENTIONS.md` for this project's context, stack, structure, and conventions —
it is the source of truth and wins over everything below.
Read `AI-WORKFLOWS.md` for how the AI workflow files fit together.
Read `rules/` for baseline coding standards. Load only the relevant focused file:

- `rules/stacks/nextjs.md` — folder → layer mapping for this repo (read first for structure)
- `rules/clean-architecture.md` — layer/dependency principles (stack-agnostic)
- `rules/type-safety.md` — TypeScript posture, trust boundaries, runtime validation
- `rules/tailwind.md` — styling and design-token work
- `rules/testing.md` — tests and test reviews (Jest only; 100% coverage on utils/lib/hooks)
- `rules/accessibility.md` — interactive UI and a11y checks
- `rules/object-literals.md` — object/JSX-prop composition; avoid conditional spreads for optional keys

## Precedence

1. `CONVENTIONS.md` (project-specific conventions)
2. `rules/` (baseline coding standards)
3. This file (tool adapter)

When `CONVENTIONS.md` conflicts with `rules/`, `CONVENTIONS.md` wins.

## Workflows

Repeatable workflows run as **skills** (invoked with `/<skill-name>`). This project
defines no `commands/` runbooks — there is no sprint/backlog/CMS process here.

## Shared Workflow Source

`AI-WORKFLOWS.md`, `rules/**`, `AGENTS.md`, `CLAUDE.md`, and `.cursor/rules/**` are
synced from the shared [ai-workflows](https://github.com/wpots/ai-workflows) repo.
When a change to one of them is reusable across projects, suggest upstreaming it
there rather than keeping it only in this repo. Project-specific facts belong in
`CONVENTIONS.md` (which is not synced).

## Safety

- Prefer concrete execution over long planning.
- Do not modify code unless requested.
- Ask before destructive actions (force kill, reset, delete) unless explicitly requested.
- Always summarize what was run and what changed.
