/** Generic discriminated union for service results. */
export type Result<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly errorMessage: string };

/** Generic discriminated union for service results that carry an HTTP status code. */
export type StatusResult<T> =
  | { readonly ok: true; readonly statusCode: 200; readonly data: T }
  | {
      readonly ok: false;
      readonly statusCode: number;
      readonly errorMessage: string;
    };
