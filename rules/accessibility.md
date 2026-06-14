# Accessibility Rules

## Must Implement

- Use semantic HTML (nav, main, article, section, header, footer, etc.)
- Prefer native HTML elements over custom interactive elements; if custom UI is
  necessary, provide the correct ARIA role, state, and keyboard behavior
- Include proper labels or accessible names for icon-only buttons and ambiguous
  controls
- Ensure full keyboard navigation with a logical tab order
- Manage focus visibility and focus movement on open/close and dynamic UI
  updates
- Maintain color contrast ratios at WCAG AA minimum
- Form labels must use `htmlFor` attribute linked to input `id`
- Include `alt` text for all images; use `alt=""` for decorative images
- Support screen readers with proper ARIA attributes (`role`, `aria-*`) and
  state updates (`aria-expanded`, `aria-selected`, `aria-checked`,
  `aria-disabled`, etc.)
- Use `aria-describedby` to connect helper text and error text where relevant
- Announce dynamic status changes with live regions when the UI changes without
  moving focus
- Hide decorative elements from assistive technology
- Follow a logical heading hierarchy (h1 → h2 → h3, no skipping)
- Use real list markup (`ul`/`ol`/`li`) for lists and groups when applicable
- Provide clear, accessible error feedback on form fields
- Ensure interactive targets are at least 44x44px, or document which parent
  element owns that target size
- Ensure content remains usable at 400% zoom without horizontal scrolling where
  reflow is expected
- Respect `prefers-reduced-motion`
- Do not rely on color alone to communicate meaning
- Check high-contrast / `forced-colors` behavior for components that convey
  state visually
- Prefer React Aria primitives when they materially improve accessibility and
  match project conventions

## Rich Text Output Rules

- Do not emit empty content elements: `<p></p>`, `<ul></ul>`, `<li></li>`. Remove or collapse them so output contains meaningful content.
- Use `<hr>` only as a structural separator between thematic sections; do not use it purely for visual spacing or decoration.
- Avoid consecutive line breaks: do not output more than one consecutive `<br>`; prefer paragraphs or CSS spacing instead.
- Use `lang` attributes: when content (a section or element) is in a different language than the document, add `lang="..."` with the proper BCP 47 value (e.g., `lang="fr"`).
- Prefer `<b>` / `<i>` for purely visual styling; reserve `<strong>` / `<em>` for semantic emphasis and accessibility cues.

When adding a `lang` attribute, ensure any language-specific formatting or screen-reader pronunciation is considered.

## Component Checklist

When building interactive components:

- [ ] Keyboard operable (Tab to reach, Enter/Space to activate)
- [ ] Focus visible and not hidden by `outline: none` without replacement
- [ ] Focus order and focus restoration behave correctly
- [ ] ARIA role and state reflect current UI state (`aria-expanded`, `aria-selected`, etc.)
- [ ] Helper text, errors, and status messages are announced correctly
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Works at 400% zoom / reflow where applicable
- [ ] Touch targets are large enough, or the owning interactive parent is
      clearly defined
- [ ] High-contrast / `forced-colors` mode remains usable
- [ ] Color is not the only means of conveying information

## Testing

- Use Storybook a11y checks and `axe-core`-style audits to catch violations in
  the browser
- Resolve `eslint-plugin-jsx-a11y` issues when the project uses it
- Verify with keyboard-only navigation in every interactive story
- Test with a screen reader for complex components (modals, comboboxes, tabs,
  dialogs)
- Check error, loading, and state-change announcements on components with
  dynamic feedback
- Test high-contrast / `forced-colors` behavior for stateful or icon-driven UI
