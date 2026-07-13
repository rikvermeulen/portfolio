# Rules Index

Focused rule files. Load the relevant file(s) for the current task — this
directory is a topic-based library, not an always-on bundle.

`CONVENTIONS.md` (project root) is the source of truth for this repo and wins
over anything here. These files are the shared baseline behind it.

| File | Covers |
| --- | --- |
| `communication.md` | Tone, response style, problem-solving approach |
| `project.md` | Baseline React / Next.js / TypeScript guidance (fallback when a project defines no local conventions) |
| `clean-architecture.md` | Layer principles, dependency rules, forbidden patterns (stack-agnostic) |
| `type-safety.md` | Runtime trust boundaries, strict TypeScript posture, review guardrails |
| `object-literals.md` | Explicit object properties over conditional spreads; JSX / props composition |
| `tailwind.md` | Tailwind 4, design tokens |
| `testing.md` | Jest + Storybook split, query priority, coverage |
| `accessibility.md` | WCAG, ARIA, keyboard navigation |
| `stacks/nextjs.md` | Folder → layer mapping and conventions for **this** repo (Next.js App Router, no CMS) |

## Loading priority

1. `communication.md` — baseline tone/style.
2. `clean-architecture.md` — whenever writing or reviewing code.
3. `stacks/nextjs.md` — the concrete mapping for this repo.
4. Then the topic file the task needs (`type-safety`, `tailwind`, `testing`,
   `accessibility`, `object-literals`).
5. `project.md` only as a generic fallback — `CONVENTIONS.md` supersedes it here.

## Conflict resolution

- `CONVENTIONS.md` and local project rules win over these baseline files.
- `communication.md` wins over project rules only for tone and response style.
- Stack rules are additive — they extend `clean-architecture.md`, never contradict it.
