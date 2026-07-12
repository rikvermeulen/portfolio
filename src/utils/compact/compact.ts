/**
 * Removes falsy values (`null`, `undefined`, `""`, `0`, `false`) from an array
 * and narrows the result to the non-nullable element type.
 */
export function compact<T>(values: readonly T[]): NonNullable<T>[] {
  return values.filter((value): value is NonNullable<T> => Boolean(value));
}
