"use client";

// Client so Button's asChild receives a real <a> element; from a server parent it arrives as an RSC reference and falls back to <button> (hydration mismatch).
import type { SkipLinkProps } from "./SkipLink.types.ts";

import Button from "@/components/Button/index.ts";

export default function SkipLink({
  targetId = "main",
  children = "Skip to content",
}: SkipLinkProps) {
  return (
    <div className="pointer-events-none absolute top-4 left-1/2 z-9999 -translate-x-1/2 opacity-0 transition-opacity focus-within:pointer-events-auto focus-within:opacity-100">
      <Button asChild size="sm" tone="accent" variant="prominent">
        <a href={`#${targetId}`}>{children}</a>
      </Button>
    </div>
  );
}
