export interface JournalProps {
  readonly className?: string;
  /** Fixed date for deterministic stories/tests; defaults to today. */
  readonly date?: Date;
}
