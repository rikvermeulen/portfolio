export interface AvatarProps {
  /** Used for the image alt text and the initial shown when no image loads. */
  readonly name: string;
  /** Image URL. Falls back to the name's initial when absent or it fails. */
  readonly src?: string;
  /** Rendered size in pixels (square). Defaults to 40. */
  readonly size?: number;
  /** Corner style. Defaults to a full circle. */
  readonly shape?: "circle" | "rounded";
  /** Extra classes for the wrapper. */
  readonly className?: string;
}
