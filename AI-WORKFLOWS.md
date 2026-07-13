# AI-WORKFLOWS.md

How the AI instruction files in this repo fit together.

## Source of truth

- **`CONVENTIONS.md`** — project-owned source of truth for stack, structure,
  scripts, and local conventions. Wins over everything else. **Not synced.**
- **`rules/`** — shared baseline coding standards, synced from
  [ai-workflows](https://github.com/wpots/ai-workflows). Topic-based library,
  loaded on demand. `rules/rules.md` is the index.
- **Adapters** — thin per-tool routers that point back to the two above:
  - `CLAUDE.md` — Claude Code
  - `AGENTS.md` — Codex / Cursor / other agents
  - `.cursor/rules/conventions.mdc` — Cursor auto-applied

There is **no** `commands/`, `.github/copilot-instructions.md`, or
`.github/prompts/` in this project. It's a personal portfolio with no
sprint/backlog/CMS process; workflows run as **skills** where the tool supports
them.

## Loading model

- **Always-on:** the tool's own adapter + `CONVENTIONS.md`.
- **On-demand:** focused files in `rules/`. Load the one the task needs; naming a
  specific rule in the prompt is the strongest signal that a tool applies it.

| Task type | Rule to consult |
| --- | --- |
| Project structure / where does this go | `rules/stacks/nextjs.md`, `rules/clean-architecture.md` |
| TypeScript, API/JSON/env boundaries | `rules/type-safety.md` |
| Object literals, optional JSX props | `rules/object-literals.md` |
| Styling, tokens, Tailwind | `rules/tailwind.md` |
| Tests, test reviews | `rules/testing.md` |
| Interactive UI, a11y | `rules/accessibility.md` |

## Customizing

- Edit `CONVENTIONS.md` for project-local decisions — it is not overwritten by sync.
- Edit the shared `ai-workflows` repo when a rule should be reused across projects,
  then re-run sync. **Local edits to synced files (`rules/**`, the adapters, this
  file) are clobbered on re-sync** — put anything project-specific in
  `CONVENTIONS.md` instead.
