# Backlog & User Stories

> Apply these rules whenever the user asks to write user stories, backlog items,
> features, bugs, or tasks.

## Relationship to Issue Trackers

These backlog files complement your issue tracker (Jira, Linear, etc.) — they
don't replace it. Use them as a local drafting format for AI-generated stories
and specs. Link back to the tracker via the **Ticket** field in each file.

## Output Location

All backlog items MUST be written to the project's `docs/backlog/` folder.

- If `docs/` does not exist, create it.
- If `docs/backlog/` does not exist, create it.
- Never output stories inline in chat only — always persist to a file.

## Folder Structure

```
docs/
└── backlog/
    ├── feat-user-authentication.md
    ├── feat-diary-entry-crud.md
    ├── bug-date-picker-timezone.md
    ├── story-onboarding-flow.md
    └── ...
```

## File Naming

- One item per file — never combine multiple stories/bugs in a single file.
- Prefix with type: `feat-`, `bug-`, `story-`, `chore-`, `spike-`.
- Use kebab-case for the rest of the name.
- Extension: `.md`

- Optionally prepend the project ticket key before the type: `JS-103-feat-user-authentication.md`.
  - Use an uppercase project acronym and numeric ID (e.g. `PROJ-123`), keep hyphen separators, and preserve kebab-case for the descriptive part.

## File Template

Every backlog item must follow this structure:

```markdown
# [Type]: [Title]

## Ticket

<!-- PROJECT-123 or JS-103 -->

PROJ-123

## Priority

<!-- critical | high | medium | low -->

medium

## User Story

<!-- As a [role], I want [goal], so that [benefit]. -->

## Acceptance Criteria

<!-- Product-facing checklist written in PO-friendly language.
     Describe user-visible behavior, permissions, and business outcomes.
     Avoid code paths, schema names, helper names, migrations, or test-task wording here.
     Use plain bullets rather than markdown task-list checkboxes so Jira paste stays clean. -->

- ...
- ...
- ...

## Technical Notes

<!-- Implementation hints, relevant files, dependencies, edge cases.
     Be specific enough that a junior developer can pick this up without
     asking follow-up questions.
     Put code paths, helper names, schema details, test expectations, and
     rollout constraints here rather than in Acceptance Criteria. -->

## How To Test/Verify

<!-- Required for every item that is past `refine` status (i.e. ready / in
     progress / done). Items still in `refine` may omit it.
     A QA-facing checklist of concrete steps to confirm each acceptance
     criterion holds. Use markdown task-list checkboxes here (this section is
     NOT pasted into Jira, so brackets are fine).
     Group steps under sub-headings (Setup, Access, Form behaviour, Data
     integrity, Automated checks, etc.) when the item is large.
     Reference the project's `run-checks` command for the lint/type/test gate
     rather than a raw npm script. -->

## Out of Scope

<!-- Explicitly state what this item does NOT cover.
     If a separate backlog item already covers that work, mention its Jira
     ticket key and prefer a Jira issue link instead of a GitLab repo link. -->

## Related

<!-- Use full GitLab blob links for repo-local specs, notes, and backlog items
     so clicks open GitLab rather than the local editor.
     Prefer the current working branch unless the user asks for a different
     target branch. -->
```

## Writing Style

- Write for a **junior developer** — assume they know the stack basics but not
  the codebase internals.
- Include specific file paths, function names, and component names where relevant.
- In prose and `Technical Notes`, reference local docs as plain code paths such
  as `docs/specs/rbac.md` rather than editor-specific local links.
- Spell out edge cases and error scenarios in acceptance criteria.
- Keep language direct and unambiguous — no "maybe" or "consider".
- Each acceptance criterion should be independently testable.
- Keep acceptance criteria **PO-friendly**. They should read as product behavior,
  user permissions, business rules, or observable outcomes.
- Do not use markdown task-list syntax such as `- [ ]` in acceptance criteria;
  use plain bullets so copy/paste into Jira does not include square brackets.
- Prefer implementation detail in `Technical Notes`, not in acceptance criteria.
- Avoid file paths, function names, helper names, schema field names, migration
  steps, or explicit "write tests for..." bullets in acceptance criteria unless
  they are themselves the product requirement.
- When a backlog item creates or changes persisted fields that a PO should
  review explicitly, add a short markdown table at the end of
  `Acceptance Criteria` with the columns `fieldName`, `fieldType`,
  `mandatory`, and optional `defaultValue`.
- Keep that field table concise and product-readable. Include only the fields
  introduced or materially changed by the item, and use plain `yes` / `no`
  values in `mandatory` unless a brief qualifier is needed to explain a role-
  or flow-specific exception.
- Use `defaultValue` only when the story defines a meaningful default; otherwise
  leave the cell empty or use `—`.
- If a detail helps estimation or implementation more than prioritization or QA,
  it probably belongs in `Technical Notes`.
- In `Related`, use GitLab origin blob links for repo-local docs and backlog
  items so readers are redirected to GitLab.
- In `Out of Scope`, mention the related Jira ticket key when the excluded work
  is already covered by another known backlog item, and prefer a Jira issue
  link rather than a GitLab backlog-file link.

## Correction and Sub-items

When an item is a **correction or refinement of an existing story** (sub-ticket like `RFW-28-1`), use a minimal format — omit User Story, Technical Notes, Out of Scope, and Related. Include only:

```markdown
# Fix: [Title]

## Ticket

[PROJ-X-Y](https://jira-url/browse/PROJ-X-Y) — corrects [PROJ-X](https://jira-url/browse/PROJ-X)

## Acceptance Criteria

- ...

| fieldName | fieldType | mandatory | defaultValue |
| --------- | --------- | --------- | ------------ |
| ...       | ...       | ...       | ...          |
```

Omit the fields table if no persisted fields are introduced or changed.

## Updating Existing Items

- When updating a backlog item, edit the existing file — do not create duplicates.
- Append to `Technical Notes` rather than overwriting when adding context.
- Track implementation status in Jira rather than a local `Status` section.

## Recent Rules Updates

- 2026-04-16: Clarified that `Out of Scope` should point to Jira issues when applicable, not GitLab backlog-file links.
- 2026-04-16: Switched backlog acceptance-criteria examples from markdown task-list checkboxes to plain bullets so Jira copy/paste does not include square brackets.
- 2026-04-16: Removed `Status` and `Summary` from the backlog template, required GitLab links in `Related`, and asked `Out of Scope` to mention matching Jira tickets when applicable.
- 2026-04-16: Clarified that backlog acceptance criteria should stay PO-friendly and outcome-based, while implementation detail, code paths, and test expectations belong in `Technical Notes`.
- 2026-04-16: Added a PO-facing field overview table requirement for backlog items that create or materially change persisted fields; place it in `Acceptance Criteria` with `fieldName`, `fieldType`, `mandatory`, and optional `defaultValue` columns.
- 2026-04-21: Added minimal format for correction/sub-items (fix sub-tickets): only Ticket link, Acceptance Criteria, and optional fields table — no User Story, Technical Notes, Out of Scope, or Related.
- 2026-04-08: Added "Rich Text Output Rules" to `rules/accessibility.md` — rules include: do not emit empty content elements (`<p>`, `<ul>`, `<li>`), use `<hr>` only as a structural separator, avoid consecutive `<br>` tags, require `lang` attributes for different-language content, and prefer `<b>`/`<i>` for purely visual styling instead of `<strong>`/`<em>`.
