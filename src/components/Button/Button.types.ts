/** Filled (`prominent`) or clear frosted (`glass`) liquid-glass material. */
export type ButtonVariant = "glass" | "prominent";

/** Colour intent, following iOS system accents. */
export type ButtonTone = "neutral" | "accent" | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly tone?: ButtonTone;
  readonly size?: ButtonSize;
  /** Render as a circular icon-only control (equal padding, semibold glyph). */
  readonly iconOnly?: boolean;
  /**
   * Paint the capsule onto the single child element instead of a native
   * `<button>` — e.g. an `<a>` or `<Link>`. The glass and label render inside
   * that element, keeping Button element-agnostic.
   */
  readonly asChild?: boolean;
}
