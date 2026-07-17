/**
 * Radius ladder — the single source of truth for corner geometry, mirrored by
 * the `--radius-*` tokens in `styles/theme.css` (rem = px ÷ 16).
 *
 * The steps are concentric for tight nesting: a parent at radius R padded by P
 * nests a child at R − P, so their corners share a centre (the iOS
 * "continuous" feel) — tile(24) − 8 = card(16) − 4 = control(12) − 4 = field(8).
 * Fully rounded controls (capsules / circles) use `pill` and the `rounded-full`
 * utility.
 *
 * Class-based surfaces use the Tailwind utilities (`rounded-tile`,
 * `rounded-card`, …); the `Glass` layer takes a numeric radius, so it reads the
 * same values from here — one ladder, two forms.
 */
export const RADIUS = {
  field: 8,
  control: 12,
  card: 16,
  tile: 24,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof RADIUS;
