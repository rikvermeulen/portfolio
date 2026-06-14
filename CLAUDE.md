# CLAUDE.md

Read `AI-WORKFLOWS.md` for how this project's AI workflow files are intended to work together.
Read `CONVENTIONS.md` for project-specific context, stack, structure, and conventions.
Read `rules/` for baseline coding standards (shared across all projects).
Load only the relevant focused rule files for the task:

- `rules/tailwind.md` for styling and design-token work
- `rules/testing.md` for tests and test reviews
- `rules/accessibility.md` for interactive UI and accessibility checks
- `rules/type-safety.md` for TypeScript-heavy work, trust boundaries, and runtime validation checks
- `rules/object-literals.md` when building objects, composing JSX props, or tempted to use conditional spreads for optional keys
- `rules/backlog.md` for user stories, specs, and backlog work
- `rules/content-blocks.md` for CMS-backed block architecture, transforms, and block-specific checklists
- `rules/payload.md` for Payload schema, generated-type, and integration work
- the appropriate `rules/stacks/*` file after detecting the stack from `package.json`

## Precedence

1. `CONVENTIONS.md` (project-specific conventions)
2. `rules/` (baseline coding standards)
3. This file (tool adapter)

When CONVENTIONS.md conflicts with rules/, CONVENTIONS.md wins.

## Shared Workflow Source

When a change touches shared workflow assets in a reusable way, suggest
upstreaming it to the [ai-workflows](https://github.com/wpots/ai-workflows) repo rather than keeping it only in this
synced target repo.

Shared workflow assets:

<!-- BEGIN SHARED:workflow-assets -->
- `AI-WORKFLOWS.md`
- `commands/**`
- `rules/**`
- `.github/prompts/**`
- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.cursor/rules/**`
<!-- END SHARED:workflow-assets -->

## Workflow Strategy

On Claude, use a mixed workflow model:

- prefer a matching skill when the workflow is available and fits the task well
- use `commands/` as the compatibility and fallback path
- keep `rules/` as the policy source of truth

## Command Mapping

When user intent matches one of these triggers, read and follow the corresponding runbook in `commands/`:

<!-- BEGIN SHARED:command-mappings -->
- `create pr`, `open pr`, `submit pr` -> `commands/create-pr.md`
- `commit message`, `write commit`, `git commit` -> `commands/commit-message.md`
- `backlog item`, `user story`, `feature spec`, `bug item`, `bli` -> `commands/backlog.md`
- `close sprint`, `sluit sprint af`, `sprint afsluiten` -> `commands/close-sprint.md`
- `sprint demo`, `demo voorbereiden`, `demo script`, `prepare demo` -> `commands/sprint-demo.md`
<!-- END SHARED:command-mappings -->

Do not assume command files auto-run. Select and execute them when intent matches.

## Safety

<!-- BEGIN SHARED:safety -->
- Prefer concrete execution over long planning.
- Do not modify code unless requested.
- Ask before destructive actions (force kill, reset, delete) unless explicitly requested.
- Always summarize what was run and what changed.
<!-- END SHARED:safety -->
