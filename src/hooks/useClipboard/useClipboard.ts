"use client";

import { useEffect, useRef, useState } from "react";

import type { UseClipboardReturn } from "./useClipboard.types.ts";

const DEFAULT_FEEDBACK_MS = 2000;

export function useClipboard(
  feedbackMs = DEFAULT_FEEDBACK_MS,
): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current);
    },
    [],
  );

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), feedbackMs);
      return true;
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently ignore.
      return false;
    }
  }

  return { copied, copy };
}
