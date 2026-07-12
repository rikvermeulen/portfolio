"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_FEEDBACK_MS = 2000;

export interface UseCopyFeedbackReturn {
  readonly copied: boolean;
  readonly copy: (text: string) => Promise<void>;
}

export function useCopyFeedback(
  feedbackMs = DEFAULT_FEEDBACK_MS,
): UseCopyFeedbackReturn {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current);
    },
    [],
  );

  async function copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), feedbackMs);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently ignore.
    }
  }

  return { copied, copy };
}
