/** What actually happened when the user tried to share. */
export type ShareOutcome =
  /** The native share sheet completed. */
  | "shared"
  /** No share support — the text was copied to the clipboard instead. */
  | "copied"
  /** The user dismissed the native share sheet. */
  | "cancelled"
  /** Neither sharing nor the clipboard fallback worked. */
  | "failed";

export interface UseShareReturn {
  readonly shared: boolean;
  readonly share: (data: ShareData) => Promise<ShareOutcome>;
}
