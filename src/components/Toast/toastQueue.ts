"use client";

import { UNSTABLE_ToastQueue as ToastQueue } from "react-aria-components";
import { flushSync } from "react-dom";

import type { AppToastContent } from "./Toast.types.ts";

/** Apple-like defaults: auto-dismiss after ~6s, stack a few at most. */
const DEFAULT_TIMEOUT = 6000;
const MAX_VISIBLE_TOASTS = 4;

function animationsSupported(): boolean {
  return (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Global toast queue — a module singleton so `notify()` can be called from any
 * client code without threading context.
 *
 * `wrapUpdate` routes every add/remove/reflow through the View Transitions API
 * so banners slide in, slide out, and the stack re-flows smoothly — this is the
 * mechanism react-aria's toast is built to animate through (styled in
 * `styles/utilities/toast.css`). We degrade to a plain synchronous update when
 * the API is unavailable or the user prefers reduced motion.
 */
export const toastQueue = new ToastQueue<AppToastContent>({
  maxVisibleToasts: MAX_VISIBLE_TOASTS,
  wrapUpdate(fn) {
    if (animationsSupported()) {
      // The synchronous flush is required so the DOM mutation lands inside the
      // transition's snapshot — the documented react-aria toast pattern.
      // eslint-disable-next-line @eslint-react/dom/no-flush-sync -- required by the RAC toast view-transition pattern
      document.startViewTransition(() => flushSync(fn));
    } else {
      fn();
    }
  },
});

export interface NotifyOptions {
  /** Auto-dismiss delay in ms. Defaults to 6000. */
  readonly timeout?: number;
  /** Called when the toast leaves the queue (dismissed or timed out). */
  readonly onClose?: () => void;
}

/**
 * Queue an Apple-style notification. Returns the toast key so callers can
 * programmatically dismiss it via `toastQueue.close(key)`. The timestamp is
 * resolved here (an event-time call) so the render stays pure.
 */
export function notify(
  content: AppToastContent,
  { timeout = DEFAULT_TIMEOUT, onClose }: NotifyOptions = {},
): string {
  const payload: AppToastContent = {
    ...content,
    date: content.date ?? new Date(),
  };
  return toastQueue.add(payload, { timeout, onClose });
}
