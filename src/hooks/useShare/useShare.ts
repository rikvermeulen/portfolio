"use client";

import { useEffect, useRef, useState } from "react";

import type { ShareOutcome, UseShareReturn } from "./useShare.types.ts";

const DEFAULT_FEEDBACK_MS = 2000;

/** Detect the Web Share API without touching it during SSR. */
function supportsShare(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

/** Build the clipboard text from share data, preferring text then url. */
function toClipboardText(data: ShareData): string {
  return [data.text, data.url].filter(Boolean).join(" ").trim();
}

export function useShare(feedbackMs = DEFAULT_FEEDBACK_MS): UseShareReturn {
  const [shared, setShared] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current);
    },
    [],
  );

  function flash(): void {
    setShared(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShared(false), feedbackMs);
  }

  async function share(data: ShareData): Promise<ShareOutcome> {
    if (supportsShare()) {
      try {
        await navigator.share(data);
        flash();
        return "shared";
      } catch (error) {
        // The user dismissing the share sheet is a cancel, not a failure.
        if (error instanceof DOMException && error.name === "AbortError") {
          return "cancelled";
        }
        // Fall through to the clipboard for any other share failure.
      }
    }

    try {
      await navigator.clipboard.writeText(toClipboardText(data));
      flash();
      return "copied";
    } catch {
      return "failed";
    }
  }

  return { shared, share };
}
