import type { ReactNode } from "react";

export interface AdaptiveTextProps {
  /** Text content. Any inline content works; a plain string is typical. */
  children: ReactNode;
  /** Forwarded to the wrapper; use it for font size/weight/tracking. */
  className?: string;
  /** Foreground used over dark backdrops. Defaults to white. */
  light?: string;
  /** Foreground used over light backdrops. Defaults to black. */
  dark?: string;
}
