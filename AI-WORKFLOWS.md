# AI-WORKFLOWS.md

This project uses the shared `ai-workflows` setup. This file explains how the synced AI files are meant to work together.

## Source Of Truth

- `CONVENTIONS.md` is the project-owned source of truth for stack, structure, scripts, and local conventions.
- `rules/` contains the shared baseline coding rules synced from `ai-workflows`.
- `commands/` contains shared workflow runbooks synced from `ai-workflows`.

When `CONVENTIONS.md` conflicts with synced baseline rules, `CONVENTIONS.md` wins.

## How Each Tool Loads These Files

| Tool | What it reliably loads | What that means in practice |
| ---- | ---------------------- | --------------------------- |
| GitHub Copilot | `.github/copilot-instructions.md` | Important coding rules must be inlined there. `.github/prompts/*.prompt.md` are attachable helpers, not guaranteed auto-context. |
| Claude Code | Global `~/.claude/CLAUDE.md` and `~/.claude/rules/*.md`, plus project files when present | Global Claude rules must stay universal. Project-specific context belongs in `CONVENTIONS.md`, this guide, and project adapters. |
| Codex | `AGENTS.md` plus repo files it can inspect | `AGENTS.md` is the thin adapter; deeper project context lives in `CONVENTIONS.md`, `rules/`, and `commands/`. |
| Cursor | `AGENTS.md` and `.cursor/rules/*.md` | Cursor can follow project files well, and `.cursor/rules/conventions.mdc` points it back to `CONVENTIONS.md` and `rules/`. |

## Workflow Surface Strategy

This setup uses four workflow surfaces:

| Surface | Primary role |
| ------- | ------------ |
| `rules/` | stable policy and coding standards |
| `skills/` | repeatable multi-step workflows for skill-aware tools; these are usually installed globally, not copied into the project |
| `commands/` | compatibility adapters and fallback runbooks |
| adapters | always-on routing, precedence, and local usage guidance |

## Shared Workflow Assets

Treat these as the reusable shared workflow assets in a synced project:

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

## Tool Support Matrix

Use this as the intended model inside synced projects:

| Tool | Preferred workflow surface |
| ---- | -------------------------- |
| GitHub Copilot | commands/runbooks |
| Cursor | skills first, commands as fallback |
| Codex | skills first, commands as fallback |
| Claude Code | mixed: skills when supported, commands/rules as compatibility path |

## Always-On Vs On-Demand

Use this rule of thumb:

- Always-on: the thin adapter for the tool, `CONVENTIONS.md`, and the compact Copilot baseline
- On-demand: focused files in `rules/` and workflow runbooks in `commands/`

The focused rules are intentionally conditional so every conversation does not load every concern.
Load the relevant file when the task needs it:

| Task type | Rule to consult |
| --------- | --------------- |
| TypeScript-heavy code, API/JSON/env/database boundaries | `rules/type-safety.md` |
| Object literals, optional JSX props, conditional spreads | `rules/object-literals.md` |
| Styling, tokens, Tailwind | `rules/tailwind.md` |
| Tests, test reviews | `rules/testing.md` |
| Interactive UI, a11y checks | `rules/accessibility.md` |
| User stories, specs, backlog work | `rules/backlog.md` |
| CMS-backed content block architecture and transforms | `rules/content-blocks.md` |
| Payload CMS schemas, generated types, hooks, and integrations | `rules/payload.md` |
| Stack-specific architecture | the matching file in `rules/stacks/` after checking `package.json` |

## Type-Safety Model

This setup treats type safety as three layers:

- universal baseline: compact always-on guidance from adapters and Copilot core
  rules
- deeper policy: `rules/type-safety.md` for trust boundaries, strict TypeScript
  posture, lint guardrails, and transport-to-domain separation
- review audit: the code-review workflow checks unsafe assertions, missing
  validation, and missing workflow guardrails

The default recommendation is compile-time strictness plus runtime validation at
trust boundaries. External data is not considered safe just because TypeScript
types exist nearby.

## How Developers Should Use This

You usually do not need to mention the always-on files. You should mention the focused rules when the task is specific enough that the tool may not load them by itself.

Examples:

- "Implement this form and follow `rules/accessibility.md`."
- "Write tests for this component using `rules/testing.md`."
- "Refactor this page and apply `rules/tailwind.md`."
- "Add a new CMS block and follow `rules/content-blocks.md`."
- "Update this Payload schema using `rules/payload.md`."
- "Review this integration against `rules/type-safety.md` and call out trust-boundary risks."
- "Compose props and objects using `rules/object-literals.md` (no conditional spreads only to add keys)."
- "Review this feature against `rules/clean-architecture.md` and the relevant stack rule."

Per tool:

- Cursor: `.cursor/rules/conventions.mdc` always applies, but focused rule files are still topic-based.
- Claude Code: project `CLAUDE.md` points to `rules/`, but mentioning the specific rule in the prompt gives the strongest signal.
- Codex: `AGENTS.md` points to the local files, and explicitly naming a focused rule is still helpful for narrow tasks.
- Copilot: assume only `.github/copilot-instructions.md` is ambient. If a focused rule matters, name it in the prompt or work from the matching prompt/runbook.

For workflows:

- If a matching skill exists and the current tool supports skills well, prefer the skill.
- If you are using Copilot, or a workflow needs a prompt-friendly fallback, use the matching command/runbook.
- Keep rules as the policy source even when a skill or command helps execute the work.

## Files In This Project

- `CONVENTIONS.md`: project-specific stack, structure, scripts, and deviations from the shared baseline
- `AI-WORKFLOWS.md`: this guide
- `CLAUDE.md`: Claude-facing thin adapter
- `AGENTS.md`: Codex/Cursor-facing thin adapter
- `.github/copilot-instructions.md`: Copilot-facing adapter with `CONVENTIONS.md` and condensed baseline rules inlined
- `.cursor/rules/conventions.mdc`: Cursor auto-applied conventions adapter
- `rules/`: synced shared coding standards
- `commands/`: synced workflow runbooks
- `.github/prompts/`: Copilot prompt wrappers generated from `commands/`

## Available Command Triggers

When user intent matches one of these triggers, read and follow the corresponding runbook in `commands/`:

<!-- BEGIN SHARED:command-mappings -->
- `create pr`, `open pr`, `submit pr` -> `commands/create-pr.md`
- `commit message`, `write commit`, `git commit` -> `commands/commit-message.md`
- `backlog item`, `user story`, `feature spec`, `bug item`, `bli` -> `commands/backlog.md`
- `close sprint`, `sluit sprint af`, `sprint afsluiten` -> `commands/close-sprint.md`
- `sprint demo`, `demo voorbereiden`, `demo script`, `prepare demo` -> `commands/sprint-demo.md`
<!-- END SHARED:command-mappings -->

Experimental workflows are excluded from project sync by default. Re-run sync with `--include-experimental` if this project should opt into them.

## Customizing This Setup

- Edit `CONVENTIONS.md` for project-local decisions.
- Edit the shared `ai-workflows` repo when a rule or runbook should be reused across projects.
- Re-run project sync after upstream updates to refresh the local adapters, rules, commands, and prompt files.
