# Object literals and spreads

Apply when building plain objects, composing return values, or passing props to
React components and JSX.

## Default: prefer explicit properties

Prefer a single object literal with **named properties** (including shorthand)
over stitching objects with **conditional spreads** that only exist to
optionally add keys.

### Avoid (conditional spread only to add keys)

```ts
// Harder to read; spread is not buying clarity here
const props = {
  test,
  ...(test2 ? { test2 } : {}),
};

return <MyComponent test={test} {...(test2 ? { test2 } : {})} />;
```

### Prefer

Use one object with explicit keys. If a value may be absent, it is usually
clearer to still list the key and pass `undefined` when the consumer should
ignore it (typical for React optional props), or to branch once and return two
small literals.

```ts
const props = { test, test2 };

// When you truly omit the key in one branch:
const props2 = test2 != null ? { test, test2 } : { test };

return <MyComponent test={test} test2={test2} />;
```

Pick the variant that matches how the callee treats `undefined` vs a missing
key; the point is to **avoid** `...(condition ? { k: v } : {})` style when a
straight property list or a small ternary between two object literals is enough.

## When spreading is appropriate

Spreading is fine when it serves a real merge or decomposition purpose, for
example:

- Merging objects: `{ ...defaultOptions, ...userOptions }`
- Rest / omit: `const { id, ...rest } = row`
- Forwarding a props bag already in a variable: `<Child {...childProps} />`
  where `childProps` is a normal object, not a chain of conditional fragments

Do **not** use spread as a substitute for an explicit property list when the
only goal is to conditionally include one or two keys.
