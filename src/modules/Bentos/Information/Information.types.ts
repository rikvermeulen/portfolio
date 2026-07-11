import type { BentoIconPosition } from "@/components/Bento/index.ts";

export type IconPosition = BentoIconPosition;

export interface InformationProps {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly linkLabel: string;
  readonly iconSrc?: string;
  readonly iconAlt?: string;
  readonly iconPosition?: IconPosition;
  readonly className?: string;
}
