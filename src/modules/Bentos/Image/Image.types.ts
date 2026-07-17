import type { BentoSizedProps } from "@/components/Bento/index.ts";

export interface ImageProps extends BentoSizedProps {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  readonly fit?: "cover" | "contain";
  readonly className?: string;
  readonly surfaceClassName?: string;
}
