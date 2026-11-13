/**
 * Generic discriminated union for service results.
 */
export type Result<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly errorMessage: string };
