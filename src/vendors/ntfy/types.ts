/** Result of an ntfy publish. `skipped` means ntfy isn't configured. */
export type NtfySendResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly skipped: true }
  | { readonly ok: false; readonly skipped: false; readonly error: string };
