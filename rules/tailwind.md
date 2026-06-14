# Tailwind 4 Rules

## Core Directives

- Use `@theme` directive for design tokens — no `tailwind.config.ts`
- Leverage CSS variables for dynamic theming: `--color-ds-*`, `--spacing-ds-*`, etc.
- Use `@variant` for custom variants instead of plugin API
- Prefer `@layer` directives (base, components, utilities) for proper cascade
- Use container queries with `@container` instead of responsive-only approach

## Design System First

**ALWAYS define a design system with design tokens in `globals.css` BEFORE writing component styles.**

Use semantic naming for colors, spacing, typography, etc. Never use arbitrary values or raw Tailwind colors.

## Class Ordering

1. Layout (flex, grid, display, position)
2. Sizing (w-, h-, p-, m-)
3. Typography (text-, font-)
4. Visual (bg-, border-, shadow-)
5. Interactive (hover:, focus:, active:)

## Rules

- **ONLY use design tokens** — never raw Tailwind colors (`bg-blue-600` ❌)
- Use semantic tokens: `bg-primary`, `text-foreground`, `border-default`
- Mobile-first responsive design (base → sm: → md: → lg: → xl:)
- Extract repeated patterns to components, not `@apply`
- Avoid arbitrary values (`[#fff]`, `[20px]`) — define in `@theme` instead
- Group related classes with line breaks for readability
- Group container query classes (`@container`, `@sm:`, `@md:`, `@lg:`, etc.) together on their own line for readability

## Figma Export Workflow

1. **Extract design tokens first** — parse Figma tokens for colors, typography, spacing, shadows; map to `@theme` variables; never hardcode values from the design system
2. **Component structure** — match Figma component hierarchy; use semantic naming from Figma layers (e.g., "PrimaryButton" → `btn-ds-primary`); preserve auto-layout as flexbox/grid
3. **Responsive behavior** — check Figma frames for breakpoint variants; map to Tailwind breakpoints; use container queries for component-level responsiveness

## Style Mapping Priority

1. Design system component → use existing component
2. Design tokens → map to `@theme` variables
3. Spacing/sizing → use Tailwind spacing scale (or custom tokens)
4. Colors → reference `--color-*` variables, never hex directly
5. Typography → use font size/weight/line-height from design system
6. Shadows/borders → map to design system utilities

## Anti-Patterns

- ❌ `bg-[#3B82F6]` → ✅ `bg-ds-primary` or `bg-[var(--color-primary)]`
- ❌ Arbitrary values without design system basis
- ❌ Mixing Tailwind v3 config patterns in v4 projects
- ❌ Ignoring Figma constraints (min/max widths, fixed dimensions)
