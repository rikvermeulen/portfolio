import type { JournalProps } from "./Journal.types.ts";

// Fixed date keeps the story deterministic for visual regression.
export const mockJournalProps: JournalProps = {
  date: new Date(2026, 6, 12),
};
