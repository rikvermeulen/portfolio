import type { BentoSizedProps } from "@/components/Bento/index.ts";

export interface JournalProps extends BentoSizedProps {
  readonly className?: string;
  readonly date?: Date;
}
