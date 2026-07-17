import type { SkipLinkProps } from "./SkipLink.types.ts";

import Button from "@/components/Button/index.ts";

/**
 * Keyboard bypass link (WCAG 2.4.1). Sits first in the tab order, translated
 * off-screen until it receives focus, then slides into the top-center of the
 * viewport and jumps focus to the page's main landmark. Painted as a
 * liquid-glass `Button` capsule.
 */
export default function SkipLink({
  targetId = "main",
  children = "Skip to content",
}: SkipLinkProps) {
  return (
    <Button
      asChild
      size="sm"
      tone="accent"
      variant="prominent"
      className="absolute top-4 left-1/2 z-9999 -translate-x-1/2 -translate-y-24 focus:translate-y-0"
    >
      <a href={`#${targetId}`}>{children}</a>
    </Button>
  );
}
