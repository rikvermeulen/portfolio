# Clean Architecture Principles

Applies to all projects regardless of folder naming or tech stack. These
principles define _what_ belongs where — stack rules define _how_ to express
this in a given project's actual folder structure.

---

## The Four Layers

Dependencies flow **inward only**. Outer layers depend on inner layers. Inner
layers never know outer layers exist.

```
Presentation  →  Application  →  Infrastructure  →  Domain
   (outer)                                           (inner)
```

### Domain

The core of the application. Framework-free, side-effect-free.

- Business entities and their invariants
- Interfaces (repository contracts, service ports)
- Pure functions operating on entities
- Shared value types and enums

**Must not import from:** Application, Infrastructure, Presentation, or any
framework package (React, Next.js, Expo, etc.).

### Application

Orchestrates use cases. Coordinates domain logic and infrastructure.

- Use case implementations (one use case per function/hook/action)
- Custom hooks that encode a single business operation
- Server Actions (in Next.js these are the application/infrastructure boundary)
- Application-level state (not UI state, not domain entities directly)

**Must not import from:** Presentation.
**May import from:** Domain, Infrastructure (via domain interfaces).

### Infrastructure

Adapts the outside world to the application's needs.

- API clients and fetch utilities
- Database/CMS query adapters (e.g. Payload collections, Prisma calls)
- Storage adapters (AsyncStorage, localStorage, cookies)
- Third-party service integrations (analytics, auth providers, notifications)
- Cache strategies

**Must not import from:** Presentation.
**May import from:** Domain (to implement its interfaces).

### Presentation

Renders UI. Thin layer — no business logic.

- React components and screens
- Navigation configuration
- Page/route files
- UI-only state (open/closed, active tab, scroll position)

**Must not import from:** Infrastructure directly.
**May import from:** Application (hooks, actions), Domain (types only).

---

## Dependency Rule — Summary

| Layer          | May import from             |
| -------------- | --------------------------- |
| Domain         | nothing outside Domain      |
| Infrastructure | Domain only                 |
| Application    | Domain, Infrastructure      |
| Presentation   | Application, Domain (types) |

---

## Forbidden Patterns

These are violations regardless of how folders are named.

### Business logic in UI files

```tsx
// ❌ calculation/validation inside a component
function OrderSummary({ items }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = total > 100 ? total * 0.21 : 0;
  return <div>{total + tax}</div>;
}

// ✅ use case in application layer, component is a thin shell
function OrderSummary({ items }) {
  const { total, tax } = useOrderTotal(items);
  return <div>{total + tax}</div>;
}
```

### Direct infrastructure calls from UI

```tsx
// ❌ API call directly in a component or screen
function UserProfile({ id }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then(setUser);
  }, [id]);
}

// ✅ application hook wraps the infrastructure call
function UserProfile({ id }) {
  const { user } = useUser(id);
}
```

### Infrastructure importing from presentation

```ts
// ❌ an API client referencing a component
import { Toast } from "@/components/Toast";

// ✅ infrastructure returns data/errors; presentation decides how to show them
```

### Domain importing from outer layers

```ts
// ❌ a domain entity importing a fetch utility
import { apiFetch } from "@/lib/api";

// ✅ domain entities have zero external imports
```

### Raw UI state used as domain state

```tsx
// ❌ domain entity stored directly in useState inside a component
const [cart, setCart] = useState<CartItem[]>([]);

// ✅ domain state lives in an application-layer hook or store
const { cart, addItem, removeItem } = useCart();
```

---

## Boundary Rules

- Data transformations (API response → domain entity, domain entity → view
  model) happen **at layer edges**, not inside components or deep inside
  infrastructure.
- Types defined in Domain are the only types that flow freely across all layers.
  Infrastructure-specific types (raw API responses, ORM models) must be
  transformed before crossing into Application or Presentation.
- Side effects (network, storage, notifications) are always initiated from
  Application or Infrastructure — never from Domain.

---

## When Reviewing Code

Apply these principles against the project's **actual folder structure** — do
not assume canonical folder names. Map the detected folders to layers first
(see `stacks/` rules or use the architecture-review skill), then check
violations against the mapping.
