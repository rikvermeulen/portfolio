# Project Rules

> Apply these rules when no project-specific rules are defined locally.

You are an expert frontend developer specializing in React 19, Tailwind 4, and TypeScript.

## Core Technologies

- React 19
- Next.js 15/16
- TypeScript (strict mode)
- Tailwind CSS 4

## TypeScript

- Always use TypeScript with strict mode
- Prefer `interface` for object shapes, `type` for unions/compositions
- NEVER use `any` — use `unknown` or proper types
- Avoid type assertions (`as`) — use type guards or validation instead
- Treat API payloads, `JSON.parse` output, env vars, database rows, files, queue
  payloads, and third-party responses as untrusted until validated
- Prefer discriminated unions over loose optional-state objects
- Keep transport shapes separate from trusted domain models when crossing
  boundaries
- Enable `noUncheckedIndexedAccess` for array safety
- Use generics for reusable functions, hooks, and components
- Leverage utility types (`Partial`, `Pick`, `Omit`, `Record`) over manual rewrites
- Use mapped types for dynamic type variations when appropriate

## React & Next.js

- **Default to Server Components** — only use `"use client"` when absolutely necessary:
  - Event handlers (onClick, onChange, etc.)
  - React hooks (useState, useEffect, useContext)
  - Browser APIs (localStorage, window, document)
  - Third-party libraries that require client-side rendering
- Minimize `useEffect` — prefer Server Components, Server Actions, or derived state
- Implement proper cleanup in `useEffect` when side effects are necessary
- Use Server Actions for mutations (mark with `"use server"`)
- Use dynamic imports (`next/dynamic`) for non-critical components
- Implement proper loading states with `loading.tsx` and Suspense boundaries
- Use `error.tsx` for route-level error handling
- Async Server Components should handle their own data fetching
- Use parallel data fetching — don't waterfall requests
- Use proper `key` props in lists — avoid using array index as key
- Use URL query parameters for filterable/paginated state so URLs remain shareable and bookmarkable

### Memoization

When React Compiler (`babel-plugin-react-compiler` or `react-compiler`) is
present: skip manual `React.memo`, `useCallback`, and `useMemo` — the compiler
handles memoization automatically.

When React Compiler is **not** present: use `useCallback`, `useMemo`, and
`React.memo` intentionally for measurable performance gains — not preventively.

## Component Design

- Guideline: keep components under 200 lines (including types) — discuss with team before enforcing as hard limit
- Single responsibility per component
- Prefer component composition (children, render props, compound components) over passing props through 3+ levels
- Prefer compound components for complex UI patterns
- Extract shared logic into custom hooks only when the **purpose** is the same across call sites — not just because code looks similar
- Props must have explicit TypeScript interfaces
- Prefer explicit object literals for props and options over conditional spreads
  that only add optional keys (`...(cond ? { k: v } : {})`); see `rules/object-literals.md`
- Use discriminated unions for conditional props
- Define components using the `function` keyword — no `React.FC`
- Avoid unnecessary client components; wrap client components in Suspense with a fallback when they perform async operations or lazy-load content
- Define component interfaces and types in `types.ts` or `index.ts` — not in the component file

## File Naming & Organization

```
src/
├── app/          # Next.js App Router
├── components    # Reusable UI (Button, Input, etc.)
├── modules/      # Feature-specific component compositions
├── utils/        # Generic utility functions — project-agnostic, no business logic (e.g. debounce, formatDate)
├── lib/          # Project-specific utilities — project-aware helpers with no third-party coupling (e.g. a11yPreferences, fonts)
├── vendor/       # Third-party-coupled integration code (e.g. vendor/payload schemas and admin helpers)
├── config/       # App configuration
├── hooks/        # Custom React hooks (useXxx)
├── actions/      # Shared Server Actions used across features
├── types/        # Shared TypeScript types
└── styles/       # Global CSS, Tailwind config
```

### utils vs lib vs vendor

| Folder    | Rule                                                                                                     | Examples                                                               |
| --------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `utils/`  | Generic, project-agnostic. No imports from `@/` domain. Reusable across any project.                     | `debounce`, `formatDate`, `classnames`                                 |
| `lib/`    | Project-specific. May import domain types but no direct third-party SDK calls.                           | `a11yPreferences`, `fonts`                                             |
| `vendor/` | Third-party coupling is the point. Keep vendor-owned Payload CMS definitions, admin helpers, and adapters together here. | `vendor/payload/blocks`, `vendor/payload/collections`, `vendor/payload/fields`, `vendor/payload/components` |

- Components: `PascalCase.tsx` (UserProfile.tsx)
- Utilities: `camelCase.ts` (formatDate.ts)
- Hooks: `useCamelCase.ts` (useAuth.ts)
- Server Actions: `camelCaseAction.ts` (createUserAction.ts)
- Co-locate Server Actions with their feature when used only once; only promote to `actions/` when reused across features

## Naming & Formatting

Defer to the project's ESLint and Prettier config for all formatting. When no config is available, use these defaults:

- Two spaces for indentation; 80-character line limit
- Double quotes everywhere, including JSX attributes; always use semicolons
- Strict equality (`===`); spaces after keywords and around operators
- Trailing commas where possible; always parenthesize arrow-function parameters
- Curly braces for multi-line `if` statements; `else` on the same line as `}`
- Eliminate unused variables
- Event handlers: `handle*` (e.g., `handleSubmit`, `handleToggle`)
- Local event handlers and callbacks inside components use `const` arrow notation (e.g., `const handleToggle = () => {}`)
- Booleans: `isLoading`, `hasError`, `canSubmit`
- Custom hooks: `use*` (`useAuth`, `useForm`)
- `UPPERCASE` for environment variables, constants, and global config
- Full words preferred; allowed short forms: `err`, `req`, `res`, `props`, `ref`

## Function Style

- Named function declarations for exported functions and components
- Function declarations for Server Components and Server Actions
- Arrow function expressions for callbacks, event handlers, and small local utilities
- Inside components, prefer `const handleToggle = () => {}` over `function handleToggle() {}` for local handlers
- Avoid anonymous exports; exported APIs must be named
- Avoid inline function definitions in JSX — extract to named `const handle*` handlers or constants
- No `React.FC`
- Extract helpers when functions grow beyond ~50 lines or multiple responsibilities
- Annotate parameters on exported functions; add return types only when inference is non-obvious
- Use early returns to improve legibility and prevent unnecessary execution of logic

## Props Destructuring

- Always destructure props directly in function parameters
- `function MyComponent({ title, onClose, items }) {`
- Only use `const { } = props` when you need access to the full props object
- Use default values in parameters: `{ title = "Default" }`

## Error Handling & Validation

- Use Zod for schema validation and clear error messages
- Validate boundary data close to the edge, then map it into trusted domain
  types before passing it deeper into the app
- Add error boundaries with user-friendly fallbacks for client trees
- Always handle error parameters in callbacks — don't silently ignore them

## Internationalization

- Implement locale detection where relevant
- Format numbers, dates, and currencies appropriately; support RTL if needed

## Forbidden Patterns

- ❌ Use `any` type
- ❌ Use `as` type assertions without justification
- ❌ Create client components unnecessarily
- ❌ Use inline styles instead of Tailwind
- ❌ Create components over 200 lines
- ❌ Use Shadcn UI, Radix UI, or similar full component libraries

## Documentation

- Use JSDoc for public APIs; include examples where helpful
- Keep docs concise, correct punctuation, headings, lists, links
