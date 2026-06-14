# Testing Rules

## Philosophy

Split tests into two complementary approaches:

### Jest (.test.tsx)

Fast, automated unit tests for:

- Props passthrough to underlying elements
- Custom className merging with base classes
- Type attribute handling (submit, reset, button)
- Integration with utility components (Slot, etc.)
- Variant class application (smoke tests)
- Custom HTML attributes (data-_, aria-_)
- Ref forwarding
- Edge cases (undefined props, null children, etc.)

Do NOT test in Jest: user clicks, keyboard navigation, visual appearance, a11y audits, focus states.

### Storybook (.stories.tsx with play functions)

Visual and interaction testing for:

- Click interactions (`userEvent.click`)
- Keyboard navigation (Tab, Enter, Space)
- Focus states and management
- Disabled state verification
- Accessibility (aria-labels, roles, screen reader text)
- Loading states with visual feedback
- Hover states and animation behaviors
- Visual regression (Chromatic or Percy)

Do NOT test in Storybook: props merging logic, ref forwarding mechanics, edge cases with unusual prop combos, internal utility behavior.

## Query Priority (Testing Library)

1. `getByRole` — most accessible (buttons, links, headings)
2. `getByLabelText` — forms with labels
3. `getByPlaceholderText` — forms without labels
4. `getByText` — non-interactive content
5. `getByTestId` — last resort only

## Best Practices

- Arrange–Act–Assert pattern
- Test user behavior, not implementation details
- Mock sparingly — prefer real implementations
- Aim for 100% coverage on critical paths and business logic

## Coverage Requirements

- 100% enforced for `src/utils/**`, `src/lib/**`, `src/hooks/**`
- Components tested where appropriate, no 100% threshold required

## Commands

```bash
npm test                      # all tests
npm run test:watch            # watch mode
npm run test:functions        # utils/lib/hooks only (100% enforced)
npm run test:components       # components only
npm run storybook             # start Storybook
npm run test-storybook        # run Storybook play functions in CI
```
